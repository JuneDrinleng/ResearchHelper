let chart;

function getRingColor() {
  return (
    getComputedStyle(document.documentElement)
      .getPropertyValue("--ring")
      .trim() || "#11c15b"
  );
}

function createChart() {
  const ctx = document.getElementById("powerChart");
  chart = new Chart(ctx, {
    type: "line",
    data: {
      labels: [],
      datasets: [
        {
          label: "剩余电量 (kWh)",
          data: [],
          tension: 0.25,
          borderColor: "#11c15b", // 初始色
          borderWidth: 2,
          pointRadius: 2,
          fill: false,
        },
      ],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: { legend: { display: false } },
      layout: { padding: 0 },
      scales: {
        x: {
          ticks: { font: { size: 10 } },
          grid: { display: false },
        },
        y: {
          beginAtZero: false,
          ticks: { font: { size: 10 } },
          grid: { drawTicks: false },
        },
      },
    },
  });

  updateChartColor(); // 确保颜色及时更新
}

function updateChartColor() {
  if (!chart) return;
  chart.data.datasets[0].borderColor = getRingColor();
  chart.update("none");
}

function applyTheme(t) {
  document.documentElement.classList.remove("light-mode", "dark-mode");
  document.body.classList.remove("light-mode", "dark-mode");
  document.documentElement.classList.add(`${t}-mode`);
  document.body.classList.add(`${t}-mode`);
}

async function fetchPower() {
  try {
    const res = await fetch("http://localhost:8080/api/power");
    const data = await res.json();

    // 筛出 power 值变化的记录
    const filtered = [];
    let lastPower = null;
    for (const item of data) {
      const power = Number(item.power);
      if (power !== lastPower) {
        filtered.push(item);
        lastPower = power;
      }
    }
    // 只保留最后变化的 5 条
    const recent = filtered.slice(-5);
    const labels = recent.map((d) => d.time);
    const values = recent.map((d) => Number(d.power));

    chart.data.labels = labels;
    chart.data.datasets[0].data = values;
    chart.update("none");

    const latest = recent.at(-1);
    document.getElementById("powerValue").textContent = latest?.power ?? "--";
    document.getElementById("currentTime").textContent = latest?.time ?? "--";
  } catch (e) {
    console.error("获取电量失败:", e);
  }
}

document.addEventListener("DOMContentLoaded", () => {
  applyTheme(localStorage.getItem("theme") || "light");

  // 延迟执行，确保 CSS 生效后再读取变量
  setTimeout(() => {
    createChart();
    fetchPower();
    setInterval(fetchPower, 30 * 60 * 1000);
  }, 50);
});

// 监听主题变化
window.addEventListener("storage", (e) => {
  if (e.key === "theme") {
    applyTheme(e.newValue || "light");
    updateChartColor();
  }
});
