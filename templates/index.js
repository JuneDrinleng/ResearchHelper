/* ========= 识别平台，给 <body> 打标签 ========= */
document.body.classList.add(/mac/i.test(navigator.userAgent) ? "mac" : "win");
// document.body.classList.add("mac");
/* ========= 主题初始化 ========= */
const initTheme = () => {
  const t = localStorage.getItem("theme") || "light";
  document.body.classList.toggle("light-mode", t === "light");
  document.body.classList.toggle("dark-mode", t === "dark");
  document.getElementById("mainFrame").style.background =
    t === "dark" ? "#1e1e1e" : "#f9fafc";
};
initTheme();
window.addEventListener("storage", (e) => {
  if (e.key === "theme") initTheme();
});

/* ========= 侧栏导航 ========= */
const iframe = document.getElementById("mainFrame");
const navLinks = document.querySelectorAll(".nav-links a[data-src]");
const setActive = (link) =>
  navLinks.forEach((l) => l.classList.toggle("active", l === link));
navLinks.forEach((l) => {
  l.addEventListener("click", (e) => {
    e.preventDefault();
    iframe.src = l.dataset.src;
    setActive(l);
  });
});
// setActive(document.querySelector('.nav-links a[data-src="./hotsearch.html"]'));
document.querySelector(".footer[data-src]").onclick = (e) => {
  e.preventDefault();
  iframe.src = e.currentTarget.dataset.src;
  setActive(null);
};

/* ========= 置顶 / 退出 ========= */
document.getElementById("btnExit").onclick = (e) => {
  e.preventDefault();
  ipcRenderer?.send("app-exit");
};
const btnPin = document.getElementById("btnPin");
btnPin.onclick = (e) => {
  e.preventDefault();
  window.electronAPI?.toggleTop();
};
window.electronAPI?.onTopState((isTop) => {
  btnPin.classList.toggle("pin-active", isTop);
});

/* ========= 顶栏三键 ========= */
const api = window.electronAPI || {};
document.getElementById("btnClose").onclick = () => api.winClose?.();
document.getElementById("btnMin").onclick = () => api.winMin?.();
document.getElementById("btnMax").onclick = () => api.winMaxToggle?.();

/* ========= 预加载子页面 ========= */
[
  "hotsearch.html",
  "translate.html",
  "settings.html",
  "about.html",
  "welcome.html",
].forEach((u) => fetch(u));

/* ========= 打开外连接 ========= */
window.addEventListener("message", (event) => {
  if (event.data?.type === "open-external") {
    window.electronAPI?.openExternal(event.data.url);
  }
});
