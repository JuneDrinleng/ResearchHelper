const { app, BrowserWindow, Tray, Menu, dialog } = require("electron");
const path = require("path");
const kill = require("tree-kill");
const { setupAutoUpdater } = require("./modules/updater");
const { autoUpdater } = require("electron-updater"); // 顶部
const { autoUpdateCheck } = require("./modules/updater");
const backendManager = require("./modules/backendManager");
const startBackend = backendManager.startBackend;
const { createAppMenu } = require("./modules/menuManager");
const log = require("./modules/logger");
const { ipcMain } = require("electron");
const AutoLaunch = require("auto-launch");
let mainWindow;
let tray = null;
let forceQuit = false;

const isPackaged = app.isPackaged;

const appLauncher = new AutoLaunch({
  name: "ResearchHelper",
  path: isPackaged
    ? process.execPath
    : path.join(__dirname, "node_modules", ".bin", "electron.cmd"),
  args: isPackaged ? [] : [__dirname],
  isHidden: true,
});

if (isPackaged) {
  appLauncher.enable().catch(log.error);
}

ipcMain.handle("get-autostart", async () => {
  try {
    const isEnabled = await appLauncher.isEnabled();
    return isEnabled;
  } catch (err) {
    log.error("查询自启动状态失败:", err);
    return false;
  }
});
ipcMain.on("set-autostart", (event, enable) => {
  if (enable) {
    appLauncher.enable().catch((err) => log.error("启用失败:", err));
  } else {
    appLauncher.disable().catch((err) => log.error("禁用失败:", err));
  }
});
ipcMain.on("check-for-updates", () => {
  manualUpdateCheck(); // 本来菜单里用的函数
  autoUpdater.checkForUpdates();
});

ipcMain.on("app-exit", () => {
  gracefulExit();
});

/* 如果想把进度推给渲染进程 ↓ */
autoUpdater.on("update-available", () =>
  mainWindow.webContents.send("update-status", "发现新版本，正在下载…")
);
autoUpdater.on("update-not-available", () =>
  mainWindow.webContents.send("update-status", "已经是最新版本")
);
autoUpdater.on("error", (err) =>
  mainWindow.webContents.send("update-status", `检查失败：${err.message}`)
);
autoUpdater.on("update-downloaded", () =>
  mainWindow.webContents.send("update-status", "下载完成，准备安装…")
);

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 900,
    height: 700,
    icon: path.join(__dirname, "favicon.ico"),
    show: true,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: path.join(__dirname, "modules", "preload.js"),
    },
  });

  mainWindow.loadFile(path.join(__dirname, "templates", "index.html"));

  mainWindow.on("close", (event) => {
    if (!forceQuit) {
      event.preventDefault();
      mainWindow.hide();
    }
  });
}
function gracefulExit() {
  forceQuit = true;
  if (backendManager.backendProcess) {
    log.info("trying to kill backend PID:", backendManager.backendProcess.pid);
    kill(backendManager.backendProcess.pid, "SIGTERM", (err) => {
      if (err) {
        log.error("Failed to kill backend:", err);
      } else {
        log.info("Backend closed.");
      }
      app.exit();
    });

    // Fallback exit
    setTimeout(() => {
      console.warn("Force exiting Electron.");
      app.exit();
    }, 3000);
  } else {
    app.exit();
  }
}
function createTray() {
  const iconPath = path.join(__dirname, "favicon.ico");
  tray = new Tray(iconPath);

  tray.on("click", () => {
    if (mainWindow) {
      mainWindow.show();
    }
  });

  const contextMenu = Menu.buildFromTemplate([
    { label: "显示主窗口", click: () => mainWindow?.show() },
    {
      label: "退出",
      click: gracefulExit,
    },
  ]);

  tray.setToolTip("ResearchHelper");
  tray.setContextMenu(contextMenu);
}

app.on("before-quit", (e) => {
  e.preventDefault();
  gracefulExit(); // gracefulExit 内部执行 kill 和 app.exit()
});

app.whenReady().then(() => {
  startBackend(app);
  createWindow();
  createAppMenu(
    app,
    mainWindow,
    require("electron-updater").autoUpdater,
    gracefulExit
  );
  createTray();
  autoUpdateCheck();
  setupAutoUpdater(dialog);
});
