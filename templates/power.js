/* power.js — refreshed 2025-06-16 */

let chart;

/* ========= 颜色助手 ========= */
function interpolateColor(c1, c2, ratio) {
  const hex = (c) => (c.startsWith("#") ? c.slice(1) : c);
  const [h1, h2] = [hex(c1), hex(c2)];
  const toRGB = (h) => [
    parseInt(h.substr(0, 2), 16),
    parseInt(h.substr(2, 2), 16),
    parseInt(h.substr(4, 2), 16),
  ];
  const [r1, g1, b1] = toRGB(h1);
  const [r2, g2, b2] = toRGB(h2);
  const mix = (a, b) => Math.round(a + (b - a) * ratio);
  return `rgb(${mix(r1, r2)}, ${mix(g1, g2)}, ${mix(b1, b2)})`;
}

function getInterpolatedColor(power) {
  if (power >= 50) return "#11c15b"; // 绿色
  if (power <= 15) return "#ff4d4f"; // 红色
  const ratio = (power - 15) / 35; // 红 → 黄
  return interpolateColor("#ff4d4f", "#faad14", ratio);
}

/* ========= 环形渐变 ========= */
function updateRingColor(power) {
  if (typeof power !== "number" || isNaN(power)) return;
  const color = getInterpolatedColor(power); // >50 绿，15~50 渐黄，<15 红
  document.documentElement.style.setProperty("--ring", color);
  document.body.style.setProperty("--ring", color);
}

/* ========= 主题 ========= */
function applyTheme(t) {
  document.documentElement.classList.remove("light-mode", "dark-mode");
  document.body.classList.remove("light-mode", "dark-mode");
  document.documentElement.classList.add(`${t}-mode`);
  document.body.classList.add(`${t}-mode`);
}

/* ========= 折线图 ========= */
function createChart() {
  const ctx = document.getElementById("powerChart").getContext("2d");
  chart = new Chart(ctx, {
    type: "line",
    data: {
      labels: [],
      datasets: [
        {
          label: "剩余电量 (kWh)",
          data: [],
          tension: 0.25,
          borderWidth: 2,
          pointRadius: 2,
          fill: false,
          segment: {
            // 每段按终点电量固定上色
            borderColor: ({ p1 }) => {
              const y = p1.parsed.y;
              if (y < 15) return "#ff4d4f"; // 红
              if (y < 50) return "#faad14"; // 黄
              return "#11c15b"; // 绿
            },
          },
          pointBackgroundColor: ({ raw: y }) =>
            y < 15 ? "#ff4d4f" : y < 50 ? "#faad14" : "#11c15b",
          pointBorderColor: ({ raw: y }) =>
            y < 15 ? "#ff4d4f" : y < 50 ? "#faad14" : "#11c15b",
        },
      ],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { display: false },
        tooltip: {
          callbacks: {
            label: (ctx) => `${ctx.parsed.y} kWh`,
          },
        },
      },
      scales: {
        x: { display: false },
        y: {
          beginAtZero: true,
          suggestedMax: 100,
          ticks: { callback: (v) => `${v} kWh` },
        },
      },
    },
  });
}

/* ========= 拉数据 ========= */
async function fetchPower() {
  try {
    const res = await fetch("http://localhost:8080/api/power");
    const data = await res.json();

    // 只保留 power 变化的记录
    const filtered = data.filter(
      (d, i, arr) => i === 0 || Number(d.power) !== Number(arr[i - 1].power)
    );
    const recent = filtered.slice(-5);
    const labels = recent.map((d) => d.time);
    const values = recent.map((d) => Number(d.power));

    /* 折线图 */
    chart.data.labels = labels;
    chart.data.datasets[0].data = values;
    chart.update("none");

    /* 数值 + 环形颜色 */
    const latest = recent.at(-1);
    const p = Number(latest?.power);
    document.getElementById("powerValue").textContent = latest?.power ?? "--";
    document.getElementById("currentTime").textContent = latest?.time ?? "--";
    updateRingColor(p);
  } catch (e) {
    console.error("获取电量失败:", e);
  }
}

/* ========= 初始化 ========= */
document.addEventListener("DOMContentLoaded", () => {
  applyTheme(localStorage.getItem("theme") || "light");

  // 等 CSS 变量就绪
  setTimeout(() => {
    createChart();
    fetchPower();
    setInterval(fetchPower, 3 * 1000); // 每 30 秒刷新
  }, 50);
});

/* 监听主题切换 */
window.addEventListener("storage", (e) => {
  if (e.key === "theme") {
    applyTheme(e.newValue || "light");
  }
});
