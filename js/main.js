// Wrapper autour de localStorage avec cache en mémoire.
const StorageCache = {
  cache: new Map(),
  // Stocke une valeur sous une clé donnée
  set(key, value) {
    this.cache.set(key, value);
    localStorage.setItem(key, JSON.stringify(value));
  },
  // Récupère une valeur stockée
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

  // Supprime une valeur stockée
  remove(key) {
    this.cache.delete(key);
    localStorage.removeItem(key);
  },
  // Vide complètement le cache et le localStorage
  clear() {
    this.cache.clear();
    localStorage.clear();
  },
};

const Storage = StorageCache;
const formatCache = new Map();

// Formate une durée en millisecondes en chaîne "HH:MM:SS.CS".
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

// Formate un timestamp en heure locale sous forme "HH:MM:SS".
function formatTime(timestamp) {
  const date = new Date(timestamp);
  return date.toLocaleTimeString("fr-FR", {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });
}

// Valide les champs requis d'un formulaire HTML.
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

// Crée une fonction debouncée.
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

// Crée une fonction throttlée.
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
