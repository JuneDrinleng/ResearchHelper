const { spawn } = require("child_process");
const path = require("path");
const log = require("./logger");
let backendProcess = null;
const BIN_NAME = {
  win32: "ResearchHelperService.exe",
  darwin: "ResearchHelperService", // 或 ResearchHelperService_mac
};
function getBackendExePath(app) {
  const isPackaged = app.isPackaged;
  const platform = process.platform; // 'win32' | 'darwin' | 'linux'

  const root = isPackaged
    ? path.join(process.resourcesPath, "backend", "dist")
    : path.join(__dirname, "../backend", "dist");

  return path.join(root, BIN_NAME[platform]);
}

function startBackend(app) {
  const exePath = getBackendExePath(app);
  backendProcess = spawn(exePath);

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
