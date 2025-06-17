// modules/exitManager.js
const { app } = require("electron");
const kill = require("tree-kill");
const backendManager = require("./backendManager");
const log = require("./logger");

let exiting = false;

/**
 * 优雅退出：
 *  1. 若后端仍在运行，先发送 SIGTERM 并等待结束
 *  2. 后端完全退出后执行回调；若未提供回调则默认 app.exit()
 *  3. 若 3 s 内后端仍未响应，兜底强退
 *
 * @param {Function} [cb]  后端退出后的回调（可执行 quitAndInstall 等）
 */
function gracefulExit(cb) {
  if (exiting) return; // 防重入
  exiting = true;

  const finish = typeof cb === "function" ? cb : () => app.exit();
  const proc = backendManager.backendProcess;

  if (proc && !proc.killed) {
    log.info("Trying to kill backend PID:", proc.pid);
    kill(proc.pid, "SIGTERM", (err) => {
      if (err && err.code !== "ESRCH") {
        log.error("Failed to kill backend:", err);
      } else {
        log.info("Backend closed.");
      }
      finish();
    });

    // 超时兜底：3 s 后仍未退出则强制结束
    setTimeout(() => {
      log.warn("Force exiting Electron after timeout.");
      finish();
    }, 3000);
  } else {
    finish();
  }
}

module.exports = { gracefulExit };
