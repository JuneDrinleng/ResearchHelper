const { contextBridge, ipcRenderer } = require("electron");

contextBridge.exposeInMainWorld("electronAPI", {
  getAutostart: () => ipcRenderer.invoke("get-autostart"),
  setAutostart: (enable) => ipcRenderer.send("set-autostart", enable),
});

contextBridge.exposeInMainWorld("ipcRenderer", {
  send: (ch, data) => ipcRenderer.send(ch, data),
  on: (ch, fn) => ipcRenderer.on(ch, fn),
});
