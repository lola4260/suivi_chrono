// Gestion de la page des boutons de tâches
class ButtonsPage {
  constructor() {
    this.tasks = Storage.get("tasks") || [];
    this.observationInfo = Storage.get("observationInfo");
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

    this.initializeElements();
    this.setupPage();
  }

  initializeElements() {
    this.buttonsGrid = document.getElementById("buttons-grid");
    this.observationInfoDiv = document.getElementById("observation-info");
    this.descriptionModal = new Modal("descriptionModal");
    this.addTaskModal = new Modal("addTaskModal");
    this.pauseBtn = document.getElementById("pauseBtn");
    this.cycleBtn = document.getElementById("cycleBtn");
  }

  setupPage() {
    this.displayObservationInfo();
    this.createTaskButtons();
    this.setupEndSessionButton();
    this.setupAddTaskButton();
    this.setupPauseButton();
    this.setupCycleButton();
  }

  setupPauseButton() {
    if (!this.pauseBtn) return;
    this.pauseBtn.addEventListener("click", (e) => {
      e.preventDefault();
      chronometer.pause();
      return false;
    });
  }

  setupCycleButton() {
    if (!this.cycleBtn) return;
    this.cycleBtn.addEventListener("click", (e) => {
      e.preventDefault();
      chronometer.topCycle();
      // Petit feedback visuel léger
      this.cycleBtn.animate(
        [{ transform: "scale(1)" }, { transform: "scale(1.05)" }, { transform: "scale(1)" }],
        { duration: 180, easing: "ease-out" }
      );
      return false;
    });
  }

  displayObservationInfo() {
    if (this.observationInfo) {
      const formattedDate = new Date(
        this.observationInfo.examDate
      ).toLocaleDateString("fr-FR");
      this.observationInfoDiv.innerHTML = `
                <h2>Session d'observation en cours</h2>
                <div class="info-details">
                    <p><strong>Collaborateur :</strong> ${this.observationInfo.examineeName}</p>
                    <p><strong>Observateur :</strong> ${this.observationInfo.examinerName}</p>
                    <p><strong>Date :</strong> ${formattedDate}</p>
                </div>
            `;
    }
  }

  createTaskButtons() {
    if (this.tasks && this.tasks.length > 0) {
      this.tasks.forEach((task) => {
        const buttonContainer = document.createElement("div");
        buttonContainer.className = "task-button-container";

        const button = document.createElement("button");
        button.className = "task-button";
        button.style.backgroundColor = task.color;
        button.textContent = task.title;
        button.dataset.taskId = task.id;
        button.onclick = () => chronometer.start(task.id);

        const infoButton = document.createElement("button");
        infoButton.className = "info-button";
        infoButton.innerHTML = '<span class="info-icon">ℹ️</span>';
        infoButton.onclick = () =>
          this.showDescription(task.title, task.description);

        buttonContainer.appendChild(button);
        buttonContainer.appendChild(infoButton);
        this.buttonsGrid.appendChild(buttonContainer);
      });
    } else {
      this.buttonsGrid.innerHTML =
        '<p class="no-tasks">Aucune tâche n\'a été configurée.</p>';
    }
  }

  showDescription(title, description) {
    document.getElementById("modalTitle").textContent = title;
    document.getElementById("modalDescription").textContent =
      description || "Aucune description disponible";
    this.descriptionModal.show();
  }

  setupEndSessionButton() {
    const endSessionBtn = document.getElementById("endSessionBtn");
    if (endSessionBtn) {
      endSessionBtn.addEventListener("click", () => {
        if (chronometer.isRunning) {
          chronometer.stop();
        }
        window.location.href = "resume.html";
      });
    }
  }

  setupAddTaskButton() {
    const addTaskBtn = document.getElementById("addTaskBtn");
    const addTaskForm = document.getElementById("addTaskForm");
    const oldBtn = addTaskBtn.cloneNode(true);
    addTaskBtn.parentNode.replaceChild(oldBtn, addTaskBtn);

    oldBtn.onclick = (e) => {
      e.preventDefault();
      e.stopPropagation();
      document.getElementById("addTaskModal").style.display = "block";
      // Pré-remplir la couleur avec une nouvelle couleur non utilisée
      const colorInput = document.getElementById("taskColor");
      if (colorInput) colorInput.value = this.getNextAvailableColor();
      return false;
    };

    if (addTaskForm) {
      addTaskForm.onsubmit = (e) => {
        e.preventDefault();
        const newTask = {
          id: Date.now().toString(),
          title: document.getElementById("taskTitle").value,
          description: document.getElementById("taskDescription").value,
          color: document.getElementById("taskColor").value,
        };

        this.tasks.push(newTask);
        Storage.set("tasks", this.tasks);

        addTaskForm.reset();
        document.getElementById("addTaskModal").style.display = "none";

        this.buttonsGrid.innerHTML = "";
        this.createTaskButtons();
        return false;
      };
    }

    const cancelBtn = document.querySelector("#addTaskModal .cancel-btn");
    if (cancelBtn) {
      cancelBtn.onclick = (e) => {
        e.preventDefault();
        addTaskForm.reset();
        document.getElementById("addTaskModal").style.display = "none";
        return false;
      };
    }

    const closeBtn = document.querySelector("#addTaskModal .close-modal");
    if (closeBtn) {
      closeBtn.onclick = (e) => {
        e.preventDefault();
        document.getElementById("addTaskModal").style.display = "none";
        return false;
      };
    }
  }

  getNextAvailableColor() {
    const used = new Set((this.tasks || []).map((t) => (t && t.color) || ""));
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
}

document.addEventListener("DOMContentLoaded", () => {
  new ButtonsPage();
});
