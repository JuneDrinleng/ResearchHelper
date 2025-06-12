const { app, BrowserWindow, Tray, Menu, dialog, ipcMain } = require("electron");
const path = require("path");
const kill = require("tree-kill");
const { setupAutoUpdater, autoUpdateCheck } = require("./modules/updater");
const backendManager = require("./modules/backendManager");
const log = require("./modules/logger");

let mainWindow;
let tray = null;
let forceQuit = false;

const isPackaged = app.isPackaged;

// 退出与托盘等逻辑
ipcMain.on("app-exit", () => {
  gracefulExit();
});
ipcMain.on("toggle-always-on-top", () => {
  const newState = !mainWindow.isAlwaysOnTop();
  mainWindow.setAlwaysOnTop(
    newState,
    process.platform === "darwin" ? "floating" : "screen-saver"
  );
  mainWindow.webContents.send("always-on-top-state", newState);
});

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 900,
    height: 700,
    frame: false, // ⬅ Win / Linux 必须 false
    // macOS 也可以用 frame:false；如果想保留 traffic lights：
    titleBarStyle: "hiddenInset",
    icon: path.join(__dirname, "favicon.ico"),
    show: true,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: path.join(__dirname, "modules", "preload.js"),
    },
  });
  mainWindow.removeMenu();
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
    { label: "退出", click: gracefulExit },
  ]);

  tray.setToolTip("ResearchHelper");
  tray.setContextMenu(contextMenu);
}

app.on("before-quit", (e) => {
  e.preventDefault();
  gracefulExit();
});

app.whenReady().then(() => {
  backendManager.startBackend(app);
  createWindow();
  mainWindow.webContents.on("did-finish-load", () => {
    mainWindow.webContents.send(
      "always-on-top-state",
      mainWindow.isAlwaysOnTop()
    );
  });
  createTray();
  autoUpdateCheck();
  setupAutoUpdater(dialog);
});
/* ===== 三个 IPC 事件 ===== */
ipcMain.on("win-min", () => mainWindow.minimize());
ipcMain.on("win-max-toggle", () =>
  mainWindow.isMaximized() ? mainWindow.unmaximize() : mainWindow.maximize()
);
ipcMain.on("win-close", () => mainWindow.close());
