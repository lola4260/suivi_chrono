/**
 * @file formulaire.js
 * @brief Gestion du formulaire de création et configuration des tâches d'observation.
 *
 * Cette classe permet à l'utilisateur de configurer une session d'observation :
 * - Saisie des informations (observateur, observé, date)
 * - Ajout, affichage et suppression de tâches
 * - Validation et enregistrement des données dans le stockage local
 *
 * @date 2025-10-09
 * @author Lola Gauducheau
 */

/**
 * @class TaskForm
 * @brief Gère le cycle de vie complet du formulaire de configuration des tâches.
 */
class TaskForm {
  /**
   * @brief Initialise le formulaire et configure les écouteurs d'événements.
   */
  constructor() {
    this.tasks = [];
    this.initializeElements();
    this.setupEventListeners();
  }

  /**
   * @brief Initialise les références aux éléments du DOM.
   */
  initializeElements() {
    this.colorPicker = document.getElementById("buttonColor");
    this.colorHex = document.getElementById("colorHex");
    this.validationSection = document.getElementById("validationSection");
    this.validateButton = document.getElementById("validateButton");
    this.taskForm = document.getElementById("taskForm");
    this.tasksContainer = document.querySelector(".tasks-container");
    this.fields = {
      taskTitle: document.getElementById("taskTitle"),
      taskDescription: document.getElementById("taskDescription"),
      examineeName: document.getElementById("examineeName"),
      examinerName: document.getElementById("examinerName"),
      examDate: document.getElementById("examDate"),
    };
  }

  /**
   * @brief Configure les écouteurs d'événements du formulaire.
   */
  setupEventListeners() {
    const updateColor = debounce((e) => {
      this.colorHex.value = e.target.value;
    }, 100);

    this.colorPicker.addEventListener("input", updateColor);
    this.taskForm.addEventListener("submit", (e) => this.handleSubmit(e));
    this.validateButton.addEventListener("click", () =>
      this.handleValidation()
    );
  }

  /**
   * @brief Gère la soumission du formulaire d'ajout de tâche.
   * @param {Event} e - Événement de soumission du formulaire.
   */
  handleSubmit(e) {
    e.preventDefault();

    const task = {
      title: this.fields.taskTitle.value,
      description: this.fields.taskDescription.value,
      color: this.colorPicker.value,
      id: Date.now(),
    };

    this.tasks.push(task);

    const fragment = document.createDocumentFragment();
    const taskElement = this.createTaskElement(task);
    fragment.appendChild(taskElement);
    this.tasksContainer.appendChild(fragment);

    const observationInfo = this.getObservationInfo();
    this.resetTaskFields();
    this.restoreObservationInfo(observationInfo);
    this.fields.taskTitle.focus();
  }

  /**
   * @brief Récupère les informations générales de la session d'observation.
   * @returns {Object} Objet contenant `examineeName`, `examinerName`, `examDate`.
   */
  getObservationInfo() {
    return {
      examineeName: this.fields.examineeName.value,
      examinerName: this.fields.examinerName.value,
      examDate: this.fields.examDate.value,
    };
  }

  /**
   * @brief Réinitialise les champs liés à la tâche après une soumission.
   */
  resetTaskFields() {
    requestAnimationFrame(() => {
      this.fields.taskTitle.value = "";
      this.fields.taskDescription.value = "";
      this.colorPicker.value = "#4CAF50";
      this.colorHex.value = "#4CAF50";

      this.fields.taskTitle.classList.remove("valid", "invalid");
      this.fields.taskDescription.classList.remove("valid", "invalid");

      const errorElements = this.taskForm.querySelectorAll(".error-message");
      errorElements.forEach((el) => el.remove());
    });
  }

  /**
   * @brief Restaure les informations de la session d'observation après réinitialisation du formulaire.
   * @param {Object} info - Informations à restaurer (examiné, examinateur, date).
   */
  restoreObservationInfo(info) {
    this.fields.examineeName.value = info.examineeName;
    this.fields.examinerName.value = info.examinerName;
    this.fields.examDate.value = info.examDate;
  }

  /**
   * @brief Crée un élément DOM représentant une tâche.
   * @param {Object} task - Objet représentant la tâche.
   * @returns {HTMLElement} Élément DOM de la tâche.
   */
  createTaskElement(task) {
    const taskEl = document.createElement("div");
    taskEl.className = "task-item";
    taskEl.dataset.taskId = task.id;

    const escapedTitle = this.escapeHtml(task.title);
    const escapedDescription = this.escapeHtml(
      task.description || "Aucune description"
    );

    taskEl.innerHTML = `
      <div class="task-header" style="background-color: ${task.color}">
          <h3>${escapedTitle}</h3>
          <button class="delete-task" data-task-id="${task.id}">×</button>
      </div>
      <div class="task-body">
          <p>${escapedDescription}</p>
      </div>
    `;

    taskEl.querySelector(".delete-task").addEventListener("click", () => {
      this.deleteTask(task.id);
    });

    return taskEl;
  }

  /**
   * @brief Protège le texte HTML contre les injections (XSS).
   * @param {string} text - Texte à échapper.
   * @returns {string} Texte sécurisé pour l'insertion dans le DOM.
   */
  escapeHtml(text) {
    const div = document.createElement("div");
    div.textContent = text;
    return div.innerHTML;
  }

  /**
   * @brief Supprime une tâche avec une animation de fondu.
   * @param {number} taskId - Identifiant de la tâche à supprimer.
   */
  deleteTask(taskId) {
    const taskElement = document.querySelector(`[data-task-id="${taskId}"]`);
    if (!taskElement) return;

    const animation = taskElement.animate(
      [
        { opacity: 1, transform: "scale(1)" },
        { opacity: 0, transform: "scale(0.9)" },
      ],
      {
        duration: 300,
        easing: "ease-out",
      }
    );

    animation.onfinish = () => {
      taskElement.remove();
      const index = this.tasks.findIndex((task) => task.id === taskId);
      if (index > -1) {
        this.tasks.splice(index, 1);
      }
    };
  }

  /**
   * @brief Valide la configuration et passe à la page suivante.
   */
  handleValidation() {
    const observationInfo = this.getObservationInfo();

    if (
      !observationInfo.examineeName ||
      !observationInfo.examinerName ||
      !observationInfo.examDate
    ) {
      alert("Veuillez remplir tous les champs obligatoires");
      return;
    }

    if (this.tasks.length === 0) {
      alert("Veuillez ajouter au moins une tâche");
      return;
    }

    Storage.set("observationInfo", observationInfo);
    Storage.set("tasks", this.tasks);

    window.location.href = "button.html";
  }
}

/**
 * @brief Instance unique du gestionnaire de formulaire utilisée dans l'application.
 */
const taskForm = new TaskForm();
