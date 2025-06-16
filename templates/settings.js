/* ---------- 设置页脚本（完全替换） ---------- */
(() => {
  /* ---------------- 主题 ---------------- */
  const prefersDark = matchMedia("(prefers-color-scheme: dark)");
  const root = document.documentElement;
  const select = document.getElementById("theme-select");
  const display = select.querySelector(".selected");
  const optionsBox = select.querySelector(".options");

  /** 根据系统/手动值应用主题 */
  function applyTheme(val) {
    if (val === "auto") {
      root.dataset.theme = prefersDark.matches ? "dark" : "light";
      prefersDark.addEventListener("change", applySysTheme);
    } else {
      root.dataset.theme = val;
      prefersDark.removeEventListener("change", applySysTheme);
    }
  }
  function applySysTheme() {
    if (localStorage.getItem("theme") === "auto")
      root.dataset.theme = prefersDark.matches ? "dark" : "light";
  }

  /** 把 val 写入 UI & localStorage */
  function setTheme(val, label) {
    localStorage.setItem("theme", val);
    select.dataset.value = val;
    display.textContent = label;
    optionsBox
      .querySelectorAll("li")
      .forEach((li) =>
        li.classList.toggle("selected", li.dataset.value === val)
      );
    applyTheme(val);
  }

  /* —— 初始化 —— */
  const initVal = localStorage.getItem("theme") || "auto";
  const initLabel =
    { auto: "跟随系统", light: "浅色", dark: "深色" }[initVal] || "跟随系统";
  setTheme(initVal, initLabel); // ★ 关键：首次进入即同步 UI

  /* —— 交互 —— */
  display.onclick = () => select.classList.toggle("open");
  optionsBox.onclick = (e) => {
    if (e.target.tagName === "LI") {
      setTheme(e.target.dataset.value, e.target.textContent);
      select.classList.remove("open");
    }
  };
  document.addEventListener("click", (e) => {
    if (!select.contains(e.target)) select.classList.remove("open");
  });

  /* ---------- 账号 / 密码 ---------- */
  const $acc = document.getElementById("account");
  const $pwd = document.getElementById("password");

  // 从父窗口拿已保存凭据
  window.parent.postMessage({ channel: "settings", action: "get" }, "*");

  window.addEventListener("message", (ev) => {
    if (ev.data?.channel !== "settings") return;
    const { action, payload } = ev.data;

    if (action === "get-reply" && payload) {
      $acc.value = payload.account ?? "";
      $pwd.value = payload.password ?? "";
    }
    if (action === "save-reply" && !payload) {
      console.warn("[settings] 保存失败");
    }
  });

  // ========== 实时保存 ==========
  let debounceTimer = null;
  function scheduleSave() {
    clearTimeout(debounceTimer);
    debounceTimer = setTimeout(sendSave, 400); // 0.4 s 防抖
  }

  function sendSave() {
    const account = $acc.value.trim();
    const password = $pwd.value;
    if (!account || !password) return; // 任意为空则不保存
    window.parent.postMessage(
      {
        channel: "settings",
        action: "save",
        payload: { account, password },
      },
      "*"
    );
  }

  // input 改动或失焦触发保存
  [$acc, $pwd].forEach(($el) => {
    $el.addEventListener("input", scheduleSave);
    $el.addEventListener("blur", sendSave); // 失焦立即执行一次
  });
})();
