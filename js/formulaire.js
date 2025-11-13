// Gestion du formulaire de configuration des tâches
class TaskForm {
  constructor() {
    this.tasks = [];
    this.initializeElements();
    this.setupEventListeners();
    // Charger l'état sauvegardé au démarrage
    this.loadFromStorage();
  }

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

    // Si l'input `colorHex` n'existe pas dans le HTML, le créer en hidden
    if (!this.colorHex && this.taskForm) {
      const hidden = document.createElement("input");
      hidden.type = "hidden";
      hidden.id = "colorHex";
      hidden.value = this.colorPicker ? this.colorPicker.value : "#4CAF50";
      this.taskForm.appendChild(hidden);
      this.colorHex = hidden;
    }
  }

  setupEventListeners() {
    const updateColor = debounce((e) => {
      if (this.colorHex) this.colorHex.value = e.target.value;
    }, 100);

    // NOTE: autosave disabled — save only when user clicks `Sauvegarder`.
    if (this.colorPicker) {
      this.colorPicker.addEventListener("input", (e) => {
        updateColor(e);
      });
    }

    this.taskForm.addEventListener("submit", (e) => this.handleSubmit(e));
    this.validateButton.addEventListener("click", () => this.handleValidation());

    // Autosave disabled: do not attach input listeners that save automatically.

    // Boutons manuels de sauvegarde / restauration / effacement
    const saveBtn = document.getElementById("saveButton");
    const restoreBtn = document.getElementById("restoreButton");
    const clearBtn = document.getElementById("clearSaveButton");
    if (saveBtn) saveBtn.addEventListener("click", () => this.saveToStorage());
    if (restoreBtn) restoreBtn.addEventListener("click", () => this.loadFromStorage());
    if (clearBtn) clearBtn.addEventListener("click", () => this.clearSavedStorage());
  }

  // Affiche un message discret de statut (toast-like)
  showStatus(message, timeout = 2000) {
    try {
      let el = document.getElementById("saveStatus");
      if (!el) {
        el = document.createElement("div");
        el.id = "saveStatus";
        document.body.appendChild(el);
      }
      el.textContent = message;
      el.style.display = "block";
      el.style.position = "fixed";
      el.style.right = "20px";
      el.style.bottom = "20px";
      el.style.background = "rgba(0,0,0,0.7)";
      el.style.color = "#fff";
      el.style.padding = "8px 12px";
      el.style.borderRadius = "6px";
      el.style.zIndex = 9999;
      setTimeout(() => (el.style.display = "none"), timeout);
    } catch (err) {
      console.error("Erreur showStatus:", err);
    }
  }

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

    // Ne pas sauvegarder automatiquement ici — utilisateur doit cliquer "Sauvegarder"

    const observationInfo = this.getObservationInfo();
    this.resetTaskFields();
    this.restoreObservationInfo(observationInfo);
    this.fields.taskTitle.focus();
  }

  getObservationInfo() {
    return {
      examineeName: this.fields.examineeName.value,
      examinerName: this.fields.examinerName.value,
      examDate: this.fields.examDate.value,
    };
  }

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

  restoreObservationInfo(info) {
    this.fields.examineeName.value = info.examineeName;
    this.fields.examinerName.value = info.examinerName;
    this.fields.examDate.value = info.examDate;
  }

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

  escapeHtml(text) {
    const div = document.createElement("div");
    div.textContent = text;
    return div.innerHTML;
  }
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
      // Ne pas sauvegarder automatiquement après suppression
    };
  }

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

  // Sauvegarde de l'état courant du formulaire et des tâches
  saveToStorage() {
    try {
      const observationInfo = this.getObservationInfo();
      Storage.set("observationInfo", observationInfo);
      Storage.set("tasks", this.tasks);
      this.showStatus("Sauvegarde enregistrée");
    } catch (err) {
      console.error("Erreur lors de la sauvegarde :", err);
    }
  }

  // Chargement de l'état sauvegardé (observationInfo + tasks)
  loadFromStorage() {
    try {
      const obs = Storage.get("observationInfo");
      const tasks = Storage.get("tasks");

      if (obs) this.restoreObservationInfo(obs);

      if (Array.isArray(tasks)) {
        this.tasks = tasks;
        this.tasksContainer.innerHTML = "";
        tasks.forEach((task) => {
          const taskEl = this.createTaskElement(task);
          this.tasksContainer.appendChild(taskEl);
        });
        this.showStatus("Sauvegarde restaurée");
      }
    } catch (err) {
      console.error("Erreur lors du chargement de la sauvegarde :", err);
    }
  }

  // Efface la sauvegarde dans localStorage
  clearSavedStorage() {
    try {
      Storage.remove("observationInfo");
      Storage.remove("tasks");
      this.showStatus("Sauvegarde effacée");
    } catch (err) {
      console.error("Erreur lors de l'effacement de la sauvegarde :", err);
    }
  }
}

// Instance unique du gestionnaire de formulaire
const taskForm = new TaskForm();
