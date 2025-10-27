class AddTaskForm {
    constructor() {
        this.form = document.getElementById('addTaskForm');
        this.cancelBtn = document.getElementById('cancelBtn');
        this.setupEventListeners();
    }

    setupEventListeners() {
        this.form.addEventListener('submit', (e) => this.handleSubmit(e));
        this.cancelBtn.addEventListener('click', () => this.handleCancel());
    }

    handleSubmit(e) {
        e.preventDefault();
        const tasks = Storage.get('tasks') || [];
        const newTask = {
            id: Date.now().toString(),
            title: document.getElementById('taskTitle').value,
            description: document.getElementById('taskDescription').value,
            color: document.getElementById('taskColor').value
        };
        tasks.push(newTask);
        Storage.set('tasks', tasks);
        window.location.href = 'button.html';
    }

    handleCancel() {
        window.location.href = 'button.html';
    }
}

document.addEventListener('DOMContentLoaded', () => {
    new AddTaskForm();
});