class TaskForm {
    constructor() {
        this.tasks = [];
        this.initializeElements();
        this.setupEventListeners();
    }

    initializeElements() {
        this.colorPicker = document.getElementById('buttonColor');
        this.colorHex = document.getElementById('colorHex');
        this.validationSection = document.getElementById('validationSection');
        this.validateButton = document.getElementById('validateButton');
        this.taskForm = document.getElementById('taskForm');
        this.tasksContainer = document.querySelector('.tasks-container');
    }

    setupEventListeners() {
        this.colorPicker.addEventListener('input', (e) => {
            this.colorHex.value = e.target.value;
        });
        this.taskForm.addEventListener('submit', (e) => this.handleSubmit(e));
        this.validateButton.addEventListener('click', () => this.handleValidation());
    }

    handleSubmit(e) {
        e.preventDefault();
        const taskTitle = document.getElementById('taskTitle').value;
        const taskDescription = document.getElementById('taskDescription').value;
        const buttonColor = this.colorPicker.value;
        const task = {
            title: taskTitle,
            description: taskDescription,
            color: buttonColor,
            id: Date.now()
        };
        this.tasks.push(task);
        const taskElement = this.createTaskElement(task);
        this.tasksContainer.appendChild(taskElement);
        const observationInfo = this.getObservationInfo();
        this.resetTaskFields();
        this.restoreObservationInfo(observationInfo);
        document.getElementById('taskTitle').focus();
    }

    getObservationInfo() {
        return {
            examineeName: document.getElementById('examineeName').value,
            examinerName: document.getElementById('examinerName').value,
            examDate: document.getElementById('examDate').value
        };
    }

    resetTaskFields() {
        document.getElementById('taskTitle').value = '';
        document.getElementById('taskDescription').value = '';
        this.colorPicker.value = '#4CAF50';
        this.colorHex.value = '#4CAF50';
        document.getElementById('taskTitle').classList.remove('valid', 'invalid');
        document.getElementById('taskDescription').classList.remove('valid', 'invalid');
        const errorElements = document.querySelectorAll('.form-group .error-message');
        errorElements.forEach(element => element.remove());
    }

    restoreObservationInfo(info) {
        document.getElementById('examineeName').value = info.examineeName;
        document.getElementById('examinerName').value = info.examinerName;
        document.getElementById('examDate').value = info.examDate;
    }

    createTaskElement(task) {
        const taskEl = document.createElement('div');
        taskEl.className = 'task-item';
        taskEl.dataset.taskId = task.id;
        taskEl.innerHTML = `
            <div class="task-header" style="background-color: ${task.color}">
                <h3>${task.title}</h3>
                <button class="delete-task" onclick="taskForm.deleteTask(${task.id})">×</button>
            </div>
            <div class="task-body">
                <p>${task.description || 'Aucune description'}</p>
            </div>
        `;
        return taskEl;
    }

    deleteTask(taskId) {
        const taskElement = document.querySelector(`[data-task-id="${taskId}"]`);
        if (taskElement) {
            taskElement.style.animation = 'fadeOut 0.3s ease';
            
            setTimeout(() => {
                taskElement.remove();
                const index = this.tasks.findIndex(task => task.id === taskId);
                if (index > -1) {
                    this.tasks.splice(index, 1);
                }
            }, 300);
        }
    }

    handleValidation() {
        const observationInfo = this.getObservationInfo();
        Storage.set('observationInfo', observationInfo);
        Storage.set('tasks', this.tasks);
        window.location.href = 'button.html';
    }
}

const taskForm = new TaskForm();