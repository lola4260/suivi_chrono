// Page de synthèse des observations
class SummaryPage {
    /**
     * @brief Constructeur de la classe SummaryPage.
     */
    constructor() {
        this.observationInfo = Storage.get('observationInfo');
        this.tasks = Storage.get('tasks') || [];
        this.timeHistory = Storage.get('timeHistory') || [];
        this.taskSummaries = {};
        this.initializePage();
        this.createCharts();
    }

    calculateGaussianData(data, points = 50) {
        const mean = data.reduce((a, b) => a + b, 0) / data.length;
        const variance = data.reduce((a, b) => a + Math.pow(b - mean, 2), 0) / data.length;
        const stdDev = Math.sqrt(variance);
        const min = Math.min(...data);
        const max = Math.max(...data);
        const range = max - min;
        const extendedMin = min - (range * 0.2);
        const extendedMax = max + (range * 0.2);
        const step = (extendedMax - extendedMin) / points;

        const gaussianData = [];
        for (let i = 0; i <= points; i++) {
            const x = extendedMin + (step * i);
            const exponent = -Math.pow(x - mean, 2) / (2 * variance);
            const y = (1 / (stdDev * Math.sqrt(2 * Math.PI))) * Math.exp(exponent);
            gaussianData.push({ x, y });
        }

        const maxY = Math.max(...gaussianData.map(point => point.y));
        gaussianData.forEach(point => point.y = point.y / maxY);
        return gaussianData;
    }

    /**
     * @brief Crée tous les graphiques de la page.
     */
    createCharts() {
        const isMobile = window.innerWidth <= 768;
        this.chartOptions = {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    position: isMobile ? 'bottom' : 'right',
                    labels: {
                        boxWidth: isMobile ? 15 : 40,
                        padding: isMobile ? 10 : 20,
                        font: {
                            size: isMobile ? 12 : 14
                        }
                    }
                },
                datalabels: {
                    font: {
                        size: isMobile ? 10 : 12
                    }
                }
            }
        };

        // Crée le diagramme VA/NVA (répartition par classification)
        this.createVaNvaChart();
        this.createPieChart();
        this.createBarChart();
        this.createGaussChart();
    }

    /**
     * @brief Calcule les temps totaux VA / NVA / Non classé.
     * @returns {{vaTime:number, nvaTime:number, unclassifiedTime:number}}
     */
    getVaNvaTotals() {
        let vaTime = 0, nvaTime = 0, unclassifiedTime = 0;
        Object.values(this.taskSummaries).forEach(summary => {
            const total = summary.totalTime || 0;
            if (summary.task.hasOwnProperty('va')) {
                if (summary.task.va === true) vaTime += total;
                else if (summary.task.va === false) nvaTime += total;
                else unclassifiedTime += total;
            } else {
                unclassifiedTime += total;
            }
        });
        return { vaTime, nvaTime, unclassifiedTime };
    }

    /**
     * @brief Crée le diagramme circulaire de répartition VA/NVA.
     */
    createVaNvaChart() {
        const el = document.getElementById('vaNvaChart');
        if (!el) return;
        const ctx = el.getContext('2d');
        const { vaTime, nvaTime, unclassifiedTime } = this.getVaNvaTotals();

        this.vaNvaChart = new Chart(ctx, {
            type: 'pie',
            data: {
                labels: ['VA', 'NVA', 'Non classé'],
                datasets: [{
                    data: [vaTime, nvaTime, unclassifiedTime],
                    backgroundColor: ['#2e7d32', '#c62828', '#9e9e9e']
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: { position: 'right' },
                    datalabels: {
                        formatter: (value, ctx) => {
                            const total = ctx.dataset.data.reduce((a, b) => a + b, 0) || 1;
                            const percentage = ((value / total) * 100).toFixed(1) + '%';
                            return percentage;
                        },
                        color: '#fff'
                    }
                }
            }
        });
    }

    /**
     * @brief Met à jour le diagramme VA/NVA après un changement de classification.
     */
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

    /**
     * @brief Crée un graphique en camembert représentant la répartition des temps par tâche.
     */
    createPieChart() {
        const ctx = document.getElementById('pieChart').getContext('2d');
        const data = Object.values(this.taskSummaries).map(summary => ({
            value: summary.totalTime,
            color: summary.task.color,
            label: summary.task.title
        }));

        this.pieChart = new Chart(ctx, {
            type: 'pie',
            data: {
                labels: data.map(d => d.label),
                datasets: [{
                    data: data.map(d => d.value),
                    backgroundColor: data.map(d => d.color)
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        position: 'right'
                    },
                    datalabels: {
                        formatter: (value, ctx) => {
                            const total = ctx.dataset.data.reduce((a, b) => a + b, 0);
                            const percentage = ((value / total) * 100).toFixed(1) + '%';
                            return percentage;
                        },
                        color: '#fff'
                    }
                }
            }
        });
    }

    /**
     * @brief Crée un graphique en barres des temps moyens par tâche.
     */
    createBarChart() {
        const ctx = document.getElementById('barChart').getContext('2d');
        const data = Object.values(this.taskSummaries).map(summary => ({
            label: summary.task.title,
            avgTime: summary.entries.length > 0 ? summary.totalTime / summary.entries.length : 0,
            color: summary.task.color
        }));

        this.barChart = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: data.map(d => d.label),
                datasets: [{
                    label: 'Temps moyen (ms)',
                    data: data.map(d => d.avgTime),
                    backgroundColor: data.map(d => d.color)
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                    y: {
                        beginAtZero: true,
                        ticks: {
                            callback: value => formatDuration(value)
                        }
                    }
                },
                plugins: {
                    legend: {
                        display: false
                    },
                    datalabels: {
                        formatter: value => formatDuration(value),
                        anchor: 'end',
                        align: 'top'
                    }
                }
            }
        });
    }

    /**
     * @brief Crée une courbe de Gauss pour chaque tâche ayant au moins 2 mesures.
     */
    createGaussChart() {
        const ctx = document.getElementById('gaussChart').getContext('2d');
        const datasets = Object.values(this.taskSummaries).map(summary => {
            const durations = summary.entries.map(entry => entry.duration);
            if (durations.length < 2) {
                return null;
            }
            const gaussData = this.calculateGaussianData(durations);

            return {
                label: summary.task.title,
                data: gaussData.map(point => ({x: point.x, y: point.y})),
                borderColor: summary.task.color,
                backgroundColor: `${summary.task.color}33`,
                fill: true,
                pointRadius: 0
            };
        }).filter(dataset => dataset !== null);

        if (datasets.length > 0) {
            this.gaussChart = new Chart(ctx, {
                type: 'line',
                data: {
                    datasets: datasets
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    parsing: {
                        xAxisKey: 'x',
                        yAxisKey: 'y'
                    },
                    scales: {
                        x: {
                            type: 'linear',
                            position: 'bottom',
                            ticks: {
                                callback: value => formatDuration(value)
                            },
                            title: {
                                display: true,
                                text: 'Durée de l\'activité'
                            }
                        },
                        y: {
                            beginAtZero: true,
                            title: {
                                display: true,
                                text: 'Fréquence'
                            }
                        }
                    },
                    plugins: {
                        legend: {
                            position: 'top'
                        },
                        tooltip: {
                            callbacks: {
                                label: (context) => {
                                    return `${context.dataset.label}: ${formatDuration(context.parsed.x)}`;
                                }
                            }
                        }
                    }
                }
            });
        } else {
            const container = document.getElementById('gaussChart').parentElement.parentElement;
            container.innerHTML = '<p class="no-data-message">Pas assez de données pour afficher la courbe de Gauss. Il faut au moins 2 mesures par activité.</p>';
            this.gaussChart = null;
        }
    }

    /**
     * @brief Initialise la page en préparant les résumés et affichant les informations.
     */
    initializePage() {
        this.prepareSummaries();
        this.displaySessionInfo();
        this.displayTasksSummary();
        this.setupExportButtons();
    }

     /**
     * @brief Prépare les résumés des tâches à partir des données et de l'historique.
     */
    prepareSummaries() {
        this.tasks.forEach(task => {
            this.taskSummaries[task.id] = {
                task: task,
                entries: [],
                totalTime: 0
            };
        });

        this.timeHistory.forEach(entry => {
            if (this.taskSummaries[entry.taskId]) {
                this.taskSummaries[entry.taskId].entries.push(entry);
                this.taskSummaries[entry.taskId].totalTime += entry.duration;
            }
        });
    }

    /**
     * @brief Affiche les informations de la session (collaborateur, observateur, date).
     */
    displaySessionInfo() {
        if (this.observationInfo) {
            const formattedDate = new Date(this.observationInfo.examDate).toLocaleDateString('fr-FR');
            document.getElementById('session-info').innerHTML = `
                <p><strong>Collaborateur :</strong> ${this.observationInfo.examineeName}</p>
                <p><strong>Observateur :</strong> ${this.observationInfo.examinerName}</p>
                <p><strong>Date :</strong> ${formattedDate}</p>
            `;
        }
    }

    /**
     * @brief Affiche le résumé des tâches avec détails et temps total.
     */
    displayTasksSummary() {
        const tasksSummaryDiv = document.getElementById('tasks-summary');
        Object.values(this.taskSummaries).forEach(summary => {
            const taskDiv = document.createElement('div');
            taskDiv.className = 'task-summary';
            
            const isVA = summary.task.hasOwnProperty('va') ? summary.task.va === true : null;

            taskDiv.innerHTML = `
                <div class="task-summary-header" style="background-color: ${summary.task.color}">
                    <h2>${summary.task.title}</h2>
                </div>
                <div class="task-summary-body">
                    <p>${summary.task.description || 'Aucune description'}</p>
                    <div class="time-entries">
                        ${summary.entries.map(entry => `
                            <div class="time-entry">
                                <span>De ${formatTime(entry.startTime)} à ${formatTime(entry.endTime)}</span>
                                <span>${formatDuration(entry.duration)}</span>
                            </div>
                        `).join('')}
                    </div>
                    <div class="total-time">
                        Temps total : ${formatDuration(summary.totalTime)}
                    </div>
                    <div class="va-nva-controls" data-task-id="${summary.task.id}">
                        <span class="classification-label">Classification :</span>
                        <button type="button" class="classification-button va ${isVA === true ? 'selected' : ''}" data-task-id="${summary.task.id}" aria-pressed="${isVA === true}">VA</button>
                        <button type="button" class="classification-button nva ${isVA === false ? 'selected' : ''}" data-task-id="${summary.task.id}" aria-pressed="${isVA === false}">NVA</button>
                    </div>
                </div>
            `;
            
            // Attache les écouteurs de clic pour VA/NVA
            const vaBtn = taskDiv.querySelector('.classification-button.va');
            const nvaBtn = taskDiv.querySelector('.classification-button.nva');
            vaBtn.addEventListener('click', () => this.setTaskClassification(summary.task.id, true, vaBtn, nvaBtn));
            nvaBtn.addEventListener('click', () => this.setTaskClassification(summary.task.id, false, vaBtn, nvaBtn));

            tasksSummaryDiv.appendChild(taskDiv);
        });
    }

    /**
     * @brief Définit et persiste la classification VA/NVA d'une tâche puis met à jour le visuel.
     * @param {number} taskId Identifiant de la tâche
     * @param {boolean} isVA true si VA, false si NVA
     * @param {HTMLButtonElement} vaBtn Bouton VA lié
     * @param {HTMLButtonElement} nvaBtn Bouton NVA lié
     */
    setTaskClassification(taskId, isVA, vaBtn, nvaBtn) {
        // Met à jour la donnée en mémoire
        const idx = this.tasks.findIndex(t => t.id === taskId);
        if (idx === -1) return;
        this.tasks[idx].va = isVA;

        // Persiste dans le stockage
        Storage.set('tasks', this.tasks);

        // Met à jour les classes sélectionnées
        requestAnimationFrame(() => {
            vaBtn.classList.toggle('selected', isVA === true);
            vaBtn.setAttribute('aria-pressed', String(isVA === true));
            nvaBtn.classList.toggle('selected', isVA === false);
            nvaBtn.setAttribute('aria-pressed', String(isVA === false));
        });

        // Met à jour le diagramme VA/NVA
        this.updateVaNvaChart();
    }

    /**
     * @brief Configure le bouton d'export Excel.
     */
    setupExportButtons() {
        const btnNativeCharts = document.getElementById('exportExcelNativeChartsButton');
        if (btnNativeCharts) {
            // Use the smart exporter which will try the simple user template first
            btnNativeCharts.addEventListener('click', async () => {
                const statusEl = document.getElementById('exportStatus');
                try {
                    if (statusEl) statusEl.textContent = 'Démarrage de l\'export...';
                    await this.exportExcelSmart();
                    if (statusEl) statusEl.textContent = 'Export terminé (si un fichier n\'a pas été téléchargé, vérifie la console ou le template).';
                } catch (e) {
                    // conserve l'alerte, supprime les logs
                    if (statusEl) statusEl.textContent = `Erreur lors de l'export : ${e && e.message ? e.message : e}`;
                    alert('Erreur lors de l\'export - regarde la console pour plus de détails.');
                }
            });
        }
    }

    /**
     * @brief Exporte les données de la session et des tâches au format Excel.
     */
    exportToExcel() {
        const wb = XLSX.utils.book_new();
        
        const infoData = [
            ['Informations de la session'],
            ['Collaborateur', this.observationInfo.examineeName],
            ['Observateur', this.observationInfo.examinerName],
            ['Date', new Date(this.observationInfo.examDate).toLocaleDateString('fr-FR')],
            [],
            ['Résumé des temps par tâche'],
            ['Tâche', 'Temps total', 'Pourcentage', 'Classification']
        ];

        let totalSessionTime = 0;
        Object.values(this.taskSummaries).forEach(summary => {
            totalSessionTime += summary.totalTime;
        });

        Object.values(this.taskSummaries).forEach(summary => {
            const percentage = ((summary.totalTime / totalSessionTime) * 100).toFixed(2);
            const classif = summary.task.hasOwnProperty('va') ? (summary.task.va ? 'VA' : 'NVA') : '';
            infoData.push([
                summary.task.title,
                formatDuration(summary.totalTime),
                `${percentage}%`,
                classif
            ]);
        });

        infoData.push([], ['Temps total de la session', formatDuration(totalSessionTime)]);
        
        const statsData = [
            ['Statistiques détaillées par tâche'],
            ['Tâche', 'Temps total', 'Nombre d\'occurrences', 'Temps moyen', 'Temps minimum', 'Temps maximum', 'Pourcentage du temps total', 'Classification']
        ];

        Object.values(this.taskSummaries).forEach(summary => {
            const durations = summary.entries.map(entry => entry.duration);
            const avgTime = durations.length > 0 ? summary.totalTime / durations.length : 0;
            const minTime = durations.length > 0 ? Math.min(...durations) : 0;
            const maxTime = durations.length > 0 ? Math.max(...durations) : 0;
            const percentage = ((summary.totalTime / totalSessionTime) * 100).toFixed(2) + '%';
            const classif = summary.task.hasOwnProperty('va') ? (summary.task.va ? 'VA' : 'NVA') : '';

            statsData.push([
                summary.task.title,
                formatDuration(summary.totalTime),
                durations.length,
                formatDuration(avgTime),
                formatDuration(minTime),
                formatDuration(maxTime),
                percentage,
                classif
            ]);

            if (durations.length >= 2) {
                statsData.push([]);
                statsData.push([`Distribution des temps pour : ${summary.task.title}`]);
                statsData.push(['Mesure', 'Durée', 'Écart par rapport à la moyenne']);
                
                durations.forEach((duration, index) => {
                    const ecart = duration - avgTime;
                    statsData.push([
                        `#${index + 1}`,
                        formatDuration(duration),
                        formatDuration(ecart)
                    ]);
                });
                statsData.push([]);
            }
        });

        const detailsData = [
            ['Détails chronologiques des activités'],
            ['Tâche', 'Début', 'Fin', 'Durée']
        ];

        const allEntries = [];
        Object.values(this.taskSummaries).forEach(summary => {
            summary.entries.forEach(entry => {
                allEntries.push({
                    taskTitle: summary.task.title,
                    ...entry
                });
            });
        });

        allEntries.sort((a, b) => a.startTime - b.startTime);

        allEntries.forEach(entry => {
            detailsData.push([
                entry.taskTitle,
                formatTime(entry.startTime),
                formatTime(entry.endTime),
                formatDuration(entry.duration)
            ]);
        });

        const wsInfo = XLSX.utils.aoa_to_sheet(infoData);
        const wsStats = XLSX.utils.aoa_to_sheet(statsData);
        const wsDetails = XLSX.utils.aoa_to_sheet(detailsData);

        // Données pour le diagramme VA/NVA
        const { vaTime, nvaTime, unclassifiedTime } = this.getVaNvaTotals();
        const totalForClassif = totalSessionTime || 1;
        const vaNvaData = [
            ['Répartition VA / NVA'],
            ['Catégorie', 'Temps total', 'Pourcentage'],
            ['VA', formatDuration(vaTime), `${((vaTime / totalForClassif) * 100).toFixed(2)}%`],
            ['NVA', formatDuration(nvaTime), `${((nvaTime / totalForClassif) * 100).toFixed(2)}%`],
            ['Non classé', formatDuration(unclassifiedTime), `${((unclassifiedTime / totalForClassif) * 100).toFixed(2)}%`]
        ];
        const wsVaNva = XLSX.utils.aoa_to_sheet(vaNvaData);

        // Données des courbes de Gauss utilisées pour le graphique
        const gaussSheetData = [
            ['Courbes de Gauss (points normalisés)'],
            ['Tâche', 'x (ms)', 'y (normalisé)']
        ];
        let gaussAny = false;
        Object.values(this.taskSummaries).forEach(summary => {
            const durations = summary.entries.map(e => e.duration);
            if (durations.length >= 2) {
                const points = this.calculateGaussianData(durations);
                gaussSheetData.push([]);
                gaussSheetData.push([`Tâche : ${summary.task.title}`]);
                gaussSheetData.push(['Tâche', 'x (ms)', 'y (normalisé)']);
                points.forEach(p => {
                    gaussSheetData.push([summary.task.title, Math.round(p.x), Number(p.y.toFixed(6))]);
                });
                gaussAny = true;
            }
        });
        if (!gaussAny) {
            gaussSheetData.push([]);
            gaussSheetData.push(['Pas assez de données pour générer des courbes de Gauss (au moins 2 mesures par activité).']);
        }
        const wsGauss = XLSX.utils.aoa_to_sheet(gaussSheetData);

        XLSX.utils.book_append_sheet(wb, wsInfo, "Résumé");
        XLSX.utils.book_append_sheet(wb, wsStats, "Statistiques");
        XLSX.utils.book_append_sheet(wb, wsDetails, "Chronologie");
    XLSX.utils.book_append_sheet(wb, wsVaNva, "VA_NVA");
    XLSX.utils.book_append_sheet(wb, wsGauss, "Gauss");

        const date = new Date().toISOString().split('T')[0];
        const filename = `suivi_operateur_${this.observationInfo.examineeName}_${date}.xlsx`;
        XLSX.writeFile(wb, filename);
    }

    /**
     * @brief Génère un classeur template avec les feuilles et plages nommées requises (sans graphiques), à compléter une fois dans Excel.
     */
    downloadBlankTemplateWorkbook() {
        // Utilise SheetJS (XLSX) déjà chargé
        if (typeof XLSX === 'undefined') {
            alert('Librairie XLSX non disponible.');
            return;
        }

        const wb = XLSX.utils.book_new();

        // Helper pour créer une feuille avec en-têtes et lignes vides
        const makeSheet = (title, headers, rows = 1000) => {
            const data = [headers];
            for (let i = 0; i < rows - 1; i++) data.push(new Array(headers.length).fill(''));
            const ws = XLSX.utils.aoa_to_sheet(data);
            XLSX.utils.book_append_sheet(wb, ws, title);
            const endCol = String.fromCharCode('A'.charCodeAt(0) + headers.length - 1);
            const ref = `${title}!$A$1:$${endCol}$${rows}`;
            return { ws, ref };
        };

        const vaNva = makeSheet('DATA_VA_NVA', ['Catégorie', 'Temps total', 'Pourcentage'], 100);
        const activity = makeSheet('DATA_ACTIVITY', ['Tâche', 'Temps total', 'Pourcentage', 'Classification'], 1000);
        const barAvg = makeSheet('DATA_BAR_AVG', ['Tâche', 'Temps moyen'], 1000);
        const gauss = makeSheet('DATA_GAUSS', ['Tâche', 'x (ms)', 'y (normalisé)'], 5000);
        const timeline = makeSheet('DATA_TIMELINE', ['Tâche', 'Début', 'Fin', 'Durée'], 5000);

        // Définition des plages nommées attendues par l'export natif
        wb.Workbook = wb.Workbook || {};
        wb.Workbook.Names = [
            { Name: 'VA_NVA_DATA', Ref: vaNva.ref },
            { Name: 'ACTIVITY_BREAKDOWN', Ref: activity.ref },
            { Name: 'BAR_AVG', Ref: barAvg.ref },
            { Name: 'GAUSS_POINTS', Ref: gauss.ref },
            { Name: 'TIMELINE', Ref: timeline.ref },
        ];

        // Télécharger le fichier
        const date = new Date().toISOString().split('T')[0];
        const filename = `template_charts_${date}.xlsx`;
        XLSX.writeFile(wb, filename);

        // Message d’aide
        setTimeout(() => {
            alert("Template téléchargé. Ouvrez-le dans Excel, insérez vos graphiques qui pointent vers les plages nommées (ex: VA_NVA_DATA), puis enregistrez-le sous 'template_charts.xlsx' et placez-le dans assets/excel/ ou uploadez-le depuis la page.");
        }, 200);
    }

    /**
     * @brief Exporte vers Excel (ExcelJS) en embarquant les graphiques comme images.
     */
    async exportToExcelWithCharts() {
        if (typeof ExcelJS === 'undefined') {
            alert('ExcelJS non disponible. Vérifiez la connexion internet.');
            return;
        }

        const workbook = new ExcelJS.Workbook();
        const date = new Date().toISOString().split('T')[0];
        const filename = `suivi_operateur_${this.observationInfo.examineeName}_${date}_charts.xlsx`;

        // 1) Feuille Résumé (similaire à exportToExcel)
        const wsInfo = workbook.addWorksheet('Résumé');
        const infoRows = [
            ['Informations de la session'],
            ['Collaborateur', this.observationInfo.examineeName],
            ['Observateur', this.observationInfo.examinerName],
            ['Date', new Date(this.observationInfo.examDate).toLocaleDateString('fr-FR')],
            [],
            ['Résumé des temps par tâche'],
            ['Tâche', 'Temps total', 'Pourcentage', 'Classification']
        ];
        let totalSessionTime = 0;
        Object.values(this.taskSummaries).forEach(s => totalSessionTime += s.totalTime);
        Object.values(this.taskSummaries).forEach(s => {
            const percentage = ((s.totalTime / (totalSessionTime || 1)) * 100).toFixed(2) + '%';
            const classif = s.task.hasOwnProperty('va') ? (s.task.va ? 'VA' : 'NVA') : '';
            infoRows.push([s.task.title, formatDuration(s.totalTime), percentage, classif]);
        });
        infoRows.push([], ['Temps total de la session', formatDuration(totalSessionTime)]);
        wsInfo.addRows(infoRows);

        // 2) Feuille Statistiques
        const wsStats = workbook.addWorksheet('Statistiques');
        const statsRows = [
            ['Statistiques détaillées par tâche'],
            ["Tâche", "Temps total", "Nombre d'occurrences", "Temps moyen", "Temps minimum", "Temps maximum", "Pourcentage du temps total", "Classification"]
        ];
        Object.values(this.taskSummaries).forEach(summary => {
            const durations = summary.entries.map(e => e.duration);
            const avgTime = durations.length ? summary.totalTime / durations.length : 0;
            const minTime = durations.length ? Math.min(...durations) : 0;
            const maxTime = durations.length ? Math.max(...durations) : 0;
            const percentage = ((summary.totalTime / (totalSessionTime || 1)) * 100).toFixed(2) + '%';
            const classif = summary.task.hasOwnProperty('va') ? (summary.task.va ? 'VA' : 'NVA') : '';
            statsRows.push([
                summary.task.title,
                formatDuration(summary.totalTime),
                durations.length,
                formatDuration(avgTime),
                formatDuration(minTime),
                formatDuration(maxTime),
                percentage,
                classif
            ]);
            if (durations.length >= 2) {
                statsRows.push([]);
                statsRows.push([`Distribution des temps pour : ${summary.task.title}`]);
                statsRows.push(['Mesure', 'Durée', "Écart par rapport à la moyenne"]);
                durations.forEach((d, i) => {
                    const ecart = d - avgTime;
                    statsRows.push([`#${i + 1}`, formatDuration(d), formatDuration(ecart)]);
                });
                statsRows.push([]);
            }
        });
        wsStats.addRows(statsRows);

        // 3) Feuille Chronologie
        const wsDetails = workbook.addWorksheet('Chronologie');
        const detailsRows = [['Détails chronologiques des activités'], ['Tâche', 'Début', 'Fin', 'Durée']];
        const allEntries = [];
        Object.values(this.taskSummaries).forEach(s => s.entries.forEach(e => allEntries.push({ taskTitle: s.task.title, ...e })));
        allEntries.sort((a, b) => a.startTime - b.startTime);
        allEntries.forEach(e => detailsRows.push([e.taskTitle, formatTime(e.startTime), formatTime(e.endTime), formatDuration(e.duration)]));
        wsDetails.addRows(detailsRows);

        // 4) Feuille VA_NVA
        const wsVaNva = workbook.addWorksheet('VA_NVA');
        const { vaTime, nvaTime, unclassifiedTime } = this.getVaNvaTotals();
        const totalForClassif = totalSessionTime || 1;
        const vaNvaRows = [
            ['Répartition VA / NVA'],
            ['Catégorie', 'Temps total', 'Pourcentage'],
            ['VA', formatDuration(vaTime), `${((vaTime / totalForClassif) * 100).toFixed(2)}%`],
            ['NVA', formatDuration(nvaTime), `${((nvaTime / totalForClassif) * 100).toFixed(2)}%`],
            ['Non classé', formatDuration(unclassifiedTime), `${((unclassifiedTime / totalForClassif) * 100).toFixed(2)}%`]
        ];
        wsVaNva.addRows(vaNvaRows);

        // 5) Feuille Gauss (points)
        const wsGauss = workbook.addWorksheet('Gauss');
        const gaussRows = [['Courbes de Gauss (points normalisés)'], ['Tâche', 'x (ms)', 'y (normalisé)']];
        let gaussAny = false;
        Object.values(this.taskSummaries).forEach(summary => {
            const durations = summary.entries.map(e => e.duration);
            if (durations.length >= 2) {
                const points = this.calculateGaussianData(durations);
                gaussRows.push([]);
                gaussRows.push([`Tâche : ${summary.task.title}`]);
                gaussRows.push(['Tâche', 'x (ms)', 'y (normalisé)']);
                points.forEach(p => gaussRows.push([summary.task.title, Math.round(p.x), Number(p.y.toFixed(6))]));
                gaussAny = true;
            }
        });
        if (!gaussAny) {
            gaussRows.push([]);
            gaussRows.push(['Pas assez de données pour générer des courbes de Gauss (au moins 2 mesures par activité).']);
        }
        wsGauss.addRows(gaussRows);

        // 6) Feuille Graphiques avec images des charts
        const wsCharts = workbook.addWorksheet('Graphiques');
        let currentRow = 1;
        const addChartImage = (title, chartInstance) => {
            if (!chartInstance) return;
            const dataUrl = chartInstance.toBase64Image();
            const base64 = (dataUrl || '').split(',')[1];
            if (!base64) return;
            wsCharts.getCell(currentRow, 1).value = title;
            wsCharts.getCell(currentRow, 1).font = { bold: true };
            currentRow += 1;
            const imageId = workbook.addImage({ base64, extension: 'png' });
            // Place image roughly starting at col 1, currentRow, with width/height
            wsCharts.addImage(imageId, {
                tl: { col: 0, row: currentRow },
                ext: { width: 800, height: 400 }
            });
            currentRow += 25; // leave space before next chart
        };

        addChartImage('Répartition VA / NVA', this.vaNvaChart);
        addChartImage('Répartition du temps par activité', this.pieChart);
        addChartImage('Temps moyen par activité', this.barChart);
        addChartImage('Distribution des temps (Gauss)', this.gaussChart);

        // Téléchargement
        const buffer = await workbook.xlsx.writeBuffer();
        const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    }

    /**
     * @brief Exporte un Excel avec graphiques natifs en s'appuyant sur un template existant contenant des graphiques reliés à des plages nommées.
     * Le template doit être accessible à l'URL ../assets/excel/template_charts.xlsx et contenir les plages nommées suivantes :
     *  - VA_NVA_DATA (3 lignes: VA/NVA/Non classé, colonnes: Catégorie | Temps total | Pourcentage)
     *  - ACTIVITY_BREAKDOWN (N lignes: Tâche | Temps total | Pourcentage | Classification)
     *  - BAR_AVG (N lignes: Tâche | Temps moyen)
     *  - GAUSS_POINTS (plusieurs blocs: Tâche | x (ms) | y)
     *  - TIMELINE (N lignes: Tâche | Début | Fin | Durée)
     */
    async exportToExcelWithNativeChartsTemplate() {
        if (typeof XlsxPopulate === 'undefined') {
            alert('XlsxPopulate non disponible. Vérifiez la connexion internet.');
            return;
        }

        // Récupère le template depuis les assets
        const templateUrl = '../assets/excel/template_charts.xlsx';
        let arrayBuffer;
        try {
            const res = await fetch(templateUrl);
            if (!res.ok) throw new Error(`Template non trouvé (${res.status})`);
            arrayBuffer = await res.arrayBuffer();
        } catch (e) {
            alert("Template manquant. Ajoutez 'template_charts.xlsx' dans assets/excel/ puis réessayez.");
            return;
        }

        try {
            await this._buildAndDownloadNativeFromArrayBuffer(arrayBuffer);
        } catch (e) {
            alert("Impossible de générer le fichier à partir du template. Vérifiez que les plages nommées existent et réessayez.");
        }
    }

    /**
     * @brief Construit et télécharge un classeur natif à partir d'un ArrayBuffer de template XLSX.
     */
    async _buildAndDownloadNativeFromArrayBuffer(arrayBuffer) {
        const workbook = await XlsxPopulate.fromDataAsync(arrayBuffer);

        // Vérifie que le template contient les plages nommées attendues
        const requiredNames = ['VA_NVA_DATA', 'ACTIVITY_BREAKDOWN', 'BAR_AVG', 'GAUSS_POINTS', 'TIMELINE'];
        const missing = requiredNames.filter(n => !workbook.definedName(n));
        if (missing.length) {
            alert(`Le template ne contient pas toutes les plages nommées requises:\n- ${missing.join('\n- ')}`);
            return;
        }

        // 1) VA/NVA
        const { vaTime, nvaTime, unclassifiedTime } = this.getVaNvaTotals();
        const totalForClassif = Object.values(this.taskSummaries).reduce((acc, s) => acc + (s.totalTime || 0), 0) || 1;
        const toExcelTime = (ms) => (ms || 0) / 86400000; // fraction de jour Excel
        const vaNvaRows = [
            ['VA', toExcelTime(vaTime), (vaTime / (totalForClassif || 1))],
            ['NVA', toExcelTime(nvaTime), (nvaTime / (totalForClassif || 1))],
            ['Non classé', toExcelTime(unclassifiedTime), (unclassifiedTime / (totalForClassif || 1))]
        ];
        this._fillNamedRangeSafe(workbook, 'VA_NVA_DATA', vaNvaRows, { numberFormats: { 2: '[h]:mm:ss', 3: '0.00%' }, skipHeader: false });

        // 2) Répartition par activité (camembert)
        let totalSessionTime = 0;
        Object.values(this.taskSummaries).forEach(s => totalSessionTime += s.totalTime);
        const activityRows = [['Tâche', 'Temps total', 'Pourcentage', 'Classification']];
        Object.values(this.taskSummaries).forEach(s => {
            const pct = (s.totalTime / (totalSessionTime || 1));
            const classif = s.task.hasOwnProperty('va') ? (s.task.va ? 'VA' : 'NVA') : '';
            activityRows.push([s.task.title, toExcelTime(s.totalTime), pct, classif]);
        });
        this._fillNamedRangeSafe(workbook, 'ACTIVITY_BREAKDOWN', activityRows, { numberFormats: { 2: '[h]:mm:ss', 3: '0.00%' }, skipHeader: true });

        // 3) Barres des temps moyens
        const barAvgRows = [['Tâche', 'Temps moyen']];
        Object.values(this.taskSummaries).forEach(s => {
            const durations = s.entries.map(e => e.duration);
            const avg = durations.length ? s.totalTime / durations.length : 0;
            barAvgRows.push([s.task.title, toExcelTime(avg)]);
        });
        this._fillNamedRangeSafe(workbook, 'BAR_AVG', barAvgRows, { numberFormats: { 2: '[h]:mm:ss' }, skipHeader: true });

        // 4) Points Gauss
        const gaussRows = [['Tâche', 'x (ms)', 'y']];
        Object.values(this.taskSummaries).forEach(s => {
            const durations = s.entries.map(e => e.duration);
            if (durations.length >= 2) {
                const points = this.calculateGaussianData(durations);
                points.forEach(p => gaussRows.push([s.task.title, Math.round(p.x), Number(p.y.toFixed(6))]));
            }
        });
        this._fillNamedRangeSafe(workbook, 'GAUSS_POINTS', gaussRows);

        // 5) Chronologie
    const timelineRows = [['Tâche', 'Début', 'Fin', 'Durée']];
        const allEntries = [];
        Object.values(this.taskSummaries).forEach(s => s.entries.forEach(e => allEntries.push({ taskTitle: s.task.title, ...e })));
        allEntries.sort((a, b) => a.startTime - b.startTime);
    allEntries.forEach(e => timelineRows.push([e.taskTitle, formatTime(e.startTime), formatTime(e.endTime), toExcelTime(e.duration)]));
    this._fillNamedRangeSafe(workbook, 'TIMELINE', timelineRows, { numberFormats: { 4: '[h]:mm:ss' }, skipHeader: true });

        // Sauvegarde
        const out = await workbook.outputAsync();
        const blob = new Blob([out], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
        const date = new Date().toISOString().split('T')[0];
        const filename = `suivi_operateur_${this.observationInfo.examineeName}_${date}_native.xlsx`;
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    }

    /**
     * @brief Export intelligent: tente d'abord le natif via template, sinon images, sinon données.
     */
    async exportExcelSmart() {
        // Tente natif via template
        if (typeof XlsxPopulate !== 'undefined') {
            try {
                const templateInput = document.getElementById('templateUpload');
                if (templateInput && templateInput.files && templateInput.files[0]) {
                    const buf = await templateInput.files[0].arrayBuffer();
                    // Try to detect a simple user template (columns: Tâche, Début, Fin, Durée, VA/NVA)
                    const handled = await this._tryFillUserTemplateFromArrayBuffer(buf);
                    if (handled) return;
                    // fallback to native named-range template
                    await this._buildAndDownloadNativeFromArrayBuffer(buf);
                    return;
                }
                // Essaye de récupérer depuis assets
                try {
                    const res = await fetch('../assets/excel/template_charts.xlsx');
                    if (res.ok) {
                        const buf = await res.arrayBuffer();
                        // Try to fill as a simple user template first, otherwise use the named-range native template
                        const handled = await this._tryFillUserTemplateFromArrayBuffer(buf);
                        if (handled) return;
                        await this._buildAndDownloadNativeFromArrayBuffer(buf);
                        return;
                    }
                } catch (_) { /* ignore */ }
            } catch (e) {
                // fallback silencieux
            }
        }

        // Fallback images
        try {
            await this.exportToExcelWithCharts();
            return;
        } catch (e) {
            // fallback silencieux
        }

        // Fallback données
        this.exportToExcel();
    }

    /**
     * @brief Remplit en sécurité une plage nommée si elle existe; sinon log un avertissement.
     * @param {*} workbook XlsxPopulate workbook
     * @param {string} name Nom de plage définie dans le template
     * @param {Array<Array<any>>} rows Données à écrire
     */
    _fillNamedRangeSafe(workbook, name, rows, options = {}) {
        try {
            const defined = workbook.definedName(name);
            if (!defined) {
                // plage nommée absente dans le template
                return;
            }
            const range = defined.range();
            const sheet = range.sheet();
            const startRow = range._address.rowNumber();
            const startCol = range._address.columnNumber();

            // Écrit les lignes à partir de la cellule de départ
            rows.forEach((row, rIdx) => {
                row.forEach((val, cIdx) => {
                    const cell = sheet.cell(startRow + rIdx, startCol + cIdx);
                    cell.value(val);
                    // Applique un format numérique si demandé
                    if (options.numberFormats && options.numberFormats[cIdx + 1]) {
                        const isHeader = rIdx === 0;
                        if (!(options.skipHeader && isHeader)) {
                            try { cell.style('numberFormat', options.numberFormats[cIdx + 1]); } catch (_) { /* ignore */ }
                        }
                    }
                });
            });
        } catch (e) {
            // impossible d'écrire la plage nommée
        }
    }

    /**
     * @brief Tente de remplir un template utilisateur simple contenant les en-têtes
     * 'Tâche', 'Début', 'Fin', 'Durée', 'VA/NVA'. Si le template correspond, on
     * écrit les lignes et force le téléchargement. Retourne true si traité.
     * @param {ArrayBuffer} arrayBuffer
     * @returns {Promise<boolean>}
     */
    async _tryFillUserTemplateFromArrayBuffer(arrayBuffer) {
        try {
            const workbook = await XlsxPopulate.fromDataAsync(arrayBuffer);
            // Recherche d'une feuille contenant les en-têtes attendus.
            // On est tolérant : on cherche sur les 5 premières lignes, insensible à la casse
            // et aux accents/espaces additionnels.
            const required = ['Tâche', 'Début', 'Fin', 'Durée', 'VA/NVA'];
            const normalize = s => String(s || '').normalize('NFD').replace(/\p{Diacritic}/gu, '').replace(/[\s\u00A0]+/g, ' ').trim().toLowerCase();
            // Fallback for environments where \p{Diacritic} is not supported
            const safeNormalize = s => {
                try { return normalize(s); } catch (e) { return String(s || '').normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[\s\u00A0]+/g, ' ').trim().toLowerCase(); }
            };

            let targetSheet = null;
            let headerRowIndex = null;
            let headerMap = null;

            const sheets = workbook.sheets();
            for (let i = 0; i < sheets.length; i++) {
                const sh = sheets[i];
                // Cherche sur les premières lignes (1..5)
                for (let r = 1; r <= 5; r++) {
                    const values = [];
                    for (let c = 1; c <= 30; c++) {
                        try {
                            const v = sh.row(r).cell(c).value();
                            values.push(v === null || v === undefined ? '' : String(v).trim());
                        } catch (_) { values.push(''); }
                    }
                    // Construire map normalisée
                    const normValues = values.map(safeNormalize);
                    const requiredNorm = required.map(safeNormalize);
                    const found = requiredNorm.every(h => normValues.includes(h));
                    if (found) {
                        targetSheet = sh;
                        headerRowIndex = r;
                        headerMap = {};
                        normValues.forEach((v, idx) => { if (v) headerMap[v] = idx + 1; });
                        break;
                    }
                }
                if (targetSheet) break;
            }

            if (!targetSheet) {
                return false;
            }

            // Prépare les lignes à écrire (commence après la ligne d'en-têtes)
            const allEntries = [];
            Object.values(this.taskSummaries).forEach(s => s.entries.forEach(e => allEntries.push({ taskTitle: s.task.title, task: s.task, ...e })));
            allEntries.sort((a,b) => a.startTime - b.startTime);

            // Trouve la première ligne vide après l'en-tête : on considère vide si toutes
            // les cellules correspondant aux en-têtes sont vides.
            let writeRow = headerRowIndex + 1;
            const headerCols = Object.values(headerMap);
            const isRowEmpty = (rIdx) => {
                return headerCols.every(col => {
                    try {
                        const v = targetSheet.row(rIdx).cell(col).value();
                        return v === null || v === undefined || String(v).trim() === '';
                    } catch (_) { return true; }
                });
            };
            while (!isRowEmpty(writeRow)) writeRow++;

            // Ecrit chaque entrée
            const toExcelTime = (ms) => (ms || 0) / 86400000; // fraction of day
            allEntries.forEach((e, idx) => {
                const r = writeRow + idx;
                // Use normalized header keys
                const colTache = headerMap[safeNormalize('Tâche')];
                const colDebut = headerMap[safeNormalize('Début')];
                const colFin = headerMap[safeNormalize('Fin')];
                const colDuree = headerMap[safeNormalize('Durée')];
                const colVa = headerMap[safeNormalize('VA/NVA')];

                // Tâche
                if (colTache) targetSheet.row(r).cell(colTache).value(e.taskTitle);
                // Début (écrire en tant que date si possible)
                if (colDebut) {
                    try { targetSheet.row(r).cell(colDebut).value(new Date(e.startTime)); } catch (_) { targetSheet.row(r).cell(colDebut).value(formatTime(e.startTime)); }
                }
                // Fin
                if (colFin) {
                    try { targetSheet.row(r).cell(colFin).value(new Date(e.endTime)); } catch (_) { targetSheet.row(r).cell(colFin).value(e.endTime ? formatTime(e.endTime) : ''); }
                }
                // Durée: on laisse vide pour que la formule du template la calcule; sinon écrire fraction de jour
                if (colDuree) {
                    // if template expects formula, leave blank. Optionally write numeric duration:
                    // targetSheet.row(r).cell(colDuree).value(toExcelTime(e.duration));
                }
                // VA/NVA
                if (colVa) {
                    const classif = e.task && e.task.hasOwnProperty('va') ? (e.task.va ? 'VA' : 'NVA') : '';
                    targetSheet.row(r).cell(colVa).value(classif);
                }
            });
            const linesWritten = allEntries.length;

            // Force le téléchargement du workbook modifié
            const out = await workbook.outputAsync();
            const blob = new Blob([out], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
            const date = new Date().toISOString().split('T')[0];
            const filename = `suivi_operateur_${this.observationInfo.examineeName}_${date}_from_template.xlsx`;
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = filename;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);

            // Update UI with number of lines written
            try {
                const statusEl = document.getElementById('exportStatus');
                if (statusEl) statusEl.textContent = `Template détecté et rempli : ${linesWritten} ligne(s) ajoutée(s). Téléchargement déclenché.`;
                alert(`Template rempli : ${linesWritten} ligne(s) ajoutée(s). Le fichier a été téléchargé.`);
            } catch (_) { /* ignore UI update errors */ }

            return true;
        } catch (e) {
            return false;
        }
    }
}

/**
 * @brief Initialise la page SummaryPage après le chargement du DOM.
 */
document.addEventListener('DOMContentLoaded', () => {
    new SummaryPage();
});