class ButtonsPage {
    constructor() {
        this.tasks = Storage.get('tasks') || [];
        this.observationInfo = Storage.get('observationInfo');
        this.initializeElements();
        this.setupPage();
    }

    initializeElements() {
        this.buttonsGrid = document.getElementById('buttons-grid');
        this.observationInfoDiv = document.getElementById('observation-info');
        this.modal = new Modal('descriptionModal');
    }

    setupPage() {
        this.displayObservationInfo();
        this.createTaskButtons();
        this.setupEndSessionButton();
        this.setupAddTaskButton();
    }

    displayObservationInfo() {
        if (this.observationInfo) {
            const formattedDate = new Date(this.observationInfo.examDate).toLocaleDateString('fr-FR');
            this.observationInfoDiv.innerHTML = `
                <h2>Session d'observation en cours</h2>
                <div class="info-details">
                    <p><strong>Opérateur :</strong> ${this.observationInfo.examineeName}</p>
                    <p><strong>Observateur :</strong> ${this.observationInfo.examinerName}</p>
                    <p><strong>Date :</strong> ${formattedDate}</p>
                </div>
            `;
        }
    }

    createTaskButtons() {
        if (this.tasks && this.tasks.length > 0) {
            this.tasks.forEach(task => {
                const buttonContainer = document.createElement('div');
                buttonContainer.className = 'task-button-container';
                
                const button = document.createElement('button');
                button.className = 'task-button';
                button.style.backgroundColor = task.color;
                button.textContent = task.title;
                button.dataset.taskId = task.id;
                button.onclick = () => chronometer.start(task.id);
                
                const infoButton = document.createElement('button');
                infoButton.className = 'info-button';
                infoButton.innerHTML = '<span class="info-icon">ℹ️</span>';
                infoButton.onclick = () => this.showDescription(task.title, task.description);
                
                buttonContainer.appendChild(button);
                buttonContainer.appendChild(infoButton);
                this.buttonsGrid.appendChild(buttonContainer);
            });
        } else {
            this.buttonsGrid.innerHTML = '<p class="no-tasks">Aucune tâche n\'a été configurée.</p>';
        }
    }

    showDescription(title, description) {
        document.getElementById('modalTitle').textContent = title;
        document.getElementById('modalDescription').textContent = description || 'Aucune description disponible';
        this.modal.show();
    }

    setupEndSessionButton() {
        const endSessionBtn = document.getElementById('endSessionBtn');
        if (endSessionBtn) {
            endSessionBtn.addEventListener('click', () => {
                if (chronometer.isRunning) {
                    chronometer.stop();
                }
                window.location.href = 'resume.html';
            });
        }
    }

    setupAddTaskButton() {
        const addTaskBtn = document.getElementById('addTaskBtn');
        if (addTaskBtn) {
            addTaskBtn.addEventListener('click', () => {
                if (chronometer.isRunning) {
                    chronometer.stop();
                }
                window.location.href = 'add_task.html';
            });
        }
    }
}

document.addEventListener('DOMContentLoaded', () => {
    new ButtonsPage();
});