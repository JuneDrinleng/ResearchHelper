const { spawn } = require("child_process");
const path = require("path");
const log = require("./logger");
let backendProcess = null;
const BIN_NAME = {
  win32: "ResearchHelperService.exe",
  darwin: "ResearchHelperService", // 或 ResearchHelperService_mac
};
function getBackendExePath(app) {
  // 开发模式：直接跑 python 脚本，省得频繁打包
  if (!app.isPackaged) return null;
  const platform = process.platform; // 'win32' | 'darwin'
  const root = path.join(
    process.resourcesPath,
    "backend",
    "dist",
    platform // 关键：按平台分子目录
  );
  return path.join(root, BIN_NAME[platform]);
}

function startBackend(app) {
  if (backendProcess) return backendProcess; // 防重复

  if (!app.isPackaged) {
    // dev 环境：直接 python main.py
    const script = path.join(__dirname, "../backend/main.py");
    backendProcess = spawn(
      process.platform === "win32" ? "python.exe" : "python3",
      [script]
    );
  } else {
    const exePath = getBackendExePath(app);
    backendProcess = spawn(exePath, { cwd: path.dirname(exePath) });
  }

  backendProcess.stdout.on("data", (data) => {
    log.info(`[Flask] ${data}`);
  });

  backendProcess.stderr.on("data", (data) => {
    log.error(`[Flask Error] ${data}`);
  });

  backendProcess.on("close", (code) => {
    log.info(`Flask backend exited with code ${code}`);
  });

  return backendProcess;
}

module.exports = {
  startBackend,
  getBackendExePath,
  get backendProcess() {
    return backendProcess;
  },
};
