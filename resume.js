class SummaryPage {
    constructor() {
        this.observationInfo = Storage.get('observationInfo');
        this.tasks = Storage.get('tasks');
        this.timeHistory = Storage.get('timeHistory') || [];
        this.taskSummaries = {};
        this.initializePage();
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
                <p><strong>Opérateur :</strong> ${this.observationInfo.examineeName}</p>
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
            ['Opérateur', this.observationInfo.examineeName],
            ['Observateur', this.observationInfo.examinerName],
            ['Date', new Date(this.observationInfo.examDate).toLocaleDateString('fr-FR')],
            [],
            ['Résumé des temps par tâche']
        ];

        let totalSessionTime = 0;
        Object.values(this.taskSummaries).forEach(summary => {
            infoData.push([
                summary.task.title,
                formatDuration(summary.totalTime)
            ]);
            totalSessionTime += summary.totalTime;
        });

        infoData.push([], ['Temps total de la session', formatDuration(totalSessionTime)]);
        const wsInfo = XLSX.utils.aoa_to_sheet(infoData);
        XLSX.utils.book_append_sheet(wb, wsInfo, "Résumé");

        const detailData = [
            ['Tâche', 'Début', 'Fin', 'Durée']
        ];

        Object.values(this.taskSummaries).forEach(summary => {
            summary.entries.forEach(entry => {
                detailData.push([
                    summary.task.title,
                    formatTime(entry.startTime),
                    formatTime(entry.endTime),
                    formatDuration(entry.duration)
                ]);
            });
        });

        const wsDetail = XLSX.utils.aoa_to_sheet(detailData);
        XLSX.utils.book_append_sheet(wb, wsDetail, "Détail des chronos");

        const date = new Date().toISOString().split('T')[0];
        const filename = `suivi_operateur_${this.observationInfo.examineeName}_${date}.xlsx`;
        XLSX.writeFile(wb, filename);
    }
}

document.addEventListener('DOMContentLoaded', () => {
    new SummaryPage();
});