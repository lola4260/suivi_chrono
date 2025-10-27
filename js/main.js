/**
 * @file main.js
 * @brief Gestion du stockage local avec cache mémoire et fonctions utilitaires.
 *
 * Ce fichier fournit :
 * - Un wrapper autour de `localStorage` avec mise en cache en mémoire pour performance.
 * - Fonctions de formatage de durées et timestamps.
 * - Validation de formulaires, et fonctions utilitaires `debounce` et `throttle`.
 *
 * @date 2025-10-09
 * @author Lola Gauducheau
 */

/**
 * @brief Wrapper autour de localStorage avec cache en mémoire.
 */
const StorageCache = {
  cache: new Map(),

  /**
   * @brief Stocke une valeur sous une clé donnée.
   * @param {string} key Clé sous laquelle stocker la valeur.
   * @param {*} value Valeur à stocker (sera sérialisée en JSON).
   */
  set(key, value) {
    this.cache.set(key, value);
    localStorage.setItem(key, JSON.stringify(value));
  },

  /**
   * @brief Récupère une valeur stockée.
   * @param {string} key Clé de la valeur à récupérer.
   * @returns {*} Valeur stockée ou `null` si elle n'existe pas.
   */
  get(key) {
    if (this.cache.has(key)) {
      return this.cache.get(key);
    }
    const item = localStorage.getItem(key);
    if (item) {
      const parsed = JSON.parse(item);
      this.cache.set(key, parsed);
      return parsed;
    }
    return null;
  },

  /**
   * @brief Supprime une valeur stockée.
   * @param {string} key Clé à supprimer.
   */
  remove(key) {
    this.cache.delete(key);
    localStorage.removeItem(key);
  },

  /**
   * @brief Vide complètement le cache et le localStorage.
   */
  clear() {
    this.cache.clear();
    localStorage.clear();
  },
};

const Storage = StorageCache;
const formatCache = new Map();

/**
 * @brief Formate une durée en millisecondes en chaîne "HH:MM:SS.CS".
 * @param {number} duration Durée en millisecondes.
 * @returns {string} Chaîne formatée.
 */
function formatDuration(duration) {
  if (formatCache.has(duration)) {
    return formatCache.get(duration);
  }

  const hours = Math.floor(duration / 3600000);
  const minutes = Math.floor((duration % 3600000) / 60000);
  const seconds = Math.floor((duration % 60000) / 1000);
  const centiseconds = Math.floor((duration % 1000) / 10);

  const formatted = `${hours.toString().padStart(2, "0")}:${minutes
    .toString()
    .padStart(2, "0")}:${seconds.toString().padStart(2, "0")}.${centiseconds
    .toString()
    .padStart(2, "0")}`;

  if (formatCache.size > 1000) {
    const firstKey = formatCache.keys().next().value;
    formatCache.delete(firstKey);
  }

  formatCache.set(duration, formatted);
  return formatted;
}

/**
 * @brief Formate un timestamp en heure locale sous forme "HH:MM:SS".
 * @param {number} timestamp Timestamp en millisecondes.
 * @returns {string} Heure locale formatée.
 */
function formatTime(timestamp) {
  const date = new Date(timestamp);
  return date.toLocaleTimeString("fr-FR", {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });
}

/**
 * @brief Valide les champs requis d'un formulaire HTML.
 * @param {HTMLFormElement} formElement Formulaire à valider.
 * @returns {boolean} `true` si tous les champs requis sont remplis, `false` sinon.
 */
function validateForm(formElement) {
  const requiredFields = formElement.querySelectorAll("[required]");
  let isValid = true;

  requestAnimationFrame(() => {
    requiredFields.forEach((field) => {
      const hasValue = field.value.trim();
      field.classList.toggle("invalid", !hasValue);
      field.classList.toggle("valid", hasValue);
      if (!hasValue) isValid = false;
    });
  });

  return isValid;
}

/**
 * @brief Crée une fonction debouncée.
 * @param {Function} func Fonction à exécuter après délai.
 * @param {number} wait Délai en millisecondes.
 * @returns {Function} Nouvelle fonction debouncée.
 */
function debounce(func, wait) {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}

/**
 * @brief Crée une fonction throttlée.
 * @param {Function} func Fonction à exécuter.
 * @param {number} limit Intervalle minimum en millisecondes entre deux exécutions.
 * @returns {Function} Nouvelle fonction throttlée.
 */
function throttle(func, limit) {
  let inThrottle;
  return function (...args) {
    if (!inThrottle) {
      func.apply(this, args);
      inThrottle = true;
      setTimeout(() => (inThrottle = false), limit);
    }
  };
}
