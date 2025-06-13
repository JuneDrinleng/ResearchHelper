/* 简易轮播 */
const slideBox = document.querySelector(".slides");
const imgs = slideBox.children;
const dotsBox = document.querySelector(".dots");
let idx = 0;
[...imgs].forEach((_, i) => {
  const dot = document.createElement("span");
  if (i === 0) dot.classList.add("active");
  dot.addEventListener("click", () => goto(i));
  dotsBox.appendChild(dot);
});

function goto(i) {
  idx = i;
  slideBox.style.transform = `translateX(-${i * 100}%)`;
  [...dotsBox.children].forEach((d, k) =>
    d.classList.toggle("active", k === i)
  );
}
function next() {
  idx = (idx + 1) % imgs.length;
  goto(idx);
}
setInterval(next, 4000);
/* ---- 填充版本号 ---- */
fetch("./package.json") // 如果 index.html 在根目录就写 './package.json'
  .then((res) => {
    if (!res.ok) throw new Error("无法读取 package.json");
    return res.json();
  })
  .then((pkg) => {
    document.getElementById("version").textContent = pkg.version || "0.0.0";
  })
  .catch(() => {
    document.getElementById("version").textContent = "unknown";
  });
/* ---------- 自动取最新 Windows 安装包 ---------- */
(async () => {
  const api =
    "https://api.github.com/repos/JuneDrinleng/ResearchHelper/releases/latest";
  try {
    const res = await fetch(api);
    if (!res.ok) throw new Error("GitHub API error");
    const release = await res.json();

    // 找到名字以 .exe 结尾的资产；可按实际文件名关键字再精确过滤
    const winAsset = release.assets.find((a) => a.name.endsWith(".exe"));
    if (winAsset) {
      const btn = document.getElementById("downloadBtn");
      btn.href = winAsset.browser_download_url; // 改成直链
      btn.textContent = `下载最新版 (${release.tag_name})`;
      btn.setAttribute("download", winAsset.name); // 浏览器保存同名文件
    }
  } catch (err) {
    console.warn("获取最新安装包失败，继续使用 Releases 页面链接", err);
  }
})();
