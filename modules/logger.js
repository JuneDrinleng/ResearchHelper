// modules/logger.js
const log = require("electron-log/main");
const path = require("path");
const fs = require("fs");
const { app } = require("electron");

// 设置路径
log.transports.file.resolvePathFn = () => {
  return app.isPackaged
    ? path.join(process.resourcesPath, "research-helper.log")
    : path.join(__dirname, "../research-helper.log");
};

// ⚠ 重置日志文件（只清空一次）
const logPath = app.isPackaged
  ? path.join(process.resourcesPath, "research-helper.log")
  : path.join(__dirname, "../research-helper.log");

try {
  if (fs.existsSync(logPath)) {
    fs.writeFileSync(logPath, "");
  }
} catch (err) {
  console.warn("Failed to clear previous log:", err);
}

// 初始化 + 限制最大大小（防误用）
log.initialize();
log.transports.file.maxSize = 10 * 1024 * 1024;

module.exports = log;
