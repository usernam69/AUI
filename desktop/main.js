// AUI desktop: the website in its own window. The app and the model live on the website
// (and in the browser cache), so the desktop shell stays small and the app updates when the
// site does. Nothing here gives the page access to Node or to the file system. The page gets
// a few narrow calls through preload.js: take a screenshot, read what the shell reports,
// and hear about quick asks and updates.
const { app, BrowserWindow, Menu, Tray, shell, session, screen, globalShortcut, ipcMain, desktopCapturer, clipboard, nativeImage } = require("electron");
const fs = require("node:fs");
const path = require("node:path");

let autoUpdater = null;
try { ({ autoUpdater } = require("electron-updater")); } catch { /* running from source without the dependency */ }

const APP_URL = process.env.AUI_URL || "https://usernam69.github.io/AUI/chat/";
const APP_ORIGIN = new URL(APP_URL).origin;

// Pages the window may show. Sign-in with Google and Supabase happens in the window itself.
const INSIDE_HOSTS = [/^accounts\.google\.com$/, /(^|\.)gstatic\.com$/, /^cxulgeojkjnskdyoktkj\.supabase\.co$/];
const isInside = url => {
  try {
    const parsed = new URL(url);
    return parsed.origin === APP_ORIGIN || (parsed.protocol === "https:" && INSIDE_HOSTS.some(host => host.test(parsed.hostname)));
  } catch {
    return false;
  }
};
// Calls from the page are only trusted when they come from AUI itself.
const fromApp = event => {
  try { return new URL(event.senderFrame?.url || event.sender.getURL()).origin === APP_ORIGIN; } catch { return false; }
};

// WebGPU runs the model. It is behind a flag on some platforms.
app.commandLine.appendSwitch("enable-unsafe-webgpu");
app.commandLine.appendSwitch("enable-features", "Vulkan,WebGPU");

const gotLock = app.requestSingleInstanceLock();
if (!gotLock) {
  app.quit();
} else {
  app.on("second-instance", () => showMain());
}

// --- options kept next to the window position ---

const DEFAULTS = { hotkey: "CommandOrControl+Shift+Space", askHotkey: "CommandOrControl+Shift+A", tray: true, closeToTray: true, startAtLogin: false };
const dataFile = name => path.join(app.getPath("userData"), name);
let options = { ...DEFAULTS };
function loadOptions() {
  try {
    const saved = JSON.parse(fs.readFileSync(dataFile("options.json"), "utf8"));
    options = {
      hotkey: typeof saved.hotkey === "string" && saved.hotkey.length < 60 ? saved.hotkey : DEFAULTS.hotkey,
      askHotkey: typeof saved.askHotkey === "string" && saved.askHotkey.length < 60 ? saved.askHotkey : DEFAULTS.askHotkey,
      tray: saved.tray !== false,
      closeToTray: saved.closeToTray !== false,
      startAtLogin: Boolean(saved.startAtLogin)
    };
  } catch { /* first run */ }
}
function saveOptions() {
  try { fs.writeFileSync(dataFile("options.json"), JSON.stringify(options)); } catch { /* read-only profile */ }
}

function loadBounds() {
  try {
    const saved = JSON.parse(fs.readFileSync(dataFile("window.json"), "utf8"));
    const visible = screen.getAllDisplays().some(({ workArea: a }) => saved.x >= a.x - 20 && saved.y >= a.y - 20 && saved.x < a.x + a.width - 100 && saved.y < a.y + a.height - 100);
    return { width: Math.max(480, saved.width | 0), height: Math.max(520, saved.height | 0), ...(visible ? { x: saved.x, y: saved.y } : {}), maximized: Boolean(saved.maximized) };
  } catch {
    return { width: 1280, height: 860, maximized: false };
  }
}
function saveBounds(window) {
  try {
    fs.writeFileSync(dataFile("window.json"), JSON.stringify({ ...window.getNormalBounds(), maximized: window.isMaximized() }));
  } catch { /* nothing to do */ }
}

// --- the window ---

let mainWindow = null;
let tray = null;
let quitting = false;
// "Start with the computer" launches into the tray with the window hidden.
let startHidden = process.argv.includes("--hidden");
const hotkeyState = { hotkey: false, askHotkey: false };

function createWindow() {
  const bounds = loadBounds();
  const hidden = startHidden && Boolean(tray);
  startHidden = false;
  const window = new BrowserWindow({
    width: bounds.width,
    height: bounds.height,
    x: bounds.x,
    y: bounds.y,
    minWidth: 420,
    minHeight: 520,
    backgroundColor: "#0b1b45",
    title: "AUI",
    icon: path.join(__dirname, "build", "icon.png"),
    autoHideMenuBar: true,
    show: false,
    webPreferences: {
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: true,
      spellcheck: true,
      preload: path.join(__dirname, "preload.js"),
      additionalArguments: [`--aui-origin=${APP_ORIGIN}`]
    }
  });
  if (!mainWindow) mainWindow = window;
  if (bounds.maximized) window.maximize();
  window.once("ready-to-show", () => { if (!hidden) window.show(); });
  window.on("close", event => {
    if (window === mainWindow && !quitting && options.closeToTray && tray) {
      event.preventDefault();
      saveBounds(window);
      window.hide();
      return;
    }
    saveBounds(window);
  });
  window.on("closed", () => { if (window === mainWindow) mainWindow = null; });

  const web = window.webContents;
  // Links to other sites open in the normal browser; blank windows (printing) stay inside.
  web.setWindowOpenHandler(({ url }) => {
    if (url === "about:blank" || url === "") return { action: "allow" };
    if (isInside(url)) {
      window.loadURL(url);
    } else if (/^(https?|mailto):/i.test(url)) {
      shell.openExternal(url);
    }
    return { action: "deny" };
  });
  web.on("will-navigate", (event, url) => {
    if (isInside(url) || url.startsWith("file:") && url.includes("offline.html")) return;
    event.preventDefault();
    if (/^(https?|mailto):/i.test(url)) shell.openExternal(url);
  });
  web.on("did-fail-load", (_event, code, description, url, isMainFrame) => {
    if (!isMainFrame || code === -3) return; // -3 is a navigation that was cancelled on purpose
    window.loadFile(path.join(__dirname, "offline.html"), { query: { retry: APP_URL, why: description } });
  });
  window.loadURL(APP_URL);
  return window;
}

function showMain() {
  if (!mainWindow || mainWindow.isDestroyed()) {
    createWindow();
    return mainWindow;
  }
  if (mainWindow.isMinimized()) mainWindow.restore();
  mainWindow.show();
  mainWindow.focus();
  return mainWindow;
}

function toggleMain() {
  if (mainWindow && !mainWindow.isDestroyed() && mainWindow.isVisible() && mainWindow.isFocused()) mainWindow.hide();
  else showMain();
}

// Hand the page something once it has finished loading.
function sendToPage(channel, value) {
  const window = showMain();
  const send = () => window.webContents.send(channel, value);
  if (window.webContents.isLoading()) window.webContents.once("did-finish-load", () => setTimeout(send, 600));
  else send();
}

// The copied text becomes a draft in the message box. It is never sent by itself.
function quickAsk() {
  const text = clipboard.readText().trim().slice(0, 4000);
  sendToPage("aui:quick-ask", text);
}

// --- global shortcuts ---

function registerHotkeys() {
  globalShortcut.unregisterAll();
  for (const [name, handler] of [["hotkey", toggleMain], ["askHotkey", quickAsk]]) {
    try {
      hotkeyState[name] = Boolean(options[name]) && globalShortcut.register(options[name], handler);
    } catch {
      hotkeyState[name] = false;
    }
  }
}

// --- screenshot to chat: grab the screen, let the person drag a rectangle, send back that part ---

const wait = ms => new Promise(resolve => setTimeout(resolve, ms));
let capturing = false;

function pickRegion(display, picture) {
  return new Promise(resolve => {
    const { x, y, width, height } = display.bounds;
    const picker = new BrowserWindow({
      x, y, width, height, frame: false, resizable: false, movable: false, skipTaskbar: true, alwaysOnTop: true, show: false, fullscreenable: false,
      backgroundColor: "#000000",
      webPreferences: { contextIsolation: true, nodeIntegration: false, sandbox: true, preload: path.join(__dirname, "selector-preload.js") }
    });
    let settled = false;
    const finish = rect => {
      if (settled) return;
      settled = true;
      ipcMain.removeListener("aui:region", onRegion);
      if (!picker.isDestroyed()) picker.close();
      resolve(rect);
    };
    const onRegion = (event, rect) => {
      if (event.sender !== picker.webContents) return;
      const ok = rect && [rect.x, rect.y, rect.width, rect.height].every(Number.isFinite) && rect.width >= 8 && rect.height >= 8;
      finish(ok ? rect : null);
    };
    ipcMain.on("aui:region", onRegion);
    picker.on("closed", () => finish(null));
    picker.setAlwaysOnTop(true, "screen-saver");
    picker.loadFile(path.join(__dirname, "selector.html"));
    picker.webContents.once("did-finish-load", () => {
      picker.webContents.send("aui:picture", picture.resize({ width }).toDataURL());
      picker.show();
      picker.focus();
    });
  });
}

async function captureRegion() {
  if (capturing) return null;
  capturing = true;
  const hadWindow = Boolean(mainWindow && !mainWindow.isDestroyed() && mainWindow.isVisible());
  try {
    const display = screen.getDisplayNearestPoint(screen.getCursorScreenPoint());
    if (hadWindow) { mainWindow.hide(); await wait(300); }
    const scale = display.scaleFactor || 1;
    const sources = await desktopCapturer.getSources({ types: ["screen"], thumbnailSize: { width: Math.round(display.size.width * scale), height: Math.round(display.size.height * scale) } });
    const source = sources.find(item => String(item.display_id) === String(display.id)) || sources[0];
    const picture = source?.thumbnail;
    if (!picture || picture.isEmpty()) throw new Error("AUI couldn't capture the screen. On macOS, allow screen recording for AUI in System Settings.");
    const rect = await pickRegion(display, picture);
    if (!rect) return null;
    const crop = picture.crop({ x: Math.round(rect.x * scale), y: Math.round(rect.y * scale), width: Math.round(rect.width * scale), height: Math.round(rect.height * scale) });
    const image = crop.getSize().width > 1600 ? crop.resize({ width: 1600 }) : crop;
    return `data:image/jpeg;base64,${image.toJPEG(85).toString("base64")}`;
  } finally {
    capturing = false;
    if (hadWindow) showMain();
  }
}

async function screenshotToChat() {
  try {
    const dataUrl = await captureRegion();
    if (dataUrl) sendToPage("aui:screenshot", dataUrl);
  } catch (error) {
    sendToPage("aui:screenshot-error", String(error.message || error).slice(0, 200));
  }
}

// --- updates ---

let updateState = { state: "idle", version: "" };
function tellPage() {
  for (const window of BrowserWindow.getAllWindows()) if (isInside(window.webContents.getURL())) window.webContents.send("aui:update", updateState);
}
function setupUpdates() {
  if (!autoUpdater || !app.isPackaged) return;
  autoUpdater.autoDownload = true;
  autoUpdater.autoInstallOnAppQuit = true;
  autoUpdater.on("update-available", info => { updateState = { state: "downloading", version: String(info?.version || "") }; tellPage(); });
  autoUpdater.on("update-not-available", () => { updateState = { state: "current", version: app.getVersion() }; tellPage(); });
  autoUpdater.on("update-downloaded", info => { updateState = { state: "ready", version: String(info?.version || "") }; tellPage(); });
  autoUpdater.on("error", () => { updateState = { state: "error", version: "" }; tellPage(); });
  const check = () => autoUpdater.checkForUpdates().catch(() => {});
  setTimeout(check, 8000);
  setInterval(check, 6 * 60 * 60 * 1000);
}
function checkForUpdates() {
  if (!autoUpdater || !app.isPackaged) {
    updateState = { state: "unavailable", version: "" };
    tellPage();
    return updateState;
  }
  updateState = { state: "checking", version: "" };
  tellPage();
  autoUpdater.checkForUpdates().catch(() => { updateState = { state: "error", version: "" }; tellPage(); });
  return updateState;
}

// --- tray and menu ---

function applyLoginItem() {
  try { app.setLoginItemSettings({ openAtLogin: options.startAtLogin, args: ["--hidden"] }); } catch { /* not supported here */ }
}

function setOption(name, value) {
  if (name === "tray") options.tray = Boolean(value);
  else if (name === "closeToTray") options.closeToTray = Boolean(value);
  else if (name === "startAtLogin") { options.startAtLogin = Boolean(value); applyLoginItem(); }
  else return false;
  saveOptions();
  buildTray();
  buildMenu();
  return true;
}

function trayMenu() {
  return Menu.buildFromTemplate([
    { label: "Open AUI", click: showMain },
    { label: "Ask about the copied text", click: quickAsk },
    { label: "Screenshot to chat", click: screenshotToChat },
    { type: "separator" },
    { label: "Keep running when the window is closed", type: "checkbox", checked: options.closeToTray, click: item => setOption("closeToTray", item.checked) },
    { label: "Start with the computer", type: "checkbox", checked: options.startAtLogin, click: item => setOption("startAtLogin", item.checked) },
    { label: "Check for updates", click: checkForUpdates },
    { type: "separator" },
    { label: "Quit AUI", click: () => { quitting = true; app.quit(); } }
  ]);
}

function buildTray() {
  if (!options.tray) {
    tray?.destroy();
    tray = null;
    return;
  }
  if (!tray) {
    const icon = nativeImage.createFromPath(path.join(__dirname, "build", "icon.png")).resize({ width: 18, height: 18 });
    tray = new Tray(icon);
    tray.setToolTip("AUI");
    tray.on("click", toggleMain);
  }
  tray.setContextMenu(trayMenu());
}

function buildMenu() {
  Menu.setApplicationMenu(Menu.buildFromTemplate([
    ...(process.platform === "darwin" ? [{ role: "appMenu" }] : []),
    {
      label: "File",
      submenu: [
        { label: "New window", accelerator: "CmdOrCtrl+Shift+N", click: createWindow },
        { label: "Screenshot to chat", click: screenshotToChat },
        { type: "separator" },
        { label: "Show a tray icon", type: "checkbox", checked: options.tray, click: item => setOption("tray", item.checked) },
        { label: "Keep running when the window is closed", type: "checkbox", checked: options.closeToTray, click: item => setOption("closeToTray", item.checked) },
        { label: "Start with the computer", type: "checkbox", checked: options.startAtLogin, click: item => setOption("startAtLogin", item.checked) },
        { type: "separator" },
        { label: "Quit", accelerator: process.platform === "darwin" ? "Cmd+Q" : "Ctrl+Q", click: () => { quitting = true; app.quit(); } }
      ]
    },
    { role: "editMenu" },
    { label: "View", submenu: [{ role: "reload" }, { role: "forceReload" }, { type: "separator" }, { role: "resetZoom" }, { role: "zoomIn" }, { role: "zoomOut" }, { type: "separator" }, { role: "togglefullscreen" }, ...(app.isPackaged ? [] : [{ role: "toggleDevTools" }])] },
    { role: "windowMenu" },
    {
      label: "Help",
      submenu: [
        { label: "Check for updates", click: checkForUpdates },
        { label: "AUI help", click: () => shell.openExternal(new URL("../help.html", APP_URL).href) },
        { label: "Report a problem", click: () => shell.openExternal("https://github.com/usernam69/AUI/issues/new") }
      ]
    }
  ]));
}

// --- what the page may ask for ---

ipcMain.on("aui:version", event => { event.returnValue = fromApp(event) ? app.getVersion() : ""; });
ipcMain.handle("aui:status", event => {
  if (!fromApp(event)) return null;
  return { version: app.getVersion(), platform: process.platform, hotkey: options.hotkey, hotkeyWorks: hotkeyState.hotkey, askHotkey: options.askHotkey, askHotkeyWorks: hotkeyState.askHotkey, tray: Boolean(tray), closeToTray: options.closeToTray, startAtLogin: options.startAtLogin, update: updateState, canUpdate: Boolean(autoUpdater && app.isPackaged) };
});
ipcMain.handle("aui:capture", async event => {
  if (!fromApp(event)) return null;
  return captureRegion();
});
ipcMain.handle("aui:check-updates", event => (fromApp(event) ? checkForUpdates() : null));
ipcMain.handle("aui:install-update", event => {
  if (fromApp(event) && updateState.state === "ready") { quitting = true; autoUpdater.quitAndInstall(); }
});
ipcMain.handle("aui:set-option", (event, name, value) => (fromApp(event) ? setOption(String(name), value) : false));

if (gotLock) app.whenReady().then(() => {
  // Google refuses sign-in from windows that call themselves "Electron".
  const agent = session.defaultSession.getUserAgent().replace(/\s(Electron|aui-desktop)\/\S+/g, "");
  session.defaultSession.setUserAgent(agent);
  app.userAgentFallback = agent;

  // Microphone for voice input, clipboard for copy buttons, notifications for the timer.
  const allowed = new Set(["media", "clipboard-read", "clipboard-sanitized-write", "notifications", "fullscreen", "speaker-selection"]);
  session.defaultSession.setPermissionRequestHandler((contents, permission, callback) => {
    callback(allowed.has(permission) && isInside(contents.getURL()));
  });
  session.defaultSession.setPermissionCheckHandler((contents, permission) => allowed.has(permission) && isInside(contents?.getURL() || ""));

  loadOptions();
  buildMenu();
  buildTray();
  registerHotkeys();
  setupUpdates();
  createWindow();
  app.on("activate", () => showMain());
});

app.on("before-quit", () => { quitting = true; });
app.on("will-quit", () => globalShortcut.unregisterAll());
app.on("window-all-closed", () => {
  if (process.platform !== "darwin" && (quitting || !tray)) app.quit();
});
