// What AUI's own pages may call in the desktop shell. It is only exposed to the AUI site itself
// (not to Google's sign-in page, which also loads in this window), and every call is checked
// again in main.js.
const { contextBridge, ipcRenderer } = require("electron");

const originArg = process.argv.find(arg => arg.startsWith("--aui-origin="));
const origin = originArg ? originArg.slice("--aui-origin=".length) : "";

if (origin && location.origin === origin) {
  const listen = (channel, callback) => {
    const handler = (_event, value) => callback(value);
    ipcRenderer.on(channel, handler);
    return () => ipcRenderer.removeListener(channel, handler);
  };
  contextBridge.exposeInMainWorld("auiDesktop", {
    version: ipcRenderer.sendSync("aui:version"),
    status: () => ipcRenderer.invoke("aui:status"),
    captureRegion: () => ipcRenderer.invoke("aui:capture"),
    checkForUpdates: () => ipcRenderer.invoke("aui:check-updates"),
    installUpdate: () => ipcRenderer.invoke("aui:install-update"),
    setOption: (name, value) => ipcRenderer.invoke("aui:set-option", name, value),
    onQuickAsk: callback => listen("aui:quick-ask", callback),
    onScreenshot: callback => listen("aui:screenshot", callback),
    onScreenshotError: callback => listen("aui:screenshot-error", callback),
    onUpdate: callback => listen("aui:update", callback)
  });
}
