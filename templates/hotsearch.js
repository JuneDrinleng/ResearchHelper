document.addEventListener("DOMContentLoaded", () => {
  /* —— 主题 —— */
  const theme = localStorage.getItem("theme") || "light";
  document.body.classList.add(theme + "-mode");

  /* —— DOM —— */
  const list = document.getElementById("hotsearch-list");
  list.addEventListener("mouseover", () =>
    list.classList.add("hotsearch-hovering")
  );
  list.addEventListener("mouseout", () =>
    list.classList.remove("hotsearch-hovering")
  );

  /* —— 主函数 —— */
  function loadHotsearch() {
    /* 1. 先渲染 10 条骨架 */
    const skeleton = Array.from(
      { length: 10 },
      () => `
      <div class="skeleton-item"><div class="skeleton-shimmer"></div></div>
    `
    ).join("");
    list.innerHTML = skeleton;

    /* 2. 拉数据 */
    fetch("http://localhost:8080/api/hotsearch")
      .then((res) => res.json())
      .then((data) => {
        list.innerHTML = "";
        if (!data || !data.length) {
          list.innerHTML =
            "<p style='text-align:center;color:#aaa'>暂无热搜</p>";
          return;
        }

        data
          .filter((item) => !item.is_ad && item.word && item.num > 0)
          .forEach((item, idx) => {
            const div = document.createElement("div");
            div.className = "hot-item";
            div.style.animationDelay = `${idx * 60}ms`; // 瀑布式

            const encoded = encodeURIComponent(item.word);
            div.innerHTML = `
              <a class="card-link" href="https://s.weibo.com/weibo?q=${encoded}" target="_self">
                <div class="rank">${idx + 1}</div>
                <div class="content"><p class="title">${item.word}</p></div>
                <div class="meta">
                  <span class="heat">🔥 ${item.num.toLocaleString()}</span>
                  ${
                    item.icon
                      ? `<img class="label-icon" src="${item.icon}" alt="${item.icon_desc}" title="${item.icon_desc}">`
                      : ""
                  }
                </div>
              </a>`;
            list.appendChild(div);
          });
      })
      .catch((err) => {
        console.error("加载失败：", err);
        list.innerHTML =
          "<p style='text-align:center;color:#aaa'>加载失败，请稍后重试</p>";
      });
  }

  loadHotsearch(); // 首屏
  setInterval(loadHotsearch, 30_000); // 每 30 s 刷新
});
