const input = document.getElementById("input");
const result = document.getElementById("result");
const charCount = document.getElementById("charCount");
const swapBtn = document.getElementById("swapBtn");

let fromLang = "auto";
let toLang = "zh-CN";

// 绑定来源语言按钮
document.querySelectorAll("#from-langs .lang-btn").forEach((btn) => {
  btn.addEventListener("click", () => {
    document.querySelector("#from-langs .active").classList.remove("active");
    btn.classList.add("active");
    fromLang = btn.getAttribute("data-lang");
  });
});

// 绑定目标语言按钮
document.querySelectorAll("#to-langs .lang-btn").forEach((btn) => {
  btn.addEventListener("click", () => {
    document.querySelector("#to-langs .active").classList.remove("active");
    btn.classList.add("active");
    toLang = btn.getAttribute("data-lang");
  });
});

// 交换语言与输入/输出内容
swapBtn.addEventListener("click", () => {
  if (fromLang === "auto") return;

  const fromBtns = document.querySelectorAll("#from-langs .lang-btn");
  const toBtns = document.querySelectorAll("#to-langs .lang-btn");

  // 交换语言值
  [fromLang, toLang] = [toLang, fromLang];

  // 更新按钮状态
  fromBtns.forEach((btn) => {
    btn.classList.toggle("active", btn.getAttribute("data-lang") === fromLang);
  });
  toBtns.forEach((btn) => {
    btn.classList.toggle("active", btn.getAttribute("data-lang") === toLang);
  });

  // 交换文本内容
  const originalInput = input.value;
  input.value = result.textContent;
  result.textContent = originalInput;

  // 更新字数统计
  charCount.textContent = `${input.value.length} / 5,000`;

  // 自动翻译
  translate();
});

// 字符计数
input.addEventListener("input", () => {
  charCount.textContent = `${input.value.length} / 5,000`;
});

// 回车翻译
input.addEventListener("keydown", (e) => {
  if (e.key === "Enter" && !e.shiftKey) {
    e.preventDefault();
    translate();
  }
});

// 翻译函数
async function translate() {
  const text = input.value.trim();
  if (!text) {
    result.textContent = "请输入内容";
    return;
  }
  result.textContent = "正在翻译…";
  try {
    const res = await fetch("http://localhost:8080/api/translate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text, from: fromLang, to: toLang }),
    });
    const data = await res.json();
    result.textContent = res.ok ? data.result : "翻译失败";
  } catch (err) {
    result.textContent = "网络异常：" + err.message;
  }
}
