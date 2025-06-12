/* ---------- 主题 + 自定义下拉 ---------- */
(function () {
  const prefersDark = matchMedia("(prefers-color-scheme: dark)");
  const root = document.documentElement;

  /* ------- 下拉元素 ------- */
  const select = document.getElementById("theme-select");
  const display = select.querySelector(".selected");
  const options = select.querySelector(".options");
  let current = localStorage.getItem("theme") || select.dataset.value || "auto";

  /* ------- 主题应用 ------- */
  function apply(theme) {
    if (theme === "auto") {
      root.dataset.theme = prefersDark.matches ? "dark" : "light";
      prefersDark.addEventListener("change", sysListener);
    } else {
      root.dataset.theme = theme;
      prefersDark.removeEventListener("change", sysListener);
    }
  }
  function sysListener() {
    if (current === "auto")
      root.dataset.theme = prefersDark.matches ? "dark" : "light";
  }

  /* ------- 状态同步 ------- */
  function setValue(val, label) {
    current = val;
    select.dataset.value = val;
    display.textContent = label;
    localStorage.setItem("theme", val);
    apply(val);
    options
      .querySelectorAll("li")
      .forEach((li) =>
        li.classList.toggle("selected", li.dataset.value === val)
      );
  }

  /* ------- 交互 ------- */
  display.addEventListener("click", () => {
    select.classList.toggle("open");
  });

  options.addEventListener("click", (e) => {
    if (e.target.tagName === "LI") {
      setValue(e.target.dataset.value, e.target.textContent);
      select.classList.remove("open");
    }
  });

  document.addEventListener("click", (e) => {
    if (!select.contains(e.target)) select.classList.remove("open");
  });

  /* ------- 初始化 ------- */
  const initItem =
    options.querySelector(`li[data-value="${current}"]`) ||
    options.firstElementChild;
  setValue(initItem.dataset.value, initItem.textContent);
})();
