/* ——— 轮播逻辑（保持不变） ——— */
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
setInterval(() => goto((idx + 1) % imgs.length), 4000);

/* ——— 版本号填充（保持） ——— */
fetch("./package.json")
  .then((r) => (r.ok ? r.json() : Promise.reject()))
  .then(
    (pkg) =>
      (document.getElementById("version").textContent = pkg.version || "0.0.0")
  )
  .catch(() => (document.getElementById("version").textContent = "unknown"));

/* —— 自动拉取最新 Windows 安装包 —— */
(async () => {
  const api =
    "https://api.github.com/repos/JuneDrinleng/ResearchHelper/releases/latest";
  try {
    const res = await fetch(api);
    if (!res.ok) throw new Error("GitHub API error");
    const release = await res.json();
    const winAsset = release.assets.find((a) => a.name.endsWith(".exe"));
    if (winAsset) {
      const btn = document.getElementById("downloadBtn");
      btn.href = winAsset.browser_download_url;

      /* ❶ 只改 <span class="btn-text"> 里的文字 */
      btn.querySelector(
        ".btn-text"
      ).textContent = `下载最新版 (${release.tag_name})`;

      btn.setAttribute("download", winAsset.name);
    }
  } catch (e) {
    console.warn("未获取到最新安装包，保持默认链接", e);
  }
})();

/* ——— Reveal 动画：IntersectionObserver ——— */
const observer = new IntersectionObserver(
  (entries) => {
    entries.forEach((e) => {
      if (e.isIntersecting) {
        e.target.classList.add("show");
        observer.unobserve(e.target); // 动画一次后停止监听
      }
    });
  },
  { threshold: 0.15 }
);
document.querySelectorAll(".reveal").forEach((el) => observer.observe(el));
