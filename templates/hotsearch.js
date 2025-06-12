/* ======================================
   微博热搜 - 前端脚本 (2025-06-12)
   ====================================== */

/* ---------- 主题同步 ---------- */
const applyTheme = (t) => {
  document.documentElement.classList.remove("light-mode", "dark-mode");
  document.body.classList.remove("light-mode", "dark-mode");
  document.documentElement.classList.add(`${t}-mode`);
  document.body.classList.add(`${t}-mode`);
};

/* ---------- DOM Ready ---------- */
document.addEventListener("DOMContentLoaded", () => {
  /* 1) 设置初始主题 */
  applyTheme(localStorage.getItem("theme") || "light");

  /* 2) 跨窗口监听 localStorage，父页切换时 iframe 跟着换 */
  window.addEventListener("storage", (e) => {
    if (e.key === "theme") applyTheme(e.newValue || "light");
  });

  /* 3) DOM 引用与 hover 焦点效果 */
  const list = document.getElementById("hotsearch-list");
  list.addEventListener("mouseover", () =>
    list.classList.add("hotsearch-hovering")
  );
  list.addEventListener("mouseout", () =>
    list.classList.remove("hotsearch-hovering")
  );

  /* 4) 主函数：骨架 → 拉数据 → 渲染热搜 */
  function loadHotsearch() {
    /* —— 4-1 先渲染 10 条骨架 —— */
    list.innerHTML = Array.from(
      { length: 10 },
      () =>
        `<div class="skeleton-item"><div class="skeleton-shimmer"></div></div>`
    ).join("");

    /* —— 4-2 拉数据 —— */
    fetch("http://localhost:8080/api/hotsearch")
      .then((res) => res.json())
      .then((data) => {
        list.innerHTML = "";

        if (!data?.length) {
          list.innerHTML =
            "<p style='text-align:center;color:#aaa'>暂无热搜</p>";
          return;
        }

        data
          .filter((i) => !i.is_ad && i.word && i.num > 0)
          .forEach((item, idx) => {
            const div = document.createElement("div");
            div.className = "hot-item";
            div.style.animationDelay = `${idx * 60}ms`; // 瀑布式入场

            const encoded = encodeURIComponent(item.word);
            div.innerHTML = `
              <a class="card-link" href="https://s.weibo.com/weibo?q=${encoded}" target="_self">
                <div class="rank">${idx + 1}</div>

                <div class="content">
                  <p class="title">${item.word}</p>
                </div>

                <div class="meta">
                  <span class="heat">🔥 ${item.num.toLocaleString()}</span>
                  ${
                    item.icon
                      ? `<img class="label-icon" src="${item.icon}" alt="${item.icon_desc}" title="${item.icon_desc}">`
                      : ""
                  }
                </div>
              </a>
            `;
            list.appendChild(div);
          });
      })
      .catch((err) => {
        console.error("加载失败：", err);
        list.innerHTML =
          "<p style='text-align:center;color:#aaa'>加载失败，请稍后重试</p>";
      });
  }

  /* 5) 首屏加载 + 每 30 秒刷新 */
  loadHotsearch();
  setInterval(loadHotsearch, 30_000);
});
