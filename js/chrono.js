// Chronomètre haute précision pour le suivi du temps des tâches
class Chronometer {
  constructor() {
    this.isRunning = false;
    this.isPaused = false;
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
    // If already running and the same action is triggered, finalize previous timing
    if (this.isRunning) {
      this.stop();
    }

    // If currently paused, decide whether to resume or finalize+start new
    if (this.isPaused) {
      // If clicking the same task (or no taskId provided), resume
      if (!taskId || taskId === this.currentTaskId) {
        this.isPaused = false;
        this.isRunning = true;
        this.startTime = performance.now() - this.elapsedTime;

        if (!this.displayElements.length) {
          this.cacheDisplayElements();
        }

        if (this.useRAF) {
          this.updateRAF();
        } else {
          this.intervalId = setInterval(() => this.update(), 10);
        }

        this.updateButtonStyles();
        return;
      }

      // If clicking a different task while paused, finalize the paused segment
      // (save to history) then proceed to start a new timing session for taskId.
      // Use the current elapsedTime as-is for the saved segment.
      this.saveToHistory();
      // clear paused state and reset elapsed before starting new session
      this.isPaused = false;
      this.elapsedTime = 0;
      this.currentTaskId = null;
      // continue to normal start flow below to start the new task
    }

    // Normal start of a new timing session
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
      this.isPaused = false;
      this.updateButtonStyles();
    }
  }

    pause() {
      // Pause: stop updating the display but keep the currentTaskId and elapsedTime
      if (this.isRunning) {
        if (this.useRAF) {
          cancelAnimationFrame(this.rafId);
        } else {
          clearInterval(this.intervalId);
        }

        this.isRunning = false;
        this.isPaused = true;
        this.elapsedTime = performance.now() - this.startTime;
        this.updateButtonStyles();
        return;
      }

      // If already paused, resume
      if (this.isPaused) {
        this.start();
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

      // Update pause button state/text if present
      const pauseBtn = document.getElementById('pauseBtn');
      if (pauseBtn) {
        if (this.isPaused) {
          pauseBtn.classList.add('paused');
          pauseBtn.textContent = 'Reprendre';
        } else {
          pauseBtn.classList.remove('paused');
          pauseBtn.textContent = 'Pause';
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
