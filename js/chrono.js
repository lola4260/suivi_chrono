// Chronomètre haute précision pour le suivi du temps des tâches
class Chronometer {
  constructor() {
    this.isRunning = false;
    this.startTime = 0;
    this.currentTaskId = null;
    this.elapsedTime = 0;
    this.intervalId = null;
    this.displayElements = [];
    this.cachedButtons = new Map();
    this.useRAF = true;
    this.rafId = null;
  }

  cacheDisplayElements() {
    this.displayElements = Array.from(
      document.querySelectorAll(".chrono-display")
    );
  }

  start(taskId) {
    if (this.isRunning) {
      this.stop();
    }

    this.isRunning = true;
    this.startTime = performance.now() - this.elapsedTime;
    this.currentTaskId = taskId;

    if (!this.displayElements.length) {
      this.cacheDisplayElements();
    }

    if (this.useRAF) {
      this.updateRAF();
    } else {
      this.intervalId = setInterval(() => this.update(), 10);
    }

    this.updateButtonStyles();
  }

  stop() {
    if (this.isRunning) {
      if (this.useRAF) {
        cancelAnimationFrame(this.rafId);
      } else {
        clearInterval(this.intervalId);
      }

      this.isRunning = false;
      this.elapsedTime = performance.now() - this.startTime;
      this.saveToHistory();
      this.currentTaskId = null;
      this.elapsedTime = 0;
      this.updateButtonStyles();
    }
  }

  updateRAF() {
    if (!this.isRunning) return;
    this.update();
    this.rafId = requestAnimationFrame(() => this.updateRAF());
  }

  update() {
    if (!this.isRunning) return;

    const currentTime = performance.now();
    this.elapsedTime = currentTime - this.startTime;

    const hours = Math.floor(this.elapsedTime / 3600000);
    const minutes = Math.floor((this.elapsedTime % 3600000) / 60000);
    const seconds = Math.floor((this.elapsedTime % 60000) / 1000);
    const milliseconds = Math.floor((this.elapsedTime % 1000) / 10);

    const display = `${hours.toString().padStart(2, "0")}:${minutes
      .toString()
      .padStart(2, "0")}:${seconds.toString().padStart(2, "0")}.${milliseconds
      .toString()
      .padStart(2, "0")}`;

    this.displayElements.forEach((el) => (el.textContent = display));
  }

  updateButtonStyles() {
    if (!this.cachedButtons.size) {
      document.querySelectorAll(".task-button").forEach((btn) => {
        const taskId = btn.dataset.taskId;
        this.cachedButtons.set(taskId, btn);
      });
    }

    requestAnimationFrame(() => {
      this.cachedButtons.forEach((button) => {
        button.classList.remove("active");
      });

      if (this.isRunning && this.currentTaskId) {
        const activeButton = this.cachedButtons.get(this.currentTaskId);
        if (activeButton) {
          activeButton.classList.add("active");
        }
      }
    });
  }

  saveToHistory() {
    if (!this.currentTaskId) return;

    const history = Storage.get("timeHistory") || [];
    const now = Date.now();

    history.push({
      taskId: this.currentTaskId,
      startTime: now - this.elapsedTime,
      endTime: now,
      duration: this.elapsedTime,
    });

    Storage.set("timeHistory", history);
  }

  clearCache() {
    this.cachedButtons.clear();
    this.displayElements = [];
  }
}
// Instance unique du chronomètre
const chronometer = new Chronometer();
