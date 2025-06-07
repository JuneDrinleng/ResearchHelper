const { Menu, shell } = require("electron");

function createAppMenu(app, mainWindow, autoUpdater, gracefulExit) {
  const template = [
    {
      label: "文件",
      submenu: [
        {
          label: "退出",
          accelerator: "CmdOrCtrl+Q",
          click: () => {
            console.log("🟢 menu is clicked ");
            try {
              gracefulExit();
            } catch (e) {
              console.error("using gracefulExit error:", e);
            }
          },
        },
      ],
    },
    {
      label: "编辑",
      submenu: [
        { role: "undo", label: "撤销" },
        { role: "redo", label: "重做" },
        { type: "separator" },
        { role: "cut", label: "剪切" },
        { role: "copy", label: "复制" },
        { role: "paste", label: "粘贴" },
        { role: "selectAll", label: "全选" },
      ],
    },
    {
      label: "帮助",
      submenu: [
        {
          label: "访问官网",
          click: async () => {
            await shell.openExternal(
              "https://github.com/JuneDrinleng/ResearchHelper"
            );
          },
        },
        {
          label: "检查更新",
          click: () => {
            if (autoUpdater) {
              autoUpdater.checkForUpdates();
            }
          },
        },
        {
          label: "关于",
          click: () => {
            mainWindow.webContents.send("open-about-dialog");
          },
        },
      ],
    },
  ];

  const menu = Menu.buildFromTemplate(template);
  Menu.setApplicationMenu(menu);
}

module.exports = { createAppMenu };
