// Gestion du formulaire de configuration des tâches
class TaskForm {
  constructor() {
    this.tasks = [];
    this.initializeElements();
    this.setupEventListeners();
    this.loadFromStorage();
    if (typeof this.updateSuggestedColor === "function")
      this.updateSuggestedColor();
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

    this.defaultColors = [
      "#4CAF50",
      "#2196F3",
      "#FF9800",
      "#9C27B0",
      "#F44336",
      "#795548",
      "#03A9F4",
      "#8BC34A",
      "#FFC107",
      "#607D8B",
    ];

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

    const debouncedSave = debounce(() => this.saveToStorage(), 500);

    if (this.colorPicker) {
      this.colorPicker.addEventListener("input", (e) => {
        updateColor(e);
        debouncedSave();
      });
    }

    this.taskForm.addEventListener("submit", (e) => this.handleSubmit(e));
    this.validateButton.addEventListener("click", () =>
      this.handleValidation()
    );

    Object.values(this.fields).forEach((field) => {
      if (!field) return;
      field.addEventListener("input", debouncedSave);
    });

    if (this.fields.taskTitle) {
      this.fields.taskTitle.addEventListener("focus", () =>
        this.updateSuggestedColor()
      );
    }
  }

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

    const chosenColor = this.getNextAvailableColor();
    if (this.colorPicker) this.colorPicker.value = chosenColor;

    const task = {
      title: this.fields.taskTitle.value,
      description: this.fields.taskDescription.value,
      color: chosenColor,
      id: Date.now(),
    };

    this.tasks.push(task);

    const fragment = document.createDocumentFragment();
    const taskElement = this.createTaskElement(task);
    fragment.appendChild(taskElement);
    this.tasksContainer.appendChild(fragment);
    this.saveToStorage();

    if (typeof this.updateSuggestedColor === "function")
      this.updateSuggestedColor();

    const observationInfo = this.getObservationInfo();
    this.resetTaskFields();
    this.restoreObservationInfo(observationInfo);
    this.fields.taskTitle.focus();
  }

  getNextAvailableColor() {
    const used = new Set(this.tasks.map((t) => (t && t.color) || ""));
    for (const c of this.defaultColors) {
      if (!used.has(c)) return c;
    }

    let hue = (this.tasks.length * 47) % 360;
    for (let i = 0; i < 360; i++) {
      const candidate = `hsl(${hue},70%,50%)`;
      if (!used.has(candidate)) return candidate;
      hue = (hue + 47) % 360;
    }
    return `hsl(${Math.floor(Math.random() * 360)},70%,50%)`;
  }

  updateSuggestedColor() {
    try {
      const next = this.getNextAvailableColor();
      if (this.colorPicker) this.colorPicker.value = next;
    } catch (err) {
      console.error("Erreur updateSuggestedColor:", err);
    }
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
      const nextColor = this.getNextAvailableColor();
      if (this.colorPicker) this.colorPicker.value = nextColor;
      if (this.colorHex) this.colorHex.value = nextColor;

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
      this.saveToStorage();
      if (typeof this.updateSuggestedColor === "function")
        this.updateSuggestedColor();
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

  saveToStorage() {
    try {
      const observationInfo = this.getObservationInfo();
      Storage.set("observationInfo", observationInfo);
      Storage.set("tasks", this.tasks);
      console.log(
        "[TaskForm] saveToStorage - observationInfo:",
        observationInfo
      );
      console.log("[TaskForm] saveToStorage - tasks:", this.tasks);
      this.showStatus("Sauvegarde enregistrée");
    } catch (err) {
      console.error("Erreur lors de la sauvegarde :", err);
    }
  }

  loadFromStorage() {
    try {
      const obs = Storage.get("observationInfo");
      const tasks = Storage.get("tasks");
      console.log("[TaskForm] loadFromStorage - observationInfo:", obs);
      console.log("[TaskForm] loadFromStorage - tasks:", tasks);

      let restoredAnything = false;
      if (obs) {
        this.restoreObservationInfo(obs);
        restoredAnything = true;
        this.showStatus("Informations d'observation restaurées");
      }

      let normalizedTasks = null;
      if (Array.isArray(tasks)) {
        normalizedTasks = tasks;
      } else if (typeof tasks === "string") {
        try {
          const parsed = JSON.parse(tasks);
          if (Array.isArray(parsed)) normalizedTasks = parsed;
        } catch (e) {
          console.warn(
            "[TaskForm] loadFromStorage: tasks is string but not JSON array",
            e
          );
        }
      } else if (tasks && typeof tasks === "object") {
        normalizedTasks = Object.values(tasks);
      }

      if (Array.isArray(normalizedTasks)) {
        this.tasks = normalizedTasks.map((t, i) => {
          const id = t && (t.id || t._id) ? t.id || t._id : Date.now() + i;
          return {
            id,
            title: (t && t.title) || "",
            description: (t && t.description) || "",
            color: (t && t.color) || "#4CAF50",
          };
        });

        this.tasksContainer.innerHTML = "";
        this.tasks.forEach((task) => {
          const taskEl = this.createTaskElement(task);
          this.tasksContainer.appendChild(taskEl);
        });

        restoredAnything = restoredAnything || this.tasks.length > 0;
        this.showStatus(`${this.tasks.length} tâche(s) restaurée(s)`);
        if (typeof this.updateSuggestedColor === "function")
          this.updateSuggestedColor();
      }

      if (!restoredAnything) {
        this.showStatus("Aucune sauvegarde trouvée");
      }
    } catch (err) {
      console.error("Erreur lors du chargement de la sauvegarde :", err);
    }
  }

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

const taskForm = new TaskForm();
