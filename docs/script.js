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
