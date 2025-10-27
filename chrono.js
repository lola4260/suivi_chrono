class Chronometer {
    constructor() {
        this.isRunning = false;
        this.startTime = 0;
        this.currentTaskId = null;
        this.elapsedTime = 0;
        this.displayElement = null;
        this.intervalId = null;
    }

    start(taskId) {
        if (this.isRunning) {
            this.stop();
        }

        this.isRunning = true;
        this.startTime = Date.now() - this.elapsedTime;
        this.currentTaskId = taskId;
        this.intervalId = setInterval(() => {
            this.update();
        }, 10);
        this.updateButtonStyles();
    }

    stop() {
        if (this.isRunning) {
            clearInterval(this.intervalId);
            this.isRunning = false;
            this.elapsedTime = Date.now() - this.startTime;
            this.saveToHistory();
            this.currentTaskId = null;
            this.elapsedTime = 0;
            this.updateButtonStyles();
        }
    }

    update() {
        if (!this.isRunning) return;

        const currentTime = Date.now();
        this.elapsedTime = currentTime - this.startTime;
        const hours = Math.floor(this.elapsedTime / 3600000);
        const minutes = Math.floor((this.elapsedTime % 3600000) / 60000);
        const seconds = Math.floor((this.elapsedTime % 60000) / 1000);
        const milliseconds = Math.floor((this.elapsedTime % 1000) / 10);
        const display = `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}.${milliseconds.toString().padStart(2, '0')}`;
        
        document.querySelectorAll('.chrono-display').forEach(element => {
            element.textContent = display;
        });
    }

    updateButtonStyles() {
        document.querySelectorAll('.task-button').forEach(button => {
            button.classList.remove('active');
        });

        if (this.isRunning && this.currentTaskId) {
            const activeButton = document.querySelector(`[data-task-id="${this.currentTaskId}"]`);
            if (activeButton) {
                activeButton.classList.add('active');
            }
        }
    }

    saveToHistory() {
        if (!this.currentTaskId) return;

        const history = JSON.parse(localStorage.getItem('timeHistory') || '[]');
        history.push({
            taskId: this.currentTaskId,
            startTime: this.startTime,
            endTime: Date.now(),
            duration: this.elapsedTime
        });
        localStorage.setItem('timeHistory', JSON.stringify(history));
    }
}

const chronometer = new Chronometer();