(function () {
  const root = document.getElementById("simulation-explorer");
  if (!root) return;

  const controls = {
    sampleSize: root.querySelector("#sample-size"),
    missingRate: root.querySelector("#missing-rate"),
    mechanism: root.querySelector("#missing-mechanism"),
    dataType: root.querySelector("#data-type"),
    metric: root.querySelector("#metric"),
    methods: Array.from(root.querySelectorAll('.method-controls input[type="checkbox"]'))
  };
  const canvas = root.querySelector("#simulation-chart");
  const summary = root.querySelector("#chart-summary");
  const tbody = root.querySelector("#simulation-table tbody");
  const ctx = canvas.getContext("2d");
  const palette = {
    "Complete case": "#6f7b86",
    "FPCR MI": "#2c7a78",
    "PFR MI": "#d28734"
  };
  const metricLabels = {
    bias: "Absolute bias",
    rmse: "RMSE",
    coverage: "Coverage",
    runtime: "Runtime (seconds)"
  };
  let rows = [];
  let activeRows = [];

  function parseCSV(text) {
    const lines = text.trim().split(/\r?\n/);
    const headers = lines.shift().split(",");
    return lines.map((line) => {
      const values = line.split(",");
      const record = {};
      headers.forEach((header, index) => { record[header] = values[index]; });
      ["sample_size", "missing_rate", "bias", "rmse", "coverage", "runtime"].forEach((key) => {
        record[key] = Number(record[key]);
      });
      return record;
    });
  }

  function formatValue(metric, value) {
    if (metric === "coverage") return `${(value * 100).toFixed(1)}%`;
    if (metric === "runtime") return `${value.toFixed(2)} s`;
    return value.toFixed(3);
  }

  function selectedMethods() {
    return controls.methods.filter((input) => input.checked).map((input) => input.value);
  }

  function filterRows() {
    const methods = selectedMethods();
    activeRows = rows.filter((row) =>
      row.sample_size === Number(controls.sampleSize.value) &&
      row.missing_rate === Number(controls.missingRate.value) &&
      row.missing_mechanism === controls.mechanism.value &&
      row.data_type === controls.dataType.value &&
      methods.includes(row.method)
    );
  }

  function renderTable() {
    tbody.replaceChildren();
    activeRows.forEach((row) => {
      const tr = document.createElement("tr");
      [row.method, row.bias.toFixed(3), row.rmse.toFixed(3), `${(row.coverage * 100).toFixed(1)}%`, `${row.runtime.toFixed(2)} s`].forEach((value) => {
        const cell = document.createElement(tr.children.length ? "td" : "th");
        if (!tr.children.length) cell.scope = "row";
        cell.textContent = value;
        tr.appendChild(cell);
      });
      tbody.appendChild(tr);
    });
  }

  function renderChart() {
    const metric = controls.metric.value;
    const bounds = canvas.getBoundingClientRect();
    const width = Math.max(320, Math.floor(bounds.width));
    const height = Math.max(260, 118 + activeRows.length * 74);
    const ratio = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = width * ratio;
    canvas.height = height * ratio;
    canvas.style.height = `${height}px`;
    ctx.setTransform(ratio, 0, 0, ratio, 0, 0);
    ctx.clearRect(0, 0, width, height);

    ctx.fillStyle = "#fffdf9";
    ctx.fillRect(0, 0, width, height);
    ctx.fillStyle = "#17324d";
    ctx.font = "600 17px system-ui, -apple-system, sans-serif";
    ctx.fillText(`${metricLabels[metric]} by illustrative method`, 22, 32);
    ctx.fillStyle = "#5b6670";
    ctx.font = "13px system-ui, -apple-system, sans-serif";
    ctx.fillText(`n=${controls.sampleSize.value} · ${controls.missingRate.value}% · ${controls.mechanism.value} · ${controls.dataType.value}`, 22, 55);

    if (!activeRows.length) {
      ctx.fillStyle = "#5b6670";
      ctx.font = "15px system-ui, -apple-system, sans-serif";
      ctx.fillText("Select at least one method to display the comparison.", 22, 112);
      canvas.setAttribute("aria-label", "No methods selected for the illustrative simulation comparison.");
      return;
    }

    const values = activeRows.map((row) => row[metric]);
    const maxValue = metric === "coverage" ? 1 : Math.max(...values) * 1.15;
    const labelWidth = width < 520 ? 112 : 150;
    const chartLeft = labelWidth + 24;
    const chartRight = width - 34;
    const chartWidth = Math.max(120, chartRight - chartLeft);

    [0, 0.25, 0.5, 0.75, 1].forEach((fraction) => {
      const x = chartLeft + chartWidth * fraction;
      ctx.strokeStyle = "#d9ddd9";
      ctx.lineWidth = 1;
      ctx.beginPath(); ctx.moveTo(x, 76); ctx.lineTo(x, height - 34); ctx.stroke();
      ctx.fillStyle = "#6a737b";
      ctx.font = "11px system-ui, -apple-system, sans-serif";
      const tick = metric === "coverage" ? `${Math.round(fraction * 100)}%` : (maxValue * fraction).toFixed(metric === "runtime" ? 1 : 2);
      ctx.fillText(tick, x - 8, height - 14);
    });

    activeRows.forEach((row, index) => {
      const y = 92 + index * 74;
      const barWidth = chartWidth * (row[metric] / maxValue);
      ctx.fillStyle = "#273641";
      ctx.font = "600 13px system-ui, -apple-system, sans-serif";
      ctx.fillText(row.method, 22, y + 25);
      ctx.fillStyle = palette[row.method] || "#2c7a78";
      ctx.fillRect(chartLeft, y, Math.max(2, barWidth), 34);
      ctx.strokeStyle = "#17324d";
      ctx.lineWidth = row.method === "PFR MI" ? 2 : 1;
      ctx.strokeRect(chartLeft, y, Math.max(2, barWidth), 34);
      if (row.method === "FPCR MI") {
        ctx.strokeStyle = "rgba(255,255,255,.55)";
        for (let x = chartLeft + 8; x < chartLeft + barWidth; x += 14) {
          ctx.beginPath(); ctx.moveTo(x, y + 3); ctx.lineTo(x, y + 31); ctx.stroke();
        }
      }
      ctx.fillStyle = "#273641";
      ctx.font = "600 12px system-ui, -apple-system, sans-serif";
      const valueX = Math.min(chartLeft + barWidth + 8, width - 75);
      ctx.fillText(formatValue(metric, row[metric]), valueX, y + 23);
    });

    const spoken = activeRows.map((row) => `${row.method}: ${formatValue(metric, row[metric])}`).join("; ");
    canvas.setAttribute("aria-label", `${metricLabels[metric]} comparison. ${spoken}. Synthetic illustrative data.`);
  }

  function update() {
    filterRows();
    renderTable();
    renderChart();
    const metric = controls.metric.value;
    summary.textContent = activeRows.length
      ? `${metricLabels[metric]} is shown for ${activeRows.length} illustrative method${activeRows.length === 1 ? "" : "s"}. These synthetic values are not study findings.`
      : "No method is selected. Choose at least one method to display the illustrative comparison.";
  }

  fetch(root.dataset.csv)
    .then((response) => {
      if (!response.ok) throw new Error("Synthetic dataset could not be loaded.");
      return response.text();
    })
    .then((text) => {
      rows = parseCSV(text);
      Object.values(controls).flat().forEach((control) => {
        if (control && control.addEventListener) control.addEventListener("change", update);
      });
      update();
      new ResizeObserver(renderChart).observe(root.querySelector(".chart-wrap"));
    })
    .catch((error) => {
      summary.textContent = error.message;
      summary.classList.add("error-message");
    });
})();
