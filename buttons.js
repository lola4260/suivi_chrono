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
        this.descriptionModal = new Modal('descriptionModal');
        this.addTaskModal = new Modal('addTaskModal');
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
        this.descriptionModal.show();
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
        // Supprimer tous les gestionnaires d'événements existants
        const addTaskBtn = document.getElementById('addTaskBtn');
        const addTaskForm = document.getElementById('addTaskForm');
        const oldBtn = addTaskBtn.cloneNode(true);
        addTaskBtn.parentNode.replaceChild(oldBtn, addTaskBtn);
        
        // Ajouter le nouveau gestionnaire d'événements
        oldBtn.onclick = (e) => {
            e.preventDefault();
            e.stopPropagation();
            document.getElementById('addTaskModal').style.display = 'block';
            return false;
        };

        if (addTaskForm) {
            addTaskForm.onsubmit = (e) => {
                e.preventDefault();
                const newTask = {
                    id: Date.now().toString(),
                    title: document.getElementById('taskTitle').value,
                    description: document.getElementById('taskDescription').value,
                    color: document.getElementById('taskColor').value
                };
                
                this.tasks.push(newTask);
                Storage.set('tasks', this.tasks);
                
                // Réinitialiser le formulaire et fermer le modal
                addTaskForm.reset();
                document.getElementById('addTaskModal').style.display = 'none';
                
                // Nettoyer et recréer les boutons
                this.buttonsGrid.innerHTML = '';
                this.createTaskButtons();
                return false;
            };
        }

        // Gestion du bouton Annuler
        const cancelBtn = document.querySelector('#addTaskModal .cancel-btn');
        if (cancelBtn) {
            cancelBtn.onclick = (e) => {
                e.preventDefault();
                addTaskForm.reset();
                document.getElementById('addTaskModal').style.display = 'none';
                return false;
            };
        }

        // Gestion du bouton de fermeture (X)
        const closeBtn = document.querySelector('#addTaskModal .close-modal');
        if (closeBtn) {
            closeBtn.onclick = (e) => {
                e.preventDefault();
                document.getElementById('addTaskModal').style.display = 'none';
                return false;
            };
        }
    }
}

document.addEventListener('DOMContentLoaded', () => {
    new ButtonsPage();
});