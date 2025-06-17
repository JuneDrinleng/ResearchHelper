const { spawn } = require("child_process");
const path = require("path");
const log = require("./logger");
const keytar = require("keytar");
const SERVICE = "ResearchHelper";
const fs = require("fs");
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

async function startBackend(app) {
  if (backendProcess) return backendProcess; // 防重复
  // ① 统一算出 power.csv 的真实路径
  const powerCsvPath = app.isPackaged
    ? path.join(app.getPath("userData"), "power.csv")
    : path.join(__dirname, "../power.csv");
  /* ---------- ① 任何环境先拼好 env ---------- */
  let env = { ...process.env, POWER_CSV: powerCsvPath };
  const [cred] = await keytar.findCredentials(SERVICE);
  if (cred) {
    env.RH_ACCOUNT = cred.account;
    env.RH_PASSWORD = cred.password;
  }

  /* ---------- ② 再决定怎么启动后端 ---------- */
  if (!app.isPackaged) {
    const script = path.join(__dirname, "../backend/main.py");
    const venvPy = path.join(__dirname, "..", ".venv", "Scripts", "python.exe");
    const pythonCmd = fs.existsSync(venvPy)
      ? venvPy
      : process.platform === "win32"
      ? "python.exe"
      : "python3";

    backendProcess = spawn(pythonCmd, [script], { env });
  } else {
    const exePath = getBackendExePath(app);
    backendProcess = spawn(exePath, { cwd: path.dirname(exePath), env });
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
const kill = require("tree-kill");

async function restartBackend(app) {
  const cur = module.exports.backendProcess;
  if (cur && !cur.killed) {
    return new Promise((resolve) => {
      kill(cur.pid, "SIGTERM", (err) => {
        if (err && err.code !== "ESRCH") {
          // 只有真正 kill 失败才报，ESRCH = 进程早结束
          log.warn("kill backend warn:", err.message);
        } else {
          log.info("Backend closed.");
        }
        module.exports.backendProcess = null; // 保证引用清理
        module.exports.startBackend(app).then(resolve);
      });
    });
  }
  // 当前没有后端，直接启动
  return module.exports.startBackend(app);
}
module.exports = {
  startBackend,
  restartBackend,
  getBackendExePath,
  get backendProcess() {
    return backendProcess;
  },
};
