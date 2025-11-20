// Page de synthèse des observations
class SummaryPage {
  constructor() {
    this.observationInfo = Storage.get("observationInfo");
    this.tasks = Storage.get("tasks") || [];
    this.timeHistory = Storage.get("timeHistory") || [];
    this.cycleHistory = Storage.get("cycleHistory") || [];
    this.taskSummaries = {};
    this.initializePage();
    this.createCharts();
  }

  calculateGaussianData(data, points = 50) {
    const mean = data.reduce((a, b) => a + b, 0) / data.length;
    const variance =
      data.reduce((a, b) => a + Math.pow(b - mean, 2), 0) / data.length;
    const stdDev = Math.sqrt(variance);
    const min = Math.min(...data);
    const max = Math.max(...data);
    const range = max - min;
    const extendedMin = min - range * 0.2;
    const extendedMax = max + range * 0.2;
    const step = (extendedMax - extendedMin) / points;

    const gaussianData = [];
    for (let i = 0; i <= points; i++) {
      const x = extendedMin + step * i;
      const exponent = -Math.pow(x - mean, 2) / (2 * variance);
      const y = (1 / (stdDev * Math.sqrt(2 * Math.PI))) * Math.exp(exponent);
      gaussianData.push({ x, y });
    }

    const maxY = Math.max(...gaussianData.map((point) => point.y));
    gaussianData.forEach((point) => (point.y = point.y / maxY));
    return gaussianData;
  }

  createCharts() {
    const isMobile = window.innerWidth <= 768;
    this.chartOptions = {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          position: isMobile ? "bottom" : "right",
          labels: {
            boxWidth: isMobile ? 15 : 40,
            padding: isMobile ? 10 : 20,
            font: {
              size: isMobile ? 12 : 14,
            },
          },
        },
        datalabels: {
          font: {
            size: isMobile ? 10 : 12,
          },
        },
      },
    };

    this.createVaNvaChart();
    this.createPieChart();
    this.createBarChart();
    this.createGaussChart();
  }

  getVaNvaTotals() {
    let vaTime = 0,
      nvaTime = 0,
      unclassifiedTime = 0;
    Object.values(this.taskSummaries).forEach((summary) => {
      const total = summary.totalTime || 0;
      if (summary.task.hasOwnProperty("va")) {
        if (summary.task.va === true) vaTime += total;
        else if (summary.task.va === false) nvaTime += total;
        else unclassifiedTime += total;
      } else {
        unclassifiedTime += total;
      }
    });
    return { vaTime, nvaTime, unclassifiedTime };
  }

  createVaNvaChart() {
    const el = document.getElementById("vaNvaChart");
    if (!el) return;
    const ctx = el.getContext("2d");
    const { vaTime, nvaTime, unclassifiedTime } = this.getVaNvaTotals();

    this.vaNvaChart = new Chart(ctx, {
      type: "pie",
      data: {
        labels: ["VA", "NVA", "Non classé"],
        datasets: [
          {
            data: [vaTime, nvaTime, unclassifiedTime],
            backgroundColor: ["#2e7d32", "#c62828", "#9e9e9e"],
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { position: "right" },
          datalabels: {
            formatter: (value, ctx) => {
              const total = ctx.dataset.data.reduce((a, b) => a + b, 0) || 1;
              const percentage = ((value / total) * 100).toFixed(1) + "%";
              return percentage;
            },
            color: "#fff",
          },
        },
      },
    });
  }

  updateVaNvaChart() {
    if (!this.vaNvaChart) {
      this.createVaNvaChart();
      return;
    }
    const { vaTime, nvaTime, unclassifiedTime } = this.getVaNvaTotals();
    const ds = this.vaNvaChart.data.datasets[0];
    ds.data = [vaTime, nvaTime, unclassifiedTime];
    this.vaNvaChart.update();
  }

  createPieChart() {
    const ctx = document.getElementById("pieChart").getContext("2d");
    const data = Object.values(this.taskSummaries).map((summary) => ({
      value: summary.totalTime,
      color: summary.task.color,
      label: summary.task.title,
    }));

    this.pieChart = new Chart(ctx, {
      type: "pie",
      data: {
        labels: data.map((d) => d.label),
        datasets: [
          {
            data: data.map((d) => d.value),
            backgroundColor: data.map((d) => d.color),
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            position: "right",
          },
          datalabels: {
            formatter: (value, ctx) => {
              const total = ctx.dataset.data.reduce((a, b) => a + b, 0);
              const percentage = ((value / total) * 100).toFixed(1) + "%";
              return percentage;
            },
            color: "#fff",
          },
        },
      },
    });
  }

  createBarChart() {
    const ctx = document.getElementById("barChart").getContext("2d");
    const data = Object.values(this.taskSummaries).map((summary) => ({
      label: summary.task.title,
      avgTime:
        summary.entries.length > 0
          ? summary.totalTime / summary.entries.length
          : 0,
      color: summary.task.color,
    }));

    this.barChart = new Chart(ctx, {
      type: "bar",
      data: {
        labels: data.map((d) => d.label),
        datasets: [
          {
            label: "Temps moyen (ms)",
            data: data.map((d) => d.avgTime),
            backgroundColor: data.map((d) => d.color),
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        scales: {
          y: {
            beginAtZero: true,
            ticks: {
              callback: (value) => formatDuration(value),
            },
          },
        },
        plugins: {
          legend: {
            display: false,
          },
          datalabels: {
            formatter: (value) => formatDuration(value),
            anchor: "end",
            align: "top",
          },
        },
      },
    });
  }

  createGaussChart() {
    const ctx = document.getElementById("gaussChart").getContext("2d");
    const datasets = Object.values(this.taskSummaries)
      .map((summary) => {
        const durations = summary.entries.map((entry) => entry.duration);
        if (durations.length < 2) {
          return null;
        }
        const gaussData = this.calculateGaussianData(durations);

        return {
          label: summary.task.title,
          data: gaussData.map((point) => ({ x: point.x, y: point.y })),
          borderColor: summary.task.color,
          backgroundColor: `${summary.task.color}33`,
          fill: true,
          pointRadius: 0,
        };
      })
      .filter((dataset) => dataset !== null);

    if (datasets.length > 0) {
      this.gaussChart = new Chart(ctx, {
        type: "line",
        data: {
          datasets: datasets,
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          parsing: {
            xAxisKey: "x",
            yAxisKey: "y",
          },
          scales: {
            x: {
              type: "linear",
              position: "bottom",
              ticks: {
                callback: (value) => formatDuration(value),
              },
              title: {
                display: true,
                text: "Durée de l'activité",
              },
            },
            y: {
              beginAtZero: true,
              title: {
                display: true,
                text: "Fréquence",
              },
            },
          },
          plugins: {
            legend: {
              position: "top",
            },
            tooltip: {
              callbacks: {
                label: (context) => {
                  return `${context.dataset.label}: ${formatDuration(
                    context.parsed.x
                  )}`;
                },
              },
            },
          },
        },
      });
    } else {
      const container =
        document.getElementById("gaussChart").parentElement.parentElement;
      container.innerHTML =
        '<p class="no-data-message">Pas assez de données pour afficher la courbe de Gauss. Il faut au moins 2 mesures par activité.</p>';
      this.gaussChart = null;
    }
  }

  initializePage() {
    this.prepareSummaries();
    this.displaySessionInfo();
    this.displayTasksSummary();
    this.setupExportButtons();
  }

  prepareSummaries() {
    this.tasks.forEach((task) => {
      this.taskSummaries[task.id] = {
        task: task,
        entries: [],
        totalTime: 0,
        cycles: [],
        totalCycleTime: 0,
      };
    });

    this.timeHistory.forEach((entry) => {
      if (this.taskSummaries[entry.taskId]) {
        this.taskSummaries[entry.taskId].entries.push(entry);
        this.taskSummaries[entry.taskId].totalTime += entry.duration;
      }
    });

    this.cycleHistory.forEach((c) => {
      if (this.taskSummaries[c.taskId]) {
        this.taskSummaries[c.taskId].cycles.push(c);
        this.taskSummaries[c.taskId].totalCycleTime += c.duration || 0;
      }
    });
  }

  displaySessionInfo() {
    if (this.observationInfo) {
      const formattedDate = new Date(
        this.observationInfo.examDate
      ).toLocaleDateString("fr-FR");
      document.getElementById("session-info").innerHTML = `
                <p><strong>Collaborateur :</strong> ${this.observationInfo.examineeName}</p>
                <p><strong>Observateur :</strong> ${this.observationInfo.examinerName}</p>
                <p><strong>Date :</strong> ${formattedDate}</p>
            `;
    }
  }

  displayTasksSummary() {
    const tasksSummaryDiv = document.getElementById("tasks-summary");
    Object.values(this.taskSummaries).forEach((summary) => {
      const taskDiv = document.createElement("div");
      taskDiv.className = "task-summary";

      const isVA = summary.task.hasOwnProperty("va")
        ? summary.task.va === true
        : null;

      taskDiv.innerHTML = `
                <div class="task-summary-header" style="background-color: ${
                  summary.task.color
                }">
                    <h2>${summary.task.title}</h2>
                </div>
                <div class="task-summary-body">
                    <p>${summary.task.description || "Aucune description"}</p>
                    <div class="time-entries">
                        ${summary.entries
                          .map(
                            (entry) => `
                            <div class="time-entry">
                              ${entry.cycleIndex ? `<span class=\"cycle-badge\">Cycle #${entry.cycleIndex}</span>` : ""}
                                <span>De ${formatTime(entry.startTime)} à ${formatTime(entry.endTime)}</span>
                                <span>${formatDuration(entry.duration)}</span>
                            </div>
                        `
                          )
                          .join("")}
                    </div>
                    <div class="total-time">
                        Temps total : ${formatDuration(summary.totalTime)}
                    </div>
                    <div class="va-nva-controls" data-task-id="${
                      summary.task.id
                    }">
                        <span class="classification-label">Classification :</span>
                        <button type="button" class="classification-button va ${
                          isVA === true ? "selected" : ""
                        }" data-task-id="${summary.task.id}" aria-pressed="${
        isVA === true
      }">VA</button>
                        <button type="button" class="classification-button nva ${
                          isVA === false ? "selected" : ""
                        }" data-task-id="${summary.task.id}" aria-pressed="${
        isVA === false
      }">NVA</button>
                    </div>
                </div>
            `;

      const vaBtn = taskDiv.querySelector(".classification-button.va");
      const nvaBtn = taskDiv.querySelector(".classification-button.nva");
      vaBtn.addEventListener("click", () =>
        this.setTaskClassification(summary.task.id, true, vaBtn, nvaBtn)
      );
      nvaBtn.addEventListener("click", () =>
        this.setTaskClassification(summary.task.id, false, vaBtn, nvaBtn)
      );

      tasksSummaryDiv.appendChild(taskDiv);
    });
  }

  setTaskClassification(taskId, isVA, vaBtn, nvaBtn) {
    const idx = this.tasks.findIndex((t) => t.id === taskId);
    if (idx === -1) return;
    this.tasks[idx].va = isVA;
    Storage.set("tasks", this.tasks);
    requestAnimationFrame(() => {
      vaBtn.classList.toggle("selected", isVA === true);
      vaBtn.setAttribute("aria-pressed", String(isVA === true));
      nvaBtn.classList.toggle("selected", isVA === false);
      nvaBtn.setAttribute("aria-pressed", String(isVA === false));
    });
    this.updateVaNvaChart();
  }

  setupExportButtons() {
    const btnCharts = document.getElementById("exportExcelWithChartsButton");
    if (btnCharts) {
      btnCharts.addEventListener("click", async () => {
        try {
          await this.exportToExcelWithCharts();
          Storage.set("exported", true);
        } catch (e) {
          alert(
            "Erreur lors de l'export - regarde la console pour plus de détails."
          );
        }
      });
    }

    // Bouton pour revenir au formulaire
    const goToForm = document.getElementById("goToFormButton");
    if (goToForm) {
      goToForm.addEventListener("click", () => {
        window.location.href = "formulaire.html";
      });
    }

    // Bouton Nouvelle session (reset complet)
    const newSession = document.getElementById("newSessionButton");
    if (newSession) {
      newSession.addEventListener("click", () => {
        try {
          Storage.clear();
        } catch (_) {
          try { localStorage.clear(); } catch (_) {}
        }
        window.location.href = "formulaire.html";
      });
    }
  }

  exportToExcel() {
    const wb = XLSX.utils.book_new();

    // Résumé
    const infoData = [
      ["Informations de la session"],
      ["Collaborateur", this.observationInfo.examineeName],
      ["Observateur", this.observationInfo.examinerName],
      ["Date", new Date(this.observationInfo.examDate).toLocaleDateString("fr-FR")],
      [],
      ["Résumé des temps par tâche"],
      ["Tâche", "Temps total", "Pourcentage", "Classification", "Cycles (nb)", "Cycle moyen"],
    ];

    let totalSessionTime = 0;
    Object.values(this.taskSummaries).forEach((s) => (totalSessionTime += s.totalTime));

    Object.values(this.taskSummaries).forEach((s) => {
      const percentage = ((s.totalTime / (totalSessionTime || 1)) * 100).toFixed(2);
      const classif = s.task.hasOwnProperty("va") ? (s.task.va ? "VA" : "NVA") : "";
      const cyclesCount = s.cycles.length;
      const avgCycle = cyclesCount ? Math.round(s.totalCycleTime / cyclesCount) : 0;
      infoData.push([
        s.task.title,
        formatDuration(s.totalTime),
        `${percentage}%`,
        classif,
        cyclesCount,
        formatDuration(avgCycle),
      ]);
    });

    infoData.push([], ["Temps total de la session", formatDuration(totalSessionTime)]);

    // Statistiques détaillées
    const statsData = [[
      "Statistiques détaillées par tâche",
    ], [
      "Tâche",
      "Temps total",
      "Nombre d'occurrences",
      "Temps moyen",
      "Temps minimum",
      "Temps maximum",
      "Pourcentage du temps total",
      "Classification",
      "Cycles (nb)",
      "Cycle moyen",
    ]];

    Object.values(this.taskSummaries).forEach((s) => {
      const durations = s.entries.map((e) => e.duration);
      const avgTime = durations.length ? s.totalTime / durations.length : 0;
      const minTime = durations.length ? Math.min(...durations) : 0;
      const maxTime = durations.length ? Math.max(...durations) : 0;
      const percentage = ((s.totalTime / (totalSessionTime || 1)) * 100).toFixed(2) + "%";
      const classif = s.task.hasOwnProperty("va") ? (s.task.va ? "VA" : "NVA") : "";
      const cyclesCount = s.cycles.length;
      const avgCycle = cyclesCount ? Math.round(s.totalCycleTime / cyclesCount) : 0;
      statsData.push([
        s.task.title,
        formatDuration(s.totalTime),
        durations.length,
        formatDuration(avgTime),
        formatDuration(minTime),
        formatDuration(maxTime),
        percentage,
        classif,
        cyclesCount,
        formatDuration(avgCycle),
      ]);

      if (durations.length >= 2) {
        statsData.push([]);
        statsData.push([`Distribution des temps pour : ${s.task.title}`]);
        statsData.push(["Mesure", "Durée", "Écart par rapport à la moyenne"]);
        durations.forEach((d, i) => {
          const ecart = d - avgTime;
          statsData.push([`#${i + 1}`, formatDuration(d), formatDuration(ecart)]);
        });
        statsData.push([]);
      }
    });

    // Chronologie
    const detailsData = [["Détails chronologiques des activités"], ["Tâche", "Cycle #", "Début", "Fin", "Durée", "Remarque"]];
    const allEntries = [];
    Object.values(this.taskSummaries).forEach((s) => s.entries.forEach((e) => allEntries.push({ taskTitle: s.task.title, ...e })));
    allEntries.sort((a, b) => a.startTime - b.startTime);
    allEntries.forEach((e) => detailsData.push([e.taskTitle, e.cycleIndex || "", formatTime(e.startTime), formatTime(e.endTime), formatDuration(e.duration), e.remark || ""]));

    const wsInfo = XLSX.utils.aoa_to_sheet(infoData);
    const wsStats = XLSX.utils.aoa_to_sheet(statsData);
    const wsDetails = XLSX.utils.aoa_to_sheet(detailsData);

    // Chronologie étendue
    const detailsExtended = [["Détails chronologiques des activités (extended)"], ["Tâche", "Cycle #", "Début", "Fin", "Durée (texte)", "Durée (ms)", "Durée (jours)", "Remarque"]];
    allEntries.forEach((e) => detailsExtended.push([e.taskTitle, e.cycleIndex || "", formatTime(e.startTime), formatTime(e.endTime), formatDuration(e.duration), e.duration || 0, (e.duration || 0) / 86400000, e.remark || ""]));
    const wsDetailsExtended = XLSX.utils.aoa_to_sheet(detailsExtended);

    // Cycles (globaux)
    const cyclesData = [["Cycles (globaux)"], ["Cycle #", "Horodatage", "Durée (texte)", "Durée (ms)", "Durée (jours)"]];
    (this.cycleHistory || []).forEach((c) => {
      const serial = c.timestamp ? c.timestamp / 86400000 + 25569 : "";
      cyclesData.push([c.index || "", serial, formatDuration(c.duration), c.duration || 0, (c.duration || 0) / 86400000]);
    });
    const wsCycles = XLSX.utils.aoa_to_sheet(cyclesData);

    // Raw & VA/NVA & Gauss (inchangés sauf dépendances)
    const rawData = [["Raw"], ["Tâche", "Cycle #", "Début", "Fin", "Durée (ms)", "Durée (jours)", "VA/NVA", "Remarque"]];
    allEntries.forEach((e) => {
      const taskObj = this.taskSummaries[e.taskId] ? this.taskSummaries[e.taskId].task : null;
      const classif = taskObj && taskObj.hasOwnProperty("va") ? (taskObj.va ? "VA" : "NVA") : "";
      const startSerial = e.startTime ? e.startTime / 86400000 + 25569 : "";
      const endSerial = e.endTime ? e.endTime / 86400000 + 25569 : "";
      rawData.push([e.taskTitle, e.cycleIndex || "", startSerial, endSerial, e.duration || 0, (e.duration || 0) / 86400000, classif, e.remark || ""]);
    });
    const wsRaw = XLSX.utils.aoa_to_sheet(rawData);

    const { vaTime, nvaTime, unclassifiedTime } = this.getVaNvaTotals();
    const totalForClassif = totalSessionTime || 1;
    const vaNvaData = [["Répartition VA / NVA"], ["Catégorie", "Temps total", "Pourcentage"], ["VA", formatDuration(vaTime), `${((vaTime / totalForClassif) * 100).toFixed(2)}%`], ["NVA", formatDuration(nvaTime), `${((nvaTime / totalForClassif) * 100).toFixed(2)}%`], ["Non classé", formatDuration(unclassifiedTime), `${((unclassifiedTime / totalForClassif) * 100).toFixed(2)}%`]];
    const wsVaNva = XLSX.utils.aoa_to_sheet(vaNvaData);

    const gaussSheetData = [["Courbes de Gauss (points normalisés)"], ["Tâche", "x (ms)", "y (normalisé)"]];
    let gaussAny = false;
    Object.values(this.taskSummaries).forEach((s) => {
      const durations = s.entries.map((e) => e.duration);
      if (durations.length >= 2) {
        const points = this.calculateGaussianData(durations);
        gaussSheetData.push([]);
        gaussSheetData.push([`Tâche : ${s.task.title}`]);
        gaussSheetData.push(["Tâche", "x (ms)", "y (normalisé)"]);
        points.forEach((p) => gaussSheetData.push([s.task.title, Math.round(p.x), Number(p.y.toFixed(6))]));
        gaussAny = true;
      }
    });
    if (!gaussAny) {
      gaussSheetData.push([]);
      gaussSheetData.push(["Pas assez de données pour générer des courbes de Gauss (au moins 2 mesures par activité)."]);
    }
    const wsGauss = XLSX.utils.aoa_to_sheet(gaussSheetData);

    // Séquences (mesures chronologiques détaillées)
    const sequencesData = [["Séquences"], [
      "Séquence",
      "Cycle",
      "Horodate",
      "Durée (seconde)",
      "Durée (Cmin)",
      "Activité",
      "Remarque",
    ]];
    const seqEntries = [];
    Object.values(this.taskSummaries).forEach((s) =>
      s.entries.forEach((e) => seqEntries.push({ taskTitle: s.task.title, ...e }))
    );
    seqEntries.sort((a, b) => a.startTime - b.startTime);
    seqEntries.forEach((e, i) => {
      const ms = e.duration || 0;
      const secondsTime = ms / 86400000; // fraction de jour pour format mm:ss.00
      const cmin = Math.round((((ms) / 60000) * 100) * 10) / 10; // 1 décimale
      let timeFraction = "";
      if (e.startTime) {
        const d = new Date(e.startTime);
        const h = d.getHours();
        const m = d.getMinutes();
        const s = d.getSeconds();
        const ms = d.getMilliseconds();
        timeFraction = (h * 3600000 + m * 60000 + s * 1000 + ms) / 86400000;
      }
      sequencesData.push([
        i + 1,
        e.cycleIndex || "",
        timeFraction,
        secondsTime,
        cmin,
        e.taskTitle,
        e.remark || "",
      ]);
    });
    const wsSequences = XLSX.utils.aoa_to_sheet(sequencesData);
    // Formats: C = hh:mm:ss.00, D = mm:ss.00, E = 0.0
    try {
      const startRow = 3;
      const endRow = sequencesData.length + 1; // aoa_to_sheet may not count title row; safe iterate using data length
      for (let r = startRow; r < startRow + seqEntries.length; r++) {
        const cAddr = `C${r}`;
        const dAddr = `D${r}`;
        const eAddr = `E${r}`;
        if (wsSequences[cAddr]) wsSequences[cAddr].z = "hh:mm:ss.00";
        if (wsSequences[dAddr]) wsSequences[dAddr].z = "mm:ss.00";
        if (wsSequences[eAddr]) wsSequences[eAddr].z = "0.0";
      }
    } catch (_) {}

    // Append
    XLSX.utils.book_append_sheet(wb, wsInfo, "Résumé");
    XLSX.utils.book_append_sheet(wb, wsStats, "Statistiques");
    XLSX.utils.book_append_sheet(wb, wsDetails, "Chronologie");
    XLSX.utils.book_append_sheet(wb, wsDetailsExtended, "Chronologie_Extended");
    XLSX.utils.book_append_sheet(wb, wsRaw, "Raw");
    XLSX.utils.book_append_sheet(wb, wsVaNva, "VA_NVA");
    XLSX.utils.book_append_sheet(wb, wsGauss, "Gauss");
    XLSX.utils.book_append_sheet(wb, wsCycles, "Cycles");
    XLSX.utils.book_append_sheet(wb, wsSequences, "Séquences");

    const date = new Date().toISOString().split("T")[0];
    const filename = `suivi_operateur_${this.observationInfo.examineeName}_${date}.xlsx`;
    XLSX.writeFile(wb, filename);
    try { Storage.set("exported", true); } catch (_) {}
  }

  downloadBlankTemplateWorkbook() {
    if (typeof XLSX === "undefined") {
      alert("Librairie XLSX non disponible.");
      return;
    }

    const wb = XLSX.utils.book_new();
    const makeSheet = (title, headers, rows = 1000) => {
      const data = [headers];
      for (let i = 0; i < rows - 1; i++)
        data.push(new Array(headers.length).fill(""));
      const ws = XLSX.utils.aoa_to_sheet(data);
      XLSX.utils.book_append_sheet(wb, ws, title);
      const endCol = String.fromCharCode(
        "A".charCodeAt(0) + headers.length - 1
      );
      const ref = `${title}!$A$1:$${endCol}$${rows}`;
      return { ws, ref };
    };

    const vaNva = makeSheet(
      "DATA_VA_NVA",
      ["Catégorie", "Temps total", "Pourcentage"],
      100
    );
    const activity = makeSheet(
      "DATA_ACTIVITY",
      ["Tâche", "Temps total", "Pourcentage", "Classification"],
      1000
    );
    const barAvg = makeSheet("DATA_BAR_AVG", ["Tâche", "Temps moyen"], 1000);
    const gauss = makeSheet(
      "DATA_GAUSS",
      ["Tâche", "x (ms)", "y (normalisé)"],
      5000
    );
    const timeline = makeSheet(
      "DATA_TIMELINE",
      ["Tâche", "Début", "Fin", "Durée"],
      5000
    );

    wb.Workbook = wb.Workbook || {};
    wb.Workbook.Names = [
      { Name: "VA_NVA_DATA", Ref: vaNva.ref },
      { Name: "ACTIVITY_BREAKDOWN", Ref: activity.ref },
      { Name: "BAR_AVG", Ref: barAvg.ref },
      { Name: "GAUSS_POINTS", Ref: gauss.ref },
      { Name: "TIMELINE", Ref: timeline.ref },
    ];

    const date = new Date().toISOString().split("T")[0];
    const filename = `template_charts_${date}.xlsx`;
    XLSX.writeFile(wb, filename);

    setTimeout(() => {
      alert(
        "Template téléchargé. Ouvrez-le dans Excel, insérez vos graphiques qui pointent vers les plages nommées (ex: VA_NVA_DATA), puis enregistrez-le sous 'template_charts.xlsx' et placez-le dans assets/excel/ ou uploadez-le depuis la page."
      );
    }, 200);
  }

  async exportToExcelWithCharts() {
    if (typeof ExcelJS === "undefined") {
      alert("ExcelJS non disponible. Vérifiez la connexion internet.");
      return;
    }

    const workbook = new ExcelJS.Workbook();
    const date = new Date().toISOString().split("T")[0];
    const filename = `suivi_operateur_${this.observationInfo.examineeName}_${date}_charts.xlsx`;
    const wsInfo = workbook.addWorksheet("Résumé");
    const infoRows = [
      ["Informations de la session"],
      ["Collaborateur", this.observationInfo.examineeName],
      ["Observateur", this.observationInfo.examinerName],
      [
        "Date",
        new Date(this.observationInfo.examDate).toLocaleDateString("fr-FR"),
      ],
      [],
      ["Résumé des temps par tâche"],
      ["Tâche", "Temps total", "Pourcentage", "Classification"],
    ];
    let totalSessionTime = 0;
    Object.values(this.taskSummaries).forEach(
      (s) => (totalSessionTime += s.totalTime)
    );
    Object.values(this.taskSummaries).forEach((s) => {
      const percentage =
        ((s.totalTime / (totalSessionTime || 1)) * 100).toFixed(2) + "%";
      const classif = s.task.hasOwnProperty("va")
        ? s.task.va
          ? "VA"
          : "NVA"
        : "";
      infoRows.push([
        s.task.title,
        formatDuration(s.totalTime),
        percentage,
        classif,
      ]);
    });
    infoRows.push(
      [],
      ["Temps total de la session", formatDuration(totalSessionTime)]
    );
    wsInfo.addRows(infoRows);
    const wsStats = workbook.addWorksheet("Statistiques");
    const statsRows = [
      ["Statistiques détaillées par tâche"],
      [
        "Tâche",
        "Temps total",
        "Nombre d'occurrences",
        "Temps moyen",
        "Temps minimum",
        "Temps maximum",
        "Pourcentage du temps total",
        "Classification",
      ],
    ];
    Object.values(this.taskSummaries).forEach((summary) => {
      const durations = summary.entries.map((e) => e.duration);
      const avgTime = durations.length
        ? summary.totalTime / durations.length
        : 0;
      const minTime = durations.length ? Math.min(...durations) : 0;
      const maxTime = durations.length ? Math.max(...durations) : 0;
      const percentage =
        ((summary.totalTime / (totalSessionTime || 1)) * 100).toFixed(2) + "%";
      const classif = summary.task.hasOwnProperty("va")
        ? summary.task.va
          ? "VA"
          : "NVA"
        : "";
      statsRows.push([
        summary.task.title,
        formatDuration(summary.totalTime),
        durations.length,
        formatDuration(avgTime),
        formatDuration(minTime),
        formatDuration(maxTime),
        percentage,
        classif,
      ]);
      if (durations.length >= 2) {
        statsRows.push([]);
        statsRows.push([`Distribution des temps pour : ${summary.task.title}`]);
        statsRows.push(["Mesure", "Durée", "Écart par rapport à la moyenne"]);
        durations.forEach((d, i) => {
          const ecart = d - avgTime;
          statsRows.push([
            `#${i + 1}`,
            formatDuration(d),
            formatDuration(ecart),
          ]);
        });
        statsRows.push([]);
      }
    });
    wsStats.addRows(statsRows);
    const wsDetails = workbook.addWorksheet("Chronologie");
    const detailsRows = [
      ["Détails chronologiques des activités"],
      ["Tâche", "Cycle #", "Début", "Fin", "Durée", "Remarque"],
    ];
    const allEntries = [];
    Object.values(this.taskSummaries).forEach((s) =>
      s.entries.forEach((e) =>
        allEntries.push({ taskTitle: s.task.title, ...e })
      )
    );
    allEntries.sort((a, b) => a.startTime - b.startTime);
    allEntries.forEach((e) =>
      detailsRows.push([
        e.taskTitle,
        e.cycleIndex || "",
        formatTime(e.startTime),
        formatTime(e.endTime),
        formatDuration(e.duration),
        e.remark || "",
      ])
    );
    wsDetails.addRows(detailsRows);
    const wsRaw = workbook.addWorksheet("Raw");
    const rawHeader = [
      "Tâche",
      "Cycle #",
      "Début",
      "Fin",
      "Durée (ms)",
      "Durée (jours)",
      "VA/NVA",
      "Remarque",
    ];
    wsRaw.addRow(rawHeader);
    allEntries.forEach((e) => {
      const taskObj = this.taskSummaries[e.taskId]
        ? this.taskSummaries[e.taskId].task
        : null;
      const classif =
        taskObj && taskObj.hasOwnProperty("va")
          ? taskObj.va
            ? "VA"
            : "NVA"
          : "";
      const startDate = e.startTime ? new Date(e.startTime) : null;
      const endDate = e.endTime ? new Date(e.endTime) : null;
      const durMs = e.duration || 0;
      const durDays = durMs / 86400000;
      wsRaw.addRow([e.taskTitle, e.cycleIndex || "", startDate, endDate, durMs, durDays, classif, e.remark || ""]);
    });
    wsRaw.getColumn(2).numFmt = "dd/mm/yyyy hh:mm:ss";
    wsRaw.getColumn(3).numFmt = "dd/mm/yyyy hh:mm:ss";
    wsRaw.getColumn(5).numFmt = "[h]:mm:ss.00";
    const wsCycles = workbook.addWorksheet("Cycles");
    const cyclesHeader = ["Cycle #", "Horodatage", "Durée (texte)", "Durée (ms)", "Durée (jours)"];
    wsCycles.addRow(cyclesHeader);
    (this.cycleHistory || []).forEach((c) => {
      const durMs = c.duration || 0;
      const durDays = durMs / 86400000;
      const ts = c.timestamp ? new Date(c.timestamp) : null;
      wsCycles.addRow([
        c.index || "",
        ts,
        formatDuration(durMs),
        durMs,
        durDays,
      ]);
    });
    wsCycles.getColumn(2).numFmt = "dd/mm/yyyy hh:mm:ss";
    wsCycles.getColumn(5).numFmt = "[h]:mm:ss.00";
    const wsDetailsExtended = workbook.addWorksheet("Chronologie_Extended");
    const detailsExtendedRows = [
      ["Détails chronologiques des activités (extended)"],
      ["Tâche", "Cycle #", "Début", "Fin", "Durée (texte)", "Durée (ms)", "Durée (jours)", "Remarque"],
    ];
    allEntries.forEach((e) =>
      detailsExtendedRows.push([
        e.taskTitle,
        e.cycleIndex || "",
        formatTime(e.startTime),
        formatTime(e.endTime),
        formatDuration(e.duration),
        e.duration || 0,
        (e.duration || 0) / 86400000,
        e.remark || "",
      ])
    );
    wsDetailsExtended.addRows(detailsExtendedRows);

    const wsVaNva = workbook.addWorksheet("VA_NVA");
    const { vaTime, nvaTime, unclassifiedTime } = this.getVaNvaTotals();
    const totalForClassif = totalSessionTime || 1;
    const vaNvaRows = [
      ["Répartition VA / NVA"],
      ["Catégorie", "Temps total", "Pourcentage"],
      [
        "VA",
        formatDuration(vaTime),
        `${((vaTime / totalForClassif) * 100).toFixed(2)}%`,
      ],
      [
        "NVA",
        formatDuration(nvaTime),
        `${((nvaTime / totalForClassif) * 100).toFixed(2)}%`,
      ],
      [
        "Non classé",
        formatDuration(unclassifiedTime),
        `${((unclassifiedTime / totalForClassif) * 100).toFixed(2)}%`,
      ],
    ];
    wsVaNva.addRows(vaNvaRows);

    const wsGauss = workbook.addWorksheet("Gauss");
    const gaussRows = [
      ["Courbes de Gauss (points normalisés)"],
      ["Tâche", "x (ms)", "y (normalisé)"],
    ];
    let gaussAny = false;
    Object.values(this.taskSummaries).forEach((summary) => {
      const durations = summary.entries.map((e) => e.duration);
      if (durations.length >= 2) {
        const points = this.calculateGaussianData(durations);
        gaussRows.push([]);
        gaussRows.push([`Tâche : ${summary.task.title}`]);
        gaussRows.push(["Tâche", "x (ms)", "y (normalisé)"]);
        points.forEach((p) =>
          gaussRows.push([
            summary.task.title,
            Math.round(p.x),
            Number(p.y.toFixed(6)),
          ])
        );
        gaussAny = true;
      }
    });
    if (!gaussAny) {
      gaussRows.push([]);
      gaussRows.push([
        "Pas assez de données pour générer des courbes de Gauss (au moins 2 mesures par activité).",
      ]);
    }
    wsGauss.addRows(gaussRows);

    // Séquences (mesures chronologiques détaillées)
    const wsSeq = workbook.addWorksheet("Séquences");
    const seqHeader = [
      "Séquence",
      "Cycle",
      "Horodate",
      "Durée (seconde)",
      "Durée (Cmin)",
      "Activité",
      "Remarque",
    ];
    wsSeq.addRow(seqHeader);
    const seqEntries = [];
    Object.values(this.taskSummaries).forEach((s) =>
      s.entries.forEach((e) => seqEntries.push({ taskTitle: s.task.title, ...e }))
    );
    seqEntries.sort((a, b) => a.startTime - b.startTime);
    seqEntries.forEach((e, i) => {
      const startDate = e.startTime ? new Date(e.startTime) : null;
      const secondsTime = (e.duration || 0) / 86400000; // fraction de jour pour mm:ss.00
      const cmin = Math.round((((e.duration || 0) / 60000) * 100) * 10) / 10; // 1 décimale
      wsSeq.addRow([
        i + 1,
        e.cycleIndex || "",
        startDate,
        secondsTime,
        cmin,
        e.taskTitle,
        e.remark || "",
      ]);
    });
    wsSeq.getColumn(3).numFmt = "hh:mm:ss.00";
    wsSeq.getColumn(4).numFmt = "mm:ss.00";
    wsSeq.getColumn(5).numFmt = "0.0";

    const wsCharts = workbook.addWorksheet("Graphiques");
    let currentRow = 1;
    const addChartImage = (title, chartInstance) => {
      if (!chartInstance) return;
      const dataUrl = chartInstance.toBase64Image();
      const base64 = (dataUrl || "").split(",")[1];
      if (!base64) return;
      wsCharts.getCell(currentRow, 1).value = title;
      wsCharts.getCell(currentRow, 1).font = { bold: true };
      currentRow += 1;
      const imageId = workbook.addImage({ base64, extension: "png" });
      wsCharts.addImage(imageId, {
        tl: { col: 0, row: currentRow },
        ext: { width: 800, height: 400 },
      });
      currentRow += 25;
    };

    addChartImage("Répartition VA / NVA", this.vaNvaChart);
    addChartImage("Répartition du temps par activité", this.pieChart);
    addChartImage("Temps moyen par activité", this.barChart);
    addChartImage("Distribution des temps (Gauss)", this.gaussChart);

    const buffer = await workbook.xlsx.writeBuffer();
    const blob = new Blob([buffer], {
      type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }

  async exportToExcelWithNativeChartsTemplate() {
    if (typeof XlsxPopulate === "undefined") {
      alert("XlsxPopulate non disponible. Vérifiez la connexion internet.");
      return;
    }

    const templateUrl = "../assets/excel/template_charts.xlsx";
    let arrayBuffer;
    try {
      const res = await fetch(templateUrl);
      if (!res.ok) throw new Error(`Template non trouvé (${res.status})`);
      arrayBuffer = await res.arrayBuffer();
    } catch (e) {
      alert(
        "Template manquant. Ajoutez 'template_charts.xlsx' dans assets/excel/ puis réessayez."
      );
      return;
    }

    try {
      await this._buildAndDownloadNativeFromArrayBuffer(arrayBuffer);
    } catch (e) {
      alert(
        "Impossible de générer le fichier à partir du template. Vérifiez que les plages nommées existent et réessayez."
      );
    }
  }

  async _buildAndDownloadNativeFromArrayBuffer(arrayBuffer) {
    const workbook = await XlsxPopulate.fromDataAsync(arrayBuffer);

    const requiredNames = [
      "VA_NVA_DATA",
      "ACTIVITY_BREAKDOWN",
      "BAR_AVG",
      "GAUSS_POINTS",
      "TIMELINE",
    ];
    const missing = requiredNames.filter((n) => !workbook.definedName(n));
    if (missing.length) {
      alert(
        `Le template ne contient pas toutes les plages nommées requises:\n- ${missing.join(
          "\n- "
        )}`
      );
      return;
    }

    const { vaTime, nvaTime, unclassifiedTime } = this.getVaNvaTotals();
    const totalForClassif =
      Object.values(this.taskSummaries).reduce(
        (acc, s) => acc + (s.totalTime || 0),
        0
      ) || 1;
    const toExcelTime = (ms) => (ms || 0) / 86400000;
    const vaNvaRows = [
      ["VA", toExcelTime(vaTime), vaTime / (totalForClassif || 1)],
      ["NVA", toExcelTime(nvaTime), nvaTime / (totalForClassif || 1)],
      [
        "Non classé",
        toExcelTime(unclassifiedTime),
        unclassifiedTime / (totalForClassif || 1),
      ],
    ];
    this._fillNamedRangeSafe(workbook, "VA_NVA_DATA", vaNvaRows, {
      numberFormats: { 2: "[h]:mm:ss", 3: "0.00%" },
      skipHeader: false,
    });

    let totalSessionTime = 0;
    Object.values(this.taskSummaries).forEach(
      (s) => (totalSessionTime += s.totalTime)
    );
    const activityRows = [
      ["Tâche", "Temps total", "Pourcentage", "Classification"],
    ];
    Object.values(this.taskSummaries).forEach((s) => {
      const pct = s.totalTime / (totalSessionTime || 1);
      const classif = s.task.hasOwnProperty("va")
        ? s.task.va
          ? "VA"
          : "NVA"
        : "";
      activityRows.push([s.task.title, toExcelTime(s.totalTime), pct, classif]);
    });
    this._fillNamedRangeSafe(workbook, "ACTIVITY_BREAKDOWN", activityRows, {
      numberFormats: { 2: "[h]:mm:ss", 3: "0.00%" },
      skipHeader: true,
    });

    const barAvgRows = [["Tâche", "Temps moyen"]];
    Object.values(this.taskSummaries).forEach((s) => {
      const durations = s.entries.map((e) => e.duration);
      const avg = durations.length ? s.totalTime / durations.length : 0;
      barAvgRows.push([s.task.title, toExcelTime(avg)]);
    });
    this._fillNamedRangeSafe(workbook, "BAR_AVG", barAvgRows, {
      numberFormats: { 2: "[h]:mm:ss" },
      skipHeader: true,
    });

    const gaussRows = [["Tâche", "x (ms)", "y"]];
    Object.values(this.taskSummaries).forEach((s) => {
      const durations = s.entries.map((e) => e.duration);
      if (durations.length >= 2) {
        const points = this.calculateGaussianData(durations);
        points.forEach((p) =>
          gaussRows.push([
            s.task.title,
            Math.round(p.x),
            Number(p.y.toFixed(6)),
          ])
        );
      }
    });
    this._fillNamedRangeSafe(workbook, "GAUSS_POINTS", gaussRows);

    const timelineRows = [["Tâche", "Début", "Fin", "Durée"]];
    const allEntries = [];
    Object.values(this.taskSummaries).forEach((s) =>
      s.entries.forEach((e) =>
        allEntries.push({ taskTitle: s.task.title, ...e })
      )
    );
    allEntries.sort((a, b) => a.startTime - b.startTime);
    allEntries.forEach((e) =>
      timelineRows.push([
        e.taskTitle,
        formatTime(e.startTime),
        formatTime(e.endTime),
        toExcelTime(e.duration),
      ])
    );
    this._fillNamedRangeSafe(workbook, "TIMELINE", timelineRows, {
      numberFormats: { 4: "[h]:mm:ss" },
      skipHeader: true,
    });

    try {
      const rawSheet = workbook.addSheet("Raw");
      const rawHeader = [
        "Tâche",
        "Début",
        "Fin",
        "Durée (ms)",
        "Durée (jours)",
        "VA/NVA",
        "Remarque",
      ];
      rawHeader.forEach((h, i) => rawSheet.cell(1, i + 1).value(h));
      let r = 2;
      Object.values(this.taskSummaries).forEach((s) =>
        s.entries.forEach((e) => {
          const taskTitle = s.task.title;
          const startDate = e.startTime ? new Date(e.startTime) : null;
          const endDate = e.endTime ? new Date(e.endTime) : null;
          const durMs = e.duration || 0;
          const durDays = durMs / 86400000;
          const classif = s.task.hasOwnProperty("va")
            ? s.task.va
              ? "VA"
              : "NVA"
            : "";
          rawSheet.cell(r, 1).value(taskTitle);
          if (startDate) rawSheet.cell(r, 2).value(startDate);
          if (endDate) rawSheet.cell(r, 3).value(endDate);
          rawSheet.cell(r, 4).value(durMs);
          rawSheet.cell(r, 5).value(durDays);
          rawSheet.cell(r, 6).value(classif);
          rawSheet.cell(r, 7).value(e.remark || "");
          r++;
        })
      );
      // Add global cycles sheet as an extra (not tied to template ranges)
      const cyclesSheet = workbook.addSheet("Cycles");
      const header = [
        "Cycle #",
        "Horodatage",
        "Durée (texte)",
        "Durée (ms)",
        "Durée (jours)",
      ];
      header.forEach((h, i) => cyclesSheet.cell(1, i + 1).value(h));
      let rc = 2;
      (this.cycleHistory || []).forEach((c) => {
        const ts = c.timestamp ? new Date(c.timestamp) : null;
        const durMs = c.duration || 0;
        const durDays = durMs / 86400000;
        cyclesSheet.cell(rc, 1).value(c.index || "");
        if (ts) cyclesSheet.cell(rc, 2).value(ts);
        cyclesSheet.cell(rc, 3).value(formatDuration(durMs));
        cyclesSheet.cell(rc, 4).value(durMs);
        cyclesSheet.cell(rc, 5).value(durDays);
        rc++;
      });

      // Add sequences sheet (chronological measurements)
      const seqSheet = workbook.addSheet("Séquences");
      const seqHeader = [
        "Séquence",
        "Cycle",
        "Horodate",
        "Durée (seconde)",
        "Durée (Cmin)",
        "Activité",
        "Remarque",
      ];
      seqHeader.forEach((h, i) => seqSheet.cell(1, i + 1).value(h));
      let rs = 2;
      const seqEntries = [];
      Object.values(this.taskSummaries).forEach((s) =>
        s.entries.forEach((e) => seqEntries.push({ taskTitle: s.task.title, ...e }))
      );
      seqEntries.sort((a, b) => a.startTime - b.startTime);
      seqEntries.forEach((e, i) => {
        const d = e.startTime ? new Date(e.startTime) : null;
        const ms = e.duration || 0;
        const minutes = Math.floor(ms / 60000);
        const seconds = Math.floor((ms % 60000) / 1000);
        const millis = ms % 1000;
        const cmin = Math.round((((ms) / 60000) * 100) * 10) / 10; // 1 décimale
        seqSheet.cell(rs, 1).value(i + 1);
        seqSheet.cell(rs, 2).value(e.cycleIndex || "");
        if (d) {
          const timeOnly = new Date(1899, 11, 30, d.getHours(), d.getMinutes(), d.getSeconds(), d.getMilliseconds());
          seqSheet.cell(rs, 3).value(timeOnly);
          seqSheet.cell(rs, 3).style("numberFormat", "hh:mm:ss.00");
        }
        const secondsTime = new Date(1899, 11, 30, 0, minutes, seconds, millis);
        seqSheet.cell(rs, 4).value(secondsTime);
        seqSheet.cell(rs, 4).style("numberFormat", "mm:ss.00");
        seqSheet.cell(rs, 5).value(cmin).style("numberFormat", "0.0");
        seqSheet.cell(rs, 6).value(e.taskTitle);
        seqSheet.cell(rs, 7).value(e.remark || "");
        rs++;
      });
    } catch (e) {}

    const out = await workbook.outputAsync();
    const blob = new Blob([out], {
      type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    });
    const date = new Date().toISOString().split("T")[0];
    const filename = `suivi_operateur_${this.observationInfo.examineeName}_${date}_native.xlsx`;
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }

  _fillNamedRangeSafe(workbook, name, rows, options = {}) {
    try {
      const defined = workbook.definedName(name);
      if (!defined) {
        return;
      }
      const range = defined.range();
      const sheet = range.sheet();
      const startRow = range._address.rowNumber();
      const startCol = range._address.columnNumber();

      rows.forEach((row, rIdx) => {
        row.forEach((val, cIdx) => {
          const cell = sheet.cell(startRow + rIdx, startCol + cIdx);
          cell.value(val);
          if (options.numberFormats && options.numberFormats[cIdx + 1]) {
            const isHeader = rIdx === 0;
            if (!(options.skipHeader && isHeader)) {
              try {
                cell.style("numberFormat", options.numberFormats[cIdx + 1]);
              } catch (_) {
                /* ignore */
              }
            }
          }
        });
      });
    } catch (e) {}
  }
}

document.addEventListener("DOMContentLoaded", () => {
  new SummaryPage();
});
