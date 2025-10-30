/**
 * @file chrono.js
 * @brief Gestion du chronomètre pour le suivi des tâches.
 *
 * Cette classe fournit un chronomètre haute précision pour mesurer
 * la durée des tâches observées dans la session en cours.
 * Elle met à jour l'affichage en temps réel, sauvegarde les sessions
 * dans le stockage local et gère l'état visuel des boutons actifs.
 *
 * @date 2025-10-09
 * @author Lola Gauducheau
 */

/**
 * @class Chronometer
 * @brief Chronomètre haute précision pour le suivi du temps des tâches.
 */
class Chronometer {
  /**
   * @brief Initialise le chronomètre et ses propriétés internes.
   */
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

  /**
   * @brief Met en cache les éléments d'affichage du chronomètre.
   */
  cacheDisplayElements() {
    this.displayElements = Array.from(
      document.querySelectorAll(".chrono-display")
    );
  }

  /**
   * @brief Démarre le chronomètre pour une tâche spécifique.
   * @param {string} taskId - Identifiant de la tâche à chronométrer.
   */
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

  /**
   * @brief Arrête le chronomètre et enregistre la durée dans l'historique.
   */
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

  /**
   * @brief Met à jour l'affichage via `requestAnimationFrame`.
   */
  updateRAF() {
    if (!this.isRunning) return;
    this.update();
    this.rafId = requestAnimationFrame(() => this.updateRAF());
  }

  /**
   * @brief Met à jour le temps affiché dans tous les éléments du DOM.
   */
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

  /**
   * @brief Met à jour les styles des boutons de tâches.
   */
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

  /**
   * @brief Sauvegarde la session du chronomètre dans l'historique.
   */
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

  /**
   * @brief Vide les caches internes.
   */
  clearCache() {
    this.cachedButtons.clear();
    this.displayElements = [];
  }
}

/**
 * @brief Instance unique du chronomètre utilisée dans l'application.
 */
const chronometer = new Chronometer();
