// Fenêtre modale réutilisable
class Modal {
  constructor(modalId) {
    this.modal = document.getElementById(modalId);
    if (!this.modal) {
      throw new Error(`Modal element with id '${modalId}' not found`);
    }
    this.closeBtn = this.modal.querySelector(".close-modal");
    if (!this.closeBtn) {
      throw new Error(`Close button not found in modal '${modalId}'`);
    }
    this.setupCloseEvents();
  }

  show() {
    this.modal.style.display = "block";
  }

  hide() {
    this.modal.style.display = "none";
  }

  setupCloseEvents() {
    if (this.closeBtn) {
      this.closeBtn.addEventListener("click", () => this.hide());
    }

    window.addEventListener("click", (event) => {
      if (event.target === this.modal) {
        this.hide();
      }
    });
  }
}
