const StorageCache = {
  cache: new Map(),
  set(key, value) {
    this.cache.set(key, value);
    localStorage.setItem(key, JSON.stringify(value));
  },
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

  remove(key) {
    this.cache.delete(key);
    localStorage.removeItem(key);
  },
  clear() {
    this.cache.clear();
    localStorage.clear();
  },
};

const Storage = StorageCache;
const formatCache = new Map();

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

function formatTime(timestamp) {
  const date = new Date(timestamp);
  return date.toLocaleTimeString("fr-FR", {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });
}

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
