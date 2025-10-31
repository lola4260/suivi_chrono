/**
 * @file resume.js
 * @brief Gestion de la page de synthèse des observations et génération des graphiques/excel.
 *
 * Cette classe récupère les données stockées, calcule les statistiques,
 * affiche les informations sur la session et les tâches, génère des graphiques
 * (camembert, barre, courbe de Gauss) et permet l'export Excel.
 *
 * @date 2025-10-09
 * @author Lola Gauducheau
 */

/**
 * @class SummaryPage
 * @brief Représente la page de synthèse des observations.
 */
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

    /**
     * @brief Calcule les données d'une distribution gaussienne normalisée pour un ensemble de durées.
     * @param {Array<number>} data Tableau des durées en millisecondes.
     * @param {number} points Nombre de points à générer pour la courbe.
     * @return {Array<{x:number, y:number}>} Tableau des points {x, y} normalisés.
     */
    calculateGaussianData(data, points = 50) {
        console.log('Calculating Gaussian data for:', data);
        const mean = data.reduce((a, b) => a + b, 0) / data.length;
        console.log('Mean:', mean);
        const variance = data.reduce((a, b) => a + Math.pow(b - mean, 2), 0) / data.length;
        const stdDev = Math.sqrt(variance);
        console.log('Standard deviation:', stdDev);
        const min = Math.min(...data);
        const max = Math.max(...data);
        const range = max - min;
        const extendedMin = min - (range * 0.2);
        const extendedMax = max + (range * 0.2);
        const step = (extendedMax - extendedMin) / points;
        
        console.log('Range:', { min, max, extendedMin, extendedMax, step });
        
        const gaussianData = [];
        for (let i = 0; i <= points; i++) {
            const x = extendedMin + (step * i);
            const exponent = -Math.pow(x - mean, 2) / (2 * variance);
            const y = (1 / (stdDev * Math.sqrt(2 * Math.PI))) * Math.exp(exponent);
            gaussianData.push({ x, y });
        }

        const maxY = Math.max(...gaussianData.map(point => point.y));
        gaussianData.forEach(point => point.y = point.y / maxY);
        
        console.log('Generated points:', gaussianData.length);
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

        new Chart(ctx, {
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

        new Chart(ctx, {
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
        console.log('Creating Gauss chart');
        console.log('Task summaries:', this.taskSummaries);
        
        const datasets = Object.values(this.taskSummaries).map(summary => {
            const durations = summary.entries.map(entry => entry.duration);
            console.log(`Task ${summary.task.title} has ${durations.length} entries:`, durations);
            
            if (durations.length < 2) {
                console.log(`Skipping task ${summary.task.title} - not enough data points`);
                return null;
            }
            
            const gaussData = this.calculateGaussianData(durations);
            console.log(`Gaussian data for ${summary.task.title}:`, gaussData);

            return {
                label: summary.task.title,
                data: gaussData.map(point => ({x: point.x, y: point.y})),
                borderColor: summary.task.color,
                backgroundColor: `${summary.task.color}33`,
                fill: true,
                pointRadius: 0
            };
        }).filter(dataset => dataset !== null);

        console.log('Final datasets:', datasets);

        if (datasets.length > 0) {
            new Chart(ctx, {
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
            console.log('No datasets available for Gauss chart - need at least 2 entries per task');
            const container = document.getElementById('gaussChart').parentElement.parentElement;
            container.innerHTML = '<p class="no-data-message">Pas assez de données pour afficher la courbe de Gauss. Il faut au moins 2 mesures par activité.</p>';
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
        document.getElementById('exportExcelButton').addEventListener('click', () => this.exportToExcel());
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

        XLSX.utils.book_append_sheet(wb, wsInfo, "Résumé");
        XLSX.utils.book_append_sheet(wb, wsStats, "Statistiques");
        XLSX.utils.book_append_sheet(wb, wsDetails, "Chronologie");

        const date = new Date().toISOString().split('T')[0];
        const filename = `suivi_operateur_${this.observationInfo.examineeName}_${date}.xlsx`;
        XLSX.writeFile(wb, filename);
    }
}

/**
 * @brief Initialise la page SummaryPage après le chargement du DOM.
 */
document.addEventListener('DOMContentLoaded', () => {
    new SummaryPage();
});