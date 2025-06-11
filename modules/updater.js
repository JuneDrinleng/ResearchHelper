const { autoUpdater } = require("electron-updater");
const log = require("./logger");
let manualCheck = false;
function setupAutoUpdater(dialog) {
  autoUpdater.autoDownload = false;

  autoUpdater.on("update-available", () => {
    dialog
      .showMessageBox({
        type: "info",
        title: "有新版本可用",
        message: "发现新版本，是否现在下载？",
        buttons: ["是", "否"],
      })
      .then((result) => {
        if (result.response === 0) {
          autoUpdater.downloadUpdate();
        }
      });
  });
  autoUpdater.on("update-not-available", () => {
    if (manualCheck) {
      dialog.showMessageBox({
        type: "info",
        title: "已是最新版本",
        message: "当前已是最新版本，无需更新。",
        buttons: ["确定"],
      });
    }
  });

  autoUpdater.on("update-downloaded", () => {
    dialog
      .showMessageBox({
        title: "更新已下载",
        message: "更新已下载，是否立即重启安装？",
        buttons: ["重启", "稍后"],
      })
      .then((result) => {
        if (result.response === 0) {
          autoUpdater.quitAndInstall();
        }
      });
  });

  autoUpdater.on("error", (error) => {
    dialog.showErrorBox(
      "更新出错",
      error == null ? "未知错误" : (error.stack || error).toString()
    );
  });

  autoUpdater.checkForUpdates();
}
function manualUpdateCheck() {
  manualCheck = true;
  autoUpdater.checkForUpdates();
}

function autoUpdateCheck() {
  manualCheck = false;
  autoUpdater.checkForUpdates();
}
module.exports = {
  setupAutoUpdater,
  manualUpdateCheck,
  autoUpdateCheck,
};
