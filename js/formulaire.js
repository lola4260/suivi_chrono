class TaskForm {
  constructor() {
    this.tasks = [];
    this.initializeElements();
    this.setupEventListeners();
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
  }

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
}

const taskForm = new TaskForm();