const { app, BrowserWindow, Tray, Menu, dialog } = require("electron");
const path = require("path");
const kill = require("tree-kill");
const { setupAutoUpdater } = require("./modules/updater");
const { startBackend, backendProcess } = require("./modules/backendManager");
const { createAppMenu } = require("./modules/menuManager");
let mainWindow;
let tray = null;
let forceQuit = false;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 900,
    height: 700,
    icon: path.join(__dirname, "favicon.ico"),
    show: true,
  });

  mainWindow.loadFile(path.join(__dirname, "templates", "index.html"));

  mainWindow.on("close", (event) => {
    if (!forceQuit) {
      event.preventDefault();
      mainWindow.hide();
    }
  });
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
      click: () => {
        forceQuit = true;
        app.quit();
      },
    },
  ]);

  tray.setToolTip("ResearchHelper");
  tray.setContextMenu(contextMenu);
}

app.on("before-quit", (e) => {
  forceQuit = true;
  if (backendProcess) {
    console.log("trying to kill ,PID:", backendProcess.pid);
    e.preventDefault();

    kill(backendProcess.pid, "SIGTERM", (err) => {
      if (err) console.error("Failed to close", err);
      else console.log("Successfully closed backend process.");
      app.exit();
    });

    setTimeout(() => {
      console.warn("entirely close Electron。");
      app.exit();
    }, 3000);
  }
});

app.whenReady().then(() => {
  startBackend(app);
  createWindow();
  createAppMenu(app, mainWindow, require("electron-updater").autoUpdater);
  createTray();
  setupAutoUpdater(dialog);
});
