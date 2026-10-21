// The screenshot picker window: it receives the picture and reports the rectangle that was chosen.
const { contextBridge, ipcRenderer } = require("electron");

contextBridge.exposeInMainWorld("picker", {
  onPicture: callback => ipcRenderer.once("aui:picture", (_event, dataUrl) => callback(dataUrl)),
  choose: rect => ipcRenderer.send("aui:region", rect)
});
