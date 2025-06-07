const { spawn } = require("child_process");
const path = require("path");

let backendProcess = null;

function getBackendExePath(app) {
  const isPackaged = app.isPackaged;
  return isPackaged
    ? path.join(
        process.resourcesPath,
        "backend",
        "dist",
        "ResearchHelperService.exe"
      )
    : path.join(__dirname, "../backend", "dist", "ResearchHelperService.exe");
}

function startBackend(app) {
  const exePath = getBackendExePath(app);
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

  return backendProcess;
}

module.exports = {
  startBackend,
  getBackendExePath,
  get backendProcess() {
    return backendProcess;
  },
};
