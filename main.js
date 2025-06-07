const { app, BrowserWindow, Tray, Menu } = require("electron");
const path = require("path");
const { spawn } = require("child_process");
const kill = require("tree-kill");
let mainWindow;
let tray = null;
let forceQuit = false; // ✅ 定义变量
let backendProcess = null;

function getBackendExePath() {
  const isPackaged = app.isPackaged;
  return isPackaged
    ? path.join(
        process.resourcesPath,
        "backend",
        "dist",
        "ResearchHelperService.exe"
      ) // 打包后
    : path.join(__dirname, "backend", "dist", "ResearchHelperService.exe"); // 开发时
}
function startBackend() {
  const exePath = getBackendExePath();
  // backendProcess = spawn("python", [script]);
  backendProcess = spawn(exePath);

  backendProcess.stdout.on("data", (data) => {
    console.log(`[Flask] ${data}`);
  });

  backendProcess.stderr.on("data", (data) => {
    console.error(`[Flask Error] ${data}`);
  });

  backendProcess.on("close", (code) => {
    console.log(`Flask backend exited with code ${code}`);
  });
}

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

app.on("before-quit", (e) => {
  forceQuit = true;

  if (backendProcess) {
    console.log("trying to kill ,PID:", backendProcess.pid);

    e.preventDefault(); // 延迟退出，等 kill 完

    kill(backendProcess.pid, "SIGTERM", (err) => {
      if (err) {
        console.error("Failed to close", err);
      } else {
        console.log("Successfully closed backend process.");
      }

      // 最终还是退出应用（确保退出）
      app.exit();
    });

    // ⏱ 如果 3 秒还没响应，就强杀并退出
    setTimeout(() => {
      console.warn("entirely close Electron。");
      app.exit();
    }, 3000);
  }
});

app.whenReady().then(() => {
  startBackend(); // ✅ 启动 Flask 后端
  createWindow();
  createTray();
});
