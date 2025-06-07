const { app, BrowserWindow, Tray, Menu } = require("electron");
const path = require("path");

let mainWindow;
let tray = null;
let forceQuit = false; // ✅ 定义变量

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
      mainWindow.hide(); // ✅ 仅隐藏窗口
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
    {
      label: "显示主窗口",
      click: () => {
        if (mainWindow) {
          mainWindow.show();
        }
      },
    },
    {
      label: "退出",
      click: () => {
        forceQuit = true; // ✅ 设置允许关闭
        app.quit(); // ✅ 主动退出
      },
    },
  ]);

  tray.setToolTip("ResearchHelper");
  tray.setContextMenu(contextMenu);
}

app.on("before-quit", () => {
  forceQuit = true; // ✅ 确保监听 quit 时也允许关闭
});

app.whenReady().then(() => {
  createWindow();
  createTray();
});
