// AUI desktop: the website in its own window. The app and the model live on the website
// (and in the browser cache), so the desktop shell stays small and the app updates when the
// site does. Nothing here gives the page access to Node or to the file system.
const { app, BrowserWindow, Menu, shell, session, screen } = require("electron");
const fs = require("node:fs");
const path = require("node:path");

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

// WebGPU runs the model. It is behind a flag on some platforms.
app.commandLine.appendSwitch("enable-unsafe-webgpu");
app.commandLine.appendSwitch("enable-features", "Vulkan,WebGPU");

const gotLock = app.requestSingleInstanceLock();
if (!gotLock) {
  app.quit();
} else {
  app.on("second-instance", () => {
    const [window] = BrowserWindow.getAllWindows();
    if (window) {
      if (window.isMinimized()) window.restore();
      window.focus();
    }
  });
}

const stateFile = () => path.join(app.getPath("userData"), "window.json");
function loadBounds() {
  try {
    const saved = JSON.parse(fs.readFileSync(stateFile(), "utf8"));
    const visible = screen.getAllDisplays().some(({ workArea: a }) => saved.x >= a.x - 20 && saved.y >= a.y - 20 && saved.x < a.x + a.width - 100 && saved.y < a.y + a.height - 100);
    return { width: Math.max(480, saved.width | 0), height: Math.max(520, saved.height | 0), ...(visible ? { x: saved.x, y: saved.y } : {}), maximized: Boolean(saved.maximized) };
  } catch {
    return { width: 1280, height: 860, maximized: false };
  }
}
function saveBounds(window) {
  try {
    fs.writeFileSync(stateFile(), JSON.stringify({ ...window.getNormalBounds(), maximized: window.isMaximized() }));
  } catch {}
}

function createWindow() {
  const bounds = loadBounds();
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
    webPreferences: { contextIsolation: true, nodeIntegration: false, sandbox: true, spellcheck: true }
  });
  if (bounds.maximized) window.maximize();
  window.once("ready-to-show", () => window.show());
  window.on("close", () => saveBounds(window));

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

  Menu.setApplicationMenu(Menu.buildFromTemplate([
    ...(process.platform === "darwin" ? [{ role: "appMenu" }] : []),
    { label: "File", submenu: [{ label: "New window", accelerator: "CmdOrCtrl+Shift+N", click: createWindow }, { type: "separator" }, process.platform === "darwin" ? { role: "close" } : { role: "quit" }] },
    { role: "editMenu" },
    { label: "View", submenu: [{ role: "reload" }, { role: "forceReload" }, { type: "separator" }, { role: "resetZoom" }, { role: "zoomIn" }, { role: "zoomOut" }, { type: "separator" }, { role: "togglefullscreen" }, ...(app.isPackaged ? [] : [{ role: "toggleDevTools" }])] },
    { role: "windowMenu" },
    { label: "Help", submenu: [{ label: "AUI help", click: () => shell.openExternal(new URL("../help.html", APP_URL).href) }, { label: "Report a problem", click: () => shell.openExternal("https://github.com/usernam69/AUI/issues/new") }] }
  ]));
  createWindow();
  app.on("activate", () => { if (!BrowserWindow.getAllWindows().length) createWindow(); });
});

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") app.quit();
});
