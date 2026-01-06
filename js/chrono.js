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
    this.lastCycleTimestamp = null;
    this.currentCycleElapsed = 0;
    this.currentCycleIndex = 1;
    this.cycleWallStart = null;
    this.cyclePerfStart = null;
    this.currentRemark = "";
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

    if (this.isPaused) {
      if (!taskId || String(taskId) === this.currentTaskId) {
        this.isPaused = false;
        this.isRunning = true;
        this.startTime = performance.now() - this.elapsedTime;
        // Ajuster cyclePerfStart pour continuer le cycle depuis la pause
        if (this.cyclePerfStart) {
          this.cyclePerfStart = performance.now() - this.currentCycleElapsed;
        } else {
          this.cyclePerfStart = performance.now();
        }

        if (!this.displayElements.length) {
          this.cacheDisplayElements();
        }

        if (this.useRAF) {
          this.updateRAF();
        } else {
          this.intervalId = setInterval(() => this.update(), 10);
        }

        this.updateCycleDisplay();
        this.updateCycleElapsedElement();
        this.updateButtonStyles();
        this.notifyRemarkControlsUpdate();
        return;
      }

      // Enregistre la mesure (par tâche) avec le cycle courant (ne change pas de cycle)
      const cycleForMeasurement = this.currentCycleIndex || 1;
      this.saveToHistory(cycleForMeasurement);
      this.isPaused = false;
      this.elapsedTime = 0;
      this.currentTaskId = null;
    }

    this.isRunning = true;
    this.startTime = performance.now() - this.elapsedTime;
    // Normalise l'identifiant de tâche en chaîne pour correspondre à dataset.taskId
    this.currentTaskId = String(taskId);
    // Démarre le cycle global si nécessaire
    if (!this.cycleWallStart) {
      this.cycleWallStart = Date.now();
      this.cyclePerfStart = performance.now();
      try {
        this.currentCycleIndex = this.getGlobalCycleCount() + 1;
      } catch (_) {
        this.currentCycleIndex = 1;
      }
    }

    if (!this.displayElements.length) {
      this.cacheDisplayElements();
    }

    if (this.useRAF) {
      this.updateRAF();
    } else {
      this.intervalId = setInterval(() => this.update(), 10);
    }

    this.updateCycleDisplay();
    this.currentCycleElapsed = 0;
    this.updateCycleElapsedElement();
    this.updateButtonStyles();
    this.notifyRemarkControlsUpdate();
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
      // Enregistre uniquement la mesure avec le cycle courant (ne change pas de cycle)
      const cycleForMeasurement = this.currentCycleIndex || 1;
      this.saveToHistory(cycleForMeasurement);
      this.currentTaskId = null;
      this.elapsedTime = 0;
      this.isPaused = false;
      this.lastCycleTimestamp = null;
      this.currentCycleElapsed = 0;
      this.updateCycleElapsedElement();
      this.updateCycleDisplay();
      this.updateButtonStyles();
      this.notifyRemarkControlsUpdate();
    }
  }

  pause() {
    if (this.isRunning) {
      if (this.useRAF) {
        cancelAnimationFrame(this.rafId);
      } else {
        clearInterval(this.intervalId);
      }

      this.isRunning = false;
      this.isPaused = true;
      this.elapsedTime = performance.now() - this.startTime;
      this.lastCycleTimestamp = null;
      // Figer le temps de cycle à la valeur actuelle
      const cycleStart = this.cyclePerfStart || this.startTime;
      this.currentCycleElapsed = Math.max(0, performance.now() - cycleStart);
      this.updateCycleElapsedElement();
      this.updateButtonStyles();
      this.notifyRemarkControlsUpdate();
      return;
    }

    if (this.isPaused) {
      this.start();
    }
  }

  getCycleCountForTask(taskId) {
    // Obsolète avec cycles globaux: retourne le nombre total de cycles terminés
    return this.getGlobalCycleCount();
  }

  getGlobalCycleCount() {
    const list = Storage.get("cycleHistory") || [];
    return Array.isArray(list) ? list.length : 0;
  }

  updateCycleDisplay() {
    try {
      const el = document.getElementById("cycleCount");
      if (!el) return;
      // Affiche le nombre de cycles terminés (globaux)
      el.textContent = String(this.getGlobalCycleCount());
    } catch (_) {}
  }

  topCycle() {
    if (!this.isRunning || !this.currentTaskId) return;
    // Finalise le cycle global courant puis démarre le suivant
    this.finalizeCurrentCycle();
    this.currentCycleElapsed = 0;
    this.updateCycleDisplay();
    this.updateCycleElapsedElement();
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
    // mettre à jour chrono du cycle
    const cycleStart = this.cyclePerfStart || this.startTime;
    this.currentCycleElapsed = Math.max(0, currentTime - cycleStart);
    this.updateCycleElapsedElement();

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

  updateCycleElapsedElement() {
    try {
      const el = document.getElementById("cycleElapsed");
      if (!el) return;
      const ms = this.currentCycleElapsed || 0;
      const minutes = Math.floor((ms % 3600000) / 60000);
      const seconds = Math.floor((ms % 60000) / 1000);
      const centiseconds = Math.floor((ms % 1000) / 10);
      el.textContent = `${minutes.toString().padStart(2, "0")}:${seconds
        .toString()
        .padStart(2, "0")}.${centiseconds.toString().padStart(2, "0")}`;
    } catch (_) {}
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

      const pauseBtn = document.getElementById("pauseBtn");
      if (pauseBtn) {
        if (this.isPaused) {
          pauseBtn.classList.add("paused");
          pauseBtn.textContent = i18n.t('js.resume');
        } else {
          pauseBtn.classList.remove("paused");
          pauseBtn.textContent = i18n.t('js.pause');
        }
      }
    });
  }

  saveToHistory(cycleIndex) {
    if (!this.currentTaskId) return;

    const history = Storage.get("timeHistory") || [];
    const now = Date.now();

    history.push({
      taskId: this.currentTaskId,
      startTime: now - this.elapsedTime,
      endTime: now,
      duration: this.elapsedTime,
        cycleIndex: cycleIndex || this.currentCycleIndex || 1,
      remark: this.currentRemark || "",
    });

    Storage.set("timeHistory", history);
    // Nettoie la remarque courante après enregistrement de la mesure
    this.currentRemark = "";
  }

  setRemark(text) {
    try {
      const t = String(text || "").trim();
      // Limite de sécurité pour éviter des champs trop longs
      this.currentRemark = t.length > 500 ? t.slice(0, 500) : t;
    } catch (_) {
      this.currentRemark = "";
    }
  }

  // Enregistre une mesure de temps alignée sur le cycle courant
  finalizeCurrentCycle() {
    if (!this.currentTaskId) return;

    // Calcule la durée du cycle courant selon l'état (en cours ou en pause)
    let durationMs = 0;
    if (this.isRunning) {
      const nowPerf = performance.now();
      const startPerf = this.lastCycleTimestamp || this.startTime || nowPerf;
      durationMs = Math.max(0, nowPerf - startPerf);
    } else {
      durationMs = Math.max(0, this.currentCycleElapsed || 0);
    }

    if (durationMs <= 0) return; // rien à enregistrer

    const endWall = Date.now();
    const startWall = endWall - durationMs;

    // Met à jour l'historique des cycles (pour l'affichage et l'export)
    const cycleHistory = Storage.get("cycleHistory") || [];
    cycleHistory.push({ index: this.currentCycleIndex || 1, timestamp: endWall, duration: durationMs });
    Storage.set("cycleHistory", cycleHistory);

      // Ne pas enregistrer ici dans timeHistory: on conserve les mesures par arrêt/switch

    // Passe au cycle global suivant et redémarre le repère
    this.currentCycleIndex = (this.currentCycleIndex || 1) + 1;
    this.cycleWallStart = endWall;
    this.cyclePerfStart = performance.now();
  }

  clearCache() {
    this.cachedButtons.clear();
    this.displayElements = [];
  }

  notifyRemarkControlsUpdate() {
    try {
      if (window.buttonsPage && typeof window.buttonsPage.updateRemarkControlsState === 'function') {
        window.buttonsPage.updateRemarkControlsState();
      }
    } catch (_) {}
  }

  changeTask(newTaskId) {
    if (!this.isRunning || !newTaskId) return;
    // Normalise l'identifiant de tâche en chaîne
    this.currentTaskId = String(newTaskId);
    this.updateButtonStyles();
  }
}
// Instance unique du chronomètre
const chronometer = new Chronometer();
