/**
 * @file modal.js
 * @brief Gestion d'une fenêtre modale (popup) réutilisable.
 *
 * Cette classe permet de créer, afficher et fermer un modal en HTML,
 * avec gestion du clic sur le bouton de fermeture et du clic en dehors
 * du modal pour le fermer.
 *
 * @date 2025-10-29
 * @author Lola Gauducheau
 */

/**
 * @class Modal
 * @brief Représente une fenêtre modale.
 */
class Modal {
    /**
     * @brief Constructeur de la classe Modal.
     * @param {string} modalId ID de l'élément modal dans le DOM.
     * @throws {Error} Si l'élément modal ou le bouton de fermeture n'est pas trouvé.
     */
    constructor(modalId) {
        this.modal = document.getElementById(modalId);
        if (!this.modal) {
            throw new Error(`Modal element with id '${modalId}' not found`);
        }
        this.closeBtn = this.modal.querySelector('.close-modal');
        if (!this.closeBtn) {
            throw new Error(`Close button not found in modal '${modalId}'`);
        }
        this.setupCloseEvents();
    }

    /**
     * @brief Affiche le modal.
     */
    show() {
        this.modal.style.display = 'block';
    }

    /**
     * @brief Masque le modal.
     */
    hide() {
        this.modal.style.display = 'none';
    }

    /**
     * @brief Configure les événements de fermeture du modal.
     */
    setupCloseEvents() {
        if (this.closeBtn) {
            this.closeBtn.addEventListener('click', () => this.hide());
        }

        window.addEventListener('click', (event) => {
            if (event.target === this.modal) {
                this.hide();
            }
        });
    }
}
