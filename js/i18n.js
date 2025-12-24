// Système d'internationalisation (i18n)
const i18n = {
  currentLang: 'fr',
  
  translations: {
    fr: {
      // Page formulaire
      'app.title': 'Suivi des Collaborateurs',
      'form.title': 'Configuration du suivi du collaborateur',
      'form.observationInfo': 'Informations de l\'observation',
      'form.examineeName': 'Collaborateur observé :',
      'form.examinerName': 'Observateur :',
      'form.date': 'Date :',
      'form.examineeNamePlaceholder': 'Nom du collaborateur',
      'form.examinerNamePlaceholder': 'Nom de l\'observateur',
      'form.activitiesConfig': 'Configuration des activités',
      'form.presets': 'Profils prédéfinis',
      'form.presetsHint': 'Chargez un ensemble de tâches prédéfinies selon le type d\'activité :',
      'form.preset.cariste': 'Cariste',
      'form.preset.assemblage': 'Assemblage',
      'form.preset.picking': 'Picking/Kitting',
      'form.preset.chafab': 'Chafab',
      'form.addManually': 'Ajouter une tâche manuellement',
      'form.taskTitle': 'Nom de l\'activité :',
      'form.taskDescription': 'Description de l\'activité :',
      'form.buttonColor': 'Couleur du bouton :',
      'form.addTask': 'Ajouter la tâche',
      'form.taskList': 'Liste des tâches configurées',
      'form.reset': 'Réinitialiser',
      'form.validate': 'Valider et passer au chronométrage',
      
      // Page chronométrage (buttons)
      'chrono.title': 'Suivi des Collaborateurs - Chronométrage',
      'chrono.cycles': 'Cycles:',
      'chrono.pause': 'Pause',
      'chrono.topCycle': 'Top cycle',
      'chrono.topCycleTitle': 'Marquer la fin d\'un cycle',
      'chrono.changeTask': 'Changer de tâche',
      'chrono.changeTaskTitle': 'Changer la tâche en cours',
      'chrono.cycle': 'Cycle:',
      'chrono.cycleTitle': 'Durée du cycle en cours',
      'chrono.remarkPlaceholder': 'Ajouter une remarque…',
      'chrono.remarkAdd': 'Ajouter',
      'chrono.remarkAddTitle': 'Associer la remarque à la mesure en cours',
      'chrono.endSession': 'Terminer la session',
      'chrono.addNewTask': 'Ajouter une nouvelle tâche',
      
      // Modales
      'modal.addTask': 'Ajouter une nouvelle tâche',
      'modal.taskTitle': 'Titre de la tâche :',
      'modal.description': 'Description :',
      'modal.color': 'Couleur :',
      'modal.add': 'Ajouter',
      'modal.cancel': 'Annuler',
      'modal.changeTask': 'Changer de tâche',
      'modal.selectTask': 'Sélectionnez la tâche correcte :',
      
      // Page résumé
      'resume.title': 'Résumé de la session',
      'resume.sessionTitle': 'Résumé de la session d\'observation',
      'resume.goToForm': 'Aller au formulaire',
      'resume.goToFormTitle': 'Commencer une nouvelle configuration',
      'resume.newSession': 'Nouvelle session',
      'resume.newSessionTitle': 'Effacer et démarrer une nouvelle session',
      'resume.vaNvaChart': 'Répartition VA / NVA',
      'resume.pieChart': 'Répartition du temps par activité',
      'resume.barChart': 'Temps moyen par activité',
      'resume.gaussChart': 'Distribution des temps (Courbe de Gauss)',
      'resume.export': 'Exporter',
      'resume.exportTitle': 'Exporter',
      
      // Messages divers
      'common.delete': 'Supprimer',
      'common.edit': 'Modifier',
      'common.confirm': 'Confirmer',
      'common.close': 'Fermer',
      'common.save': 'Enregistrer',
      'common.va': 'VA',
      'common.nva': 'NVA',
      
      // Messages JavaScript
      'js.confirmReplacePreset': 'Voulez-vous remplacer les tâches existantes par ce profil prédéfini ?',
      'js.presetLoaded': 'Profil "{preset}" chargé avec {count} tâches',
      'js.noTaskToDelete': 'Aucune tâche à supprimer',
      'js.confirmDeleteAll': 'Voulez-vous vraiment supprimer toutes les {count} tâches ?',
      'js.allTasksDeleted': 'Toutes les tâches ont été supprimées',
      'js.noDescription': 'Aucune description',
      'js.noDescriptionAvailable': 'Aucune description disponible',
      'js.noTasksConfigured': 'Aucune tâche n\'a été configurée.',
      'js.sessionInProgress': 'Session d\'observation en cours',
      'js.employee': 'Collaborateur :',
      'js.observer': 'Observateur :',
      'js.date': 'Date :',
      'js.resume': 'Reprendre',
      'js.pause': 'Pause',
      
      // Messages Excel/Graphiques
      'excel.va': 'VA',
      'excel.nva': 'NVA',
      'excel.unclassified': 'Non classé',
      'excel.activityDuration': 'Durée de l\'activité',
      'excel.frequency': 'Fréquence',
      'excel.noGaussData': 'Pas assez de données pour afficher la courbe de Gauss. Il faut au moins 2 mesures par activité.',
      'excel.exportError': 'Erreur lors de l\'export - regarde la console pour plus de détails.',
      'excel.timeSummary': 'Résumé des temps par tâche',
      'excel.detailedStats': 'Statistiques détaillées par tâche',
      'excel.measurement': 'Mesure',
      'excel.duration': 'Durée',
      'excel.deviationFromAvg': 'Écart par rapport à la moyenne',
      'excel.chronologicalDetails': 'Détails chronologiques des activités',
      'excel.task': 'Tâche',
      'excel.cycle': 'Cycle #',
      'excel.start': 'Début',
      'excel.end': 'Fin',
      'excel.remark': 'Remarque',
      'excel.durationText': 'Durée (texte)',
      'excel.durationMs': 'Durée (ms)',
      'excel.durationDays': 'Durée (jours)',
      'excel.globalCycles': 'Cycles (globaux)',
      'excel.timestamp': 'Horodatage',
      'excel.raw': 'Raw',
      'excel.vaNva': 'VA/NVA',
      'excel.sessionInfo': 'Informations de la session',
      'excel.employee': 'Collaborateur',
      'excel.observer': 'Observateur',
      'excel.date': 'Date',
      'excel.totalTime': 'Temps total',
      'excel.percentage': 'Pourcentage',
      'excel.classification': 'Classification',
      'excel.cyclesNb': 'Cycles (nb)',
      'excel.avgCycle': 'Cycle moyen',
      'excel.occurrences': 'Nombre d\'occurrences',
      'excel.avgTime': 'Temps moyen',
      'excel.minTime': 'Temps minimum',
      'excel.maxTime': 'Temps maximum',
      'excel.percentageTotal': 'Pourcentage du temps total',
      'excel.totalSessionTime': 'Temps total de la session',
      'excel.timeDistribution': 'Distribution des temps pour : {task}',
      'excel.chronologicalDetailsExtended': 'Détails chronologiques des activités (extended)',
      'excel.gaussCurves': 'Courbes de Gauss (points normalisés)',
      'excel.taskLabel': 'Tâche : {task}',
      'excel.xMs': 'x (ms)',
      'excel.yNormalized': 'y (normalisé)',
      'excel.noGaussDataSheet': 'Pas assez de données pour générer des courbes de Gauss (au moins 2 mesures par activité).',
      'excel.vaNvaDistribution': 'Répartition VA / NVA',
      'excel.category': 'Catégorie',
      'excel.sequences': 'Séquences',
      'excel.sequence': 'Séquence',
      'excel.timestampLabel': 'Horodate',
      'excel.durationSecond': 'Durée (seconde)',
      'excel.durationCmin': 'Durée (Cmin)',
      'excel.activity': 'Activité',
    },
    
    en: {
      // Formulaire page
      'app.title': 'Employee Tracking',
      'form.title': 'Employee Tracking Configuration',
      'form.observationInfo': 'Observation Information',
      'form.examineeName': 'Observed Employee:',
      'form.examinerName': 'Observer:',
      'form.date': 'Date:',
      'form.examineeNamePlaceholder': 'Employee name',
      'form.examinerNamePlaceholder': 'Observer name',
      'form.activitiesConfig': 'Activities Configuration',
      'form.presets': 'Preset Profiles',
      'form.presetsHint': 'Load a predefined set of tasks according to the activity type:',
      'form.preset.cariste': 'Forklift Operator',
      'form.preset.assemblage': 'Assembly',
      'form.preset.picking': 'Picking/Kitting',
      'form.preset.chafab': 'Chafab',
      'form.addManually': 'Add a task manually',
      'form.taskTitle': 'Activity Name:',
      'form.taskDescription': 'Activity Description:',
      'form.buttonColor': 'Button Color:',
      'form.addTask': 'Add Task',
      'form.taskList': 'Configured Tasks List',
      'form.reset': 'Reset',
      'form.validate': 'Validate and start timing',
      
      // Timing page (buttons)
      'chrono.title': 'Employee Tracking - Timing',
      'chrono.cycles': 'Cycles:',
      'chrono.pause': 'Pause',
      'chrono.topCycle': 'Top cycle',
      'chrono.topCycleTitle': 'Mark the end of a cycle',
      'chrono.changeTask': 'Change task',
      'chrono.changeTaskTitle': 'Change the current task',
      'chrono.cycle': 'Cycle:',
      'chrono.cycleTitle': 'Current cycle duration',
      'chrono.remarkPlaceholder': 'Add a remark…',
      'chrono.remarkAdd': 'Add',
      'chrono.remarkAddTitle': 'Associate the remark with the current measurement',
      'chrono.endSession': 'End Session',
      'chrono.addNewTask': 'Add a new task',
      
      // Modals
      'modal.addTask': 'Add a new task',
      'modal.taskTitle': 'Task Title:',
      'modal.description': 'Description:',
      'modal.color': 'Color:',
      'modal.add': 'Add',
      'modal.cancel': 'Cancel',
      'modal.changeTask': 'Change task',
      'modal.selectTask': 'Select the correct task:',
      
      // Summary page
      'resume.title': 'Session Summary',
      'resume.sessionTitle': 'Observation Session Summary',
      'resume.goToForm': 'Go to Form',
      'resume.goToFormTitle': 'Start a new configuration',
      'resume.newSession': 'New Session',
      'resume.newSessionTitle': 'Clear and start a new session',
      'resume.vaNvaChart': 'VA / NVA Distribution',
      'resume.pieChart': 'Time Distribution by Activity',
      'resume.barChart': 'Average Time per Activity',
      'resume.gaussChart': 'Time Distribution (Gaussian Curve)',
      'resume.export': 'Export',
      'resume.exportTitle': 'Export',
      
      // Miscellaneous messages
      'common.delete': 'Delete',
      'common.edit': 'Edit',
      'common.confirm': 'Confirm',
      'common.close': 'Close',
      'common.save': 'Save',
      'common.va': 'VA',
      'common.nva': 'NVA',
      
      // JavaScript messages
      'js.confirmReplacePreset': 'Do you want to replace existing tasks with this preset profile?',
      'js.presetLoaded': 'Profile "{preset}" loaded with {count} tasks',
      'js.noTaskToDelete': 'No task to delete',
      'js.confirmDeleteAll': 'Do you really want to delete all {count} tasks?',
      'js.allTasksDeleted': 'All tasks have been deleted',
      'js.noDescription': 'No description',
      'js.noDescriptionAvailable': 'No description available',
      'js.noTasksConfigured': 'No tasks have been configured.',
      'js.sessionInProgress': 'Observation session in progress',
      'js.employee': 'Employee:',
      'js.observer': 'Observer:',
      'js.date': 'Date:',
      'js.resume': 'Resume',
      'js.pause': 'Pause',
      
      // Excel/Charts messages
      'excel.va': 'VA',
      'excel.nva': 'NVA',
      'excel.unclassified': 'Unclassified',
      'excel.activityDuration': 'Activity Duration',
      'excel.frequency': 'Frequency',
      'excel.noGaussData': 'Not enough data to display the Gaussian curve. At least 2 measurements per activity are required.',
      'excel.exportError': 'Export error - check the console for more details.',
      'excel.timeSummary': 'Time Summary by Task',
      'excel.detailedStats': 'Detailed Statistics by Task',
      'excel.measurement': 'Measurement',
      'excel.duration': 'Duration',
      'excel.deviationFromAvg': 'Deviation from Average',
      'excel.chronologicalDetails': 'Chronological Activity Details',
      'excel.task': 'Task',
      'excel.cycle': 'Cycle #',
      'excel.start': 'Start',
      'excel.end': 'End',
      'excel.remark': 'Remark',
      'excel.durationText': 'Duration (text)',
      'excel.durationMs': 'Duration (ms)',
      'excel.durationDays': 'Duration (days)',
      'excel.globalCycles': 'Cycles (global)',
      'excel.timestamp': 'Timestamp',
      'excel.raw': 'Raw',
      'excel.vaNva': 'VA/NVA',
      'excel.sessionInfo': 'Session Information',
      'excel.employee': 'Employee',
      'excel.observer': 'Observer',
      'excel.date': 'Date',
      'excel.totalTime': 'Total Time',
      'excel.percentage': 'Percentage',
      'excel.classification': 'Classification',
      'excel.cyclesNb': 'Cycles (nb)',
      'excel.avgCycle': 'Average Cycle',
      'excel.occurrences': 'Number of Occurrences',
      'excel.avgTime': 'Average Time',
      'excel.minTime': 'Minimum Time',
      'excel.maxTime': 'Maximum Time',
      'excel.percentageTotal': 'Percentage of Total Time',
      'excel.totalSessionTime': 'Total Session Time',
      'excel.timeDistribution': 'Time Distribution for: {task}',
      'excel.chronologicalDetailsExtended': 'Chronological Activity Details (extended)',
      'excel.gaussCurves': 'Gaussian Curves (normalized points)',
      'excel.taskLabel': 'Task: {task}',
      'excel.xMs': 'x (ms)',
      'excel.yNormalized': 'y (normalized)',
      'excel.noGaussDataSheet': 'Not enough data to generate Gaussian curves (at least 2 measurements per activity).',
      'excel.vaNvaDistribution': 'VA / NVA Distribution',
      'excel.category': 'Category',
      'excel.sequences': 'Sequences',
      'excel.sequence': 'Sequence',
      'excel.timestampLabel': 'Timestamp',
      'excel.durationSecond': 'Duration (second)',
      'excel.durationCmin': 'Duration (Cmin)',
      'excel.activity': 'Activity',
    }
  },
  
  // Initialiser la langue
  init() {
    // Charger la langue depuis le localStorage ou utiliser le navigateur
    const savedLang = localStorage.getItem('appLanguage');
    if (savedLang && (savedLang === 'fr' || savedLang === 'en')) {
      this.currentLang = savedLang;
    } else {
      // Détecter la langue du navigateur
      const browserLang = navigator.language.split('-')[0];
      this.currentLang = (browserLang === 'fr' || browserLang === 'en') ? browserLang : 'fr';
    }
    // Mettre à jour l'attribut lang du HTML immédiatement
    if (document.documentElement) {
      document.documentElement.lang = this.currentLang;
    }
  },
  
  // Appliquer les traductions au DOM (appeler après que le DOM soit chargé)
  applyTranslationsToDOM() {
    this.applyTranslations();
  },
  
  // Changer de langue
  setLanguage(lang) {
    if (lang === 'fr' || lang === 'en') {
      this.currentLang = lang;
      localStorage.setItem('appLanguage', lang);
      this.applyTranslations();
      // Mettre à jour l'attribut lang du HTML
      document.documentElement.lang = lang;
    }
  },
  
  // Obtenir une traduction
  t(key) {
    return this.translations[this.currentLang][key] || key;
  },
  
  // Appliquer les traductions sur tous les éléments avec data-i18n
  applyTranslations() {
    // Traduire tous les éléments avec l'attribut data-i18n
    document.querySelectorAll('[data-i18n]').forEach(element => {
      const key = element.getAttribute('data-i18n');
      const translation = this.t(key);
      
      // Gérer différents types d'éléments
      if (element.tagName === 'INPUT' && element.type !== 'submit' && element.type !== 'button') {
        if (element.hasAttribute('placeholder')) {
          element.placeholder = translation;
        } else {
          element.value = translation;
        }
      } else if (element.tagName === 'TEXTAREA') {
        if (element.hasAttribute('placeholder')) {
          element.placeholder = translation;
        }
      } else {
        element.textContent = translation;
      }
    });
    
    // Traduire les attributs title
    document.querySelectorAll('[data-i18n-title]').forEach(element => {
      const key = element.getAttribute('data-i18n-title');
      element.title = this.t(key);
    });
    
    // Traduire le titre de la page
    const titleKey = document.querySelector('meta[name="i18n-title"]')?.getAttribute('content');
    if (titleKey) {
      document.title = this.t(titleKey);
    }
    
    // Mettre à jour le sélecteur de langue si présent
    this.updateLanguageSelector();
  },
  
  // Mettre à jour le sélecteur de langue
  updateLanguageSelector() {
    const selector = document.getElementById('languageSelector');
    if (selector) {
      selector.value = this.currentLang;
    }
  },
  
  // Créer le sélecteur de langue
  createLanguageSelector() {
    const selector = document.createElement('div');
    selector.className = 'language-selector';
    selector.innerHTML = `
      <select id="languageSelector" class="language-select">
        <option value="fr" ${this.currentLang === 'fr' ? 'selected' : ''}>🇫🇷 Français</option>
        <option value="en" ${this.currentLang === 'en' ? 'selected' : ''}>🇬🇧 English</option>
      </select>
    `;
    
    // Ajouter l'événement de changement
    selector.querySelector('#languageSelector').addEventListener('change', (e) => {
      this.setLanguage(e.target.value);
    });
    
    return selector;
  }
};

// Initialiser la langue immédiatement (sans attendre le DOM)
i18n.init();

// Appliquer les traductions une fois que le DOM est chargé
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => i18n.applyTranslationsToDOM());
} else {
  i18n.applyTranslationsToDOM();
}
