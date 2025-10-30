/**
 * @file buttons.js
 * @brief Gère la page des boutons de tâches pour la session d'observation.
 *
 * Ce module affiche les informations de la session en cours, génère dynamiquement
 * les boutons des tâches, et permet d'ajouter ou de terminer une session.
 *
 * Il interagit avec :
 * - `Storage` : pour la persistance des données (`tasks`, `observationInfo`).
 * - `Modal` : pour l'affichage des fenêtres modales (description, ajout de tâche).
 * - `chronometer` : pour le suivi du temps des tâches sélectionnées.
 *
 * @date 2025-10-09
 * @author Lola Gauducheau
 */

/**
 * @class ButtonsPage
 * @brief Classe principale gérant la logique de la page des boutons.
 */
class ButtonsPage {
    /**
     * @brief Initialise la page et charge les données sauvegardées.
     */
    constructor() {
        this.tasks = Storage.get('tasks') || [];
        this.observationInfo = Storage.get('observationInfo');

        this.initializeElements();
        this.setupPage();
    }

    /**
     * @brief Initialise les éléments DOM et les modales.
     */
    initializeElements() {
        this.buttonsGrid = document.getElementById('buttons-grid');
        this.observationInfoDiv = document.getElementById('observation-info');
        this.descriptionModal = new Modal('descriptionModal');
        this.addTaskModal = new Modal('addTaskModal');
    }

    /**
     * @brief Configure la page principale.
     */
    setupPage() {
        this.displayObservationInfo();
        this.createTaskButtons();
        this.setupEndSessionButton();
        this.setupAddTaskButton();
    }

    /**
     * @brief Affiche les informations de la session d'observation en cours.
     */
    displayObservationInfo() {
        if (this.observationInfo) {
            const formattedDate = new Date(this.observationInfo.examDate).toLocaleDateString('fr-FR');
            this.observationInfoDiv.innerHTML = `
                <h2>Session d'observation en cours</h2>
                <div class="info-details">
                    <p><strong>Collaborateur :</strong> ${this.observationInfo.examineeName}</p>
                    <p><strong>Observateur :</strong> ${this.observationInfo.examinerName}</p>
                    <p><strong>Date :</strong> ${formattedDate}</p>
                </div>
            `;
        }
    }

    /**
     * @brief Crée dynamiquement les boutons de tâches.
     */
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

    /**
     * @brief Affiche la description d'une tâche dans une fenêtre modale.
     * @param {string} title - Titre de la tâche.
     * @param {string} description - Description de la tâche.
     */
    showDescription(title, description) {
        document.getElementById('modalTitle').textContent = title;
        document.getElementById('modalDescription').textContent = description || 'Aucune description disponible';
        this.descriptionModal.show();
    }

    /**
     * @brief Configure le bouton de fin de session.
     */
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

    /**
     * @brief Configure le bouton et la modale d'ajout de nouvelle tâche.
     */
    setupAddTaskButton() {
        const addTaskBtn = document.getElementById('addTaskBtn');
        const addTaskForm = document.getElementById('addTaskForm');
        const oldBtn = addTaskBtn.cloneNode(true);
        addTaskBtn.parentNode.replaceChild(oldBtn, addTaskBtn);
        
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
                
                addTaskForm.reset();
                document.getElementById('addTaskModal').style.display = 'none';
                
                this.buttonsGrid.innerHTML = '';
                this.createTaskButtons();
                return false;
            };
        }

        const cancelBtn = document.querySelector('#addTaskModal .cancel-btn');
        if (cancelBtn) {
            cancelBtn.onclick = (e) => {
                e.preventDefault();
                addTaskForm.reset();
                document.getElementById('addTaskModal').style.display = 'none';
                return false;
            };
        }

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

/**
 * @brief Initialise la page des boutons une fois le DOM chargé.
 */
document.addEventListener('DOMContentLoaded', () => {
    new ButtonsPage();
});
