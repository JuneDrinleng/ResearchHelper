const { contextBridge, ipcRenderer } = require("electron");

contextBridge.exposeInMainWorld("electronAPI", {
  getAutostart: () => ipcRenderer.invoke("get-autostart"),
  setAutostart: (enable) => ipcRenderer.send("set-autostart", enable),
  toggleTop: () => ipcRenderer.send("toggle-always-on-top"),
  /** 主进程告诉我当前置顶状态 */
  onTopState: (cb) => ipcRenderer.on("always-on-top-state", (_e, s) => cb(s)),
});

contextBridge.exposeInMainWorld("ipcRenderer", {
  send: (ch, data) => ipcRenderer.send(ch, data),
  on: (ch, fn) => ipcRenderer.on(ch, fn),
});
