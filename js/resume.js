class SummaryPage {
    constructor() {
        this.observationInfo = Storage.get('observationInfo');
        this.tasks = Storage.get('tasks');
        this.timeHistory = Storage.get('timeHistory') || [];
        this.taskSummaries = {};
        this.initializePage();
        this.createCharts();
    }

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

        this.createPieChart();
        this.createBarChart();
        this.createGaussChart();
    }

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

    initializePage() {
        this.prepareSummaries();
        this.displaySessionInfo();
        this.displayTasksSummary();
        this.setupExportButtons();
    }

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

    displayTasksSummary() {
        const tasksSummaryDiv = document.getElementById('tasks-summary');
        Object.values(this.taskSummaries).forEach(summary => {
            const taskDiv = document.createElement('div');
            taskDiv.className = 'task-summary';
            
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
                </div>
            `;
            
            tasksSummaryDiv.appendChild(taskDiv);
        });
    }

    setupExportButtons() {
        document.getElementById('exportExcelButton').addEventListener('click', () => this.exportToExcel());
    }

    exportToExcel() {
        const wb = XLSX.utils.book_new();
        
        const infoData = [
            ['Informations de la session'],
            ['Collaborateur', this.observationInfo.examineeName],
            ['Observateur', this.observationInfo.examinerName],
            ['Date', new Date(this.observationInfo.examDate).toLocaleDateString('fr-FR')],
            [],
            ['Résumé des temps par tâche']
        ];

        let totalSessionTime = 0;
        Object.values(this.taskSummaries).forEach(summary => {
            totalSessionTime += summary.totalTime;
        });

        Object.values(this.taskSummaries).forEach(summary => {
            const percentage = ((summary.totalTime / totalSessionTime) * 100).toFixed(2);
            infoData.push([
                summary.task.title,
                formatDuration(summary.totalTime),
                `${percentage}%`
            ]);
        });

        infoData.push([], ['Temps total de la session', formatDuration(totalSessionTime)]);
        
        const statsData = [
            ['Statistiques détaillées par tâche'],
            ['Tâche', 'Temps total', 'Nombre d\'occurrences', 'Temps moyen', 'Temps minimum', 'Temps maximum', 'Pourcentage du temps total']
        ];

        Object.values(this.taskSummaries).forEach(summary => {
            const durations = summary.entries.map(entry => entry.duration);
            const avgTime = durations.length > 0 ? summary.totalTime / durations.length : 0;
            const minTime = durations.length > 0 ? Math.min(...durations) : 0;
            const maxTime = durations.length > 0 ? Math.max(...durations) : 0;
            const percentage = ((summary.totalTime / totalSessionTime) * 100).toFixed(2) + '%';

            statsData.push([
                summary.task.title,
                formatDuration(summary.totalTime),
                durations.length,
                formatDuration(avgTime),
                formatDuration(minTime),
                formatDuration(maxTime),
                percentage
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

document.addEventListener('DOMContentLoaded', () => {
    new SummaryPage();
});