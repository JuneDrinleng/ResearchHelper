// modules/exitManager.js
const kill = require("tree-kill");
const { app } = require("electron");
const backendManager = require("./backendManager");
const log = require("./logger");

let exiting = false;
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
module.exports = { gracefulExit };
