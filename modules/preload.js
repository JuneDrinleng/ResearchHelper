const { contextBridge, ipcRenderer } = require("electron");

contextBridge.exposeInMainWorld("electronAPI", {
  getAutostart: () => ipcRenderer.invoke("get-autostart"),
  setAutostart: (enable) => ipcRenderer.send("set-autostart", enable),
});
