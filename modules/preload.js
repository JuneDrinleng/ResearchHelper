const { contextBridge, ipcRenderer } = require("electron");

contextBridge.exposeInMainWorld("electronAPI", {
  toggleTop: () => ipcRenderer.send("toggle-always-on-top"),
  onTopState: (cb) => ipcRenderer.on("always-on-top-state", (_e, s) => cb(s)),
  winMin: () => ipcRenderer.send("win-min"),
  winMaxToggle: () => ipcRenderer.send("win-max-toggle"),
  winClose: () => ipcRenderer.send("win-close"),
  openExternal: (url) => ipcRenderer.invoke("open-external", url), // 👈 改为通过 ipc 调用主进程
  /** 保存帐号密码到系统钥匙串 */
  saveCredential: (account, password) =>
    ipcRenderer.invoke("save-credential", { account, password }).catch((e) => {
      console.error(e);
      return false;
    }),

  /** 读取帐号密码（若存在） */
  getCredential: () => ipcRenderer.invoke("get-credential"),
});

contextBridge.exposeInMainWorld("ipcRenderer", {
  send: (ch, data) => ipcRenderer.send(ch, data),
  on: (ch, fn) => ipcRenderer.on(ch, fn),
});
