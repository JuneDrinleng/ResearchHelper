const { contextBridge, ipcRenderer } = require("electron");

contextBridge.exposeInMainWorld("electronAPI", {
  toggleTop: () => ipcRenderer.send("toggle-always-on-top"),
  onTopState: (cb) => ipcRenderer.on("always-on-top-state", (_e, s) => cb(s)),
});

contextBridge.exposeInMainWorld("ipcRenderer", {
  send: (ch, data) => ipcRenderer.send(ch, data),
  on: (ch, fn) => ipcRenderer.on(ch, fn),
});
