# Suivi Chrono

Application web progressive (PWA) pour le suivi chronométré des tâches et activités. Permet de mesurer, analyser et exporter les durées des différentes activités d'un collaborateur.

## Fonctionnalités

- Chronométrage précis des activités
- Visualisation des statistiques (graphiques)
- Export des données vers Excel
- Installation sur mobile (PWA)
- Fonctionne hors-ligne
- Analyses statistiques détaillées

## Installation sur Mobile

### Pour iPhone (Safari)

1. Ouvrez Safari sur votre iPhone
2. Visitez : [https://lola4260.github.io/suivi_chrono/html/formulaire.html](https://lola4260.github.io/suivi_chrono/html/formulaire.html)
3. Appuyez sur le bouton Partager
4. Sélectionnez "Sur l'écran d'accueil"
5. Donnez un nom à l'application (ex: "Suivi Chrono")
6. Appuyez sur "Ajouter"

### Pour Android (Chrome)

1. Ouvrez Chrome sur votre appareil Android
2. Visitez : [https://lola4260.github.io/suivi_chrono/html/formulaire.html](https://lola4260.github.io/suivi_chrono/html/formulaire.html)
3. Une bannière "Ajouter à l'écran d'accueil" apparaîtra automatiquement
   - Si la bannière n'apparaît pas :
   - Appuyez sur les trois points (⋮) en haut à droite
   - Sélectionnez "Ajouter à l'écran d'accueil"
4. Appuyez sur "Installer" ou "Ajouter"

L'application est maintenant installée sur votre appareil et accessible depuis l'écran d'accueil !

## Utilisation sur Ordinateur

1. Ouvrez votre navigateur (Chrome, Edge, Safari, Firefox)
2. Visitez : [https://lola4260.github.io/suivi_chrono/html/formulaire.html](https://lola4260.github.io/suivi_chrono/html/formulaire.html)
3. Utilisez l'application directement dans votre navigateur

## Guide d'utilisation

### Configuration initiale

1. Remplissez les informations de l'observation :
   - Nom du collaborateur observé
   - Nom de l'observateur
   - Date de l'observation

2. Configurez les activités à suivre :
   - Donnez un nom à chaque activité
   - Ajoutez une description (optionnel)
   - Choisissez une couleur pour le bouton

3. Validez pour passer au chronométrage

### Chronométrage

1. Appuyez sur un bouton d'activité pour démarrer le chronométrage
2. Le chronomètre démarre automatiquement
3. Appuyez sur une autre activité pour basculer
4. Utilisez le bouton "Terminer la session" quand vous avez fini

### Résumé et Export

1. Consultez les graphiques de répartition du temps
2. Analysez les statistiques détaillées
3. Exportez les données vers Excel si nécessaire

## Fonctionnalités analytiques

- Distribution des temps par activité (graphique circulaire)
- Temps moyen par activité (graphique en barres)
- Distribution statistique (courbe de Gauss)
- Export Excel avec feuilles multiples :
  - Données brutes
  - Statistiques détaillées
  - Graphiques

## Notes de version

### Version 1.0.0
- Interface responsive
- Support PWA complet
- Fonctionnement hors-ligne
- Export Excel amélioré
- Visualisations statistiques

## Optimisation (2025-11-04)

- Réduction de la taille des fichiers JavaScript et HTML sans changer l'interface ni les fonctionnalités:
   - Suppression des commentaires verbeux et des `console.*` de debug dans `js/resume.js` (les alertes utilisateur restent actives)
   - Allègement de l'inscription du Service Worker dans les pages HTML
   - Nettoyage des commentaires de tête dans la plupart des fichiers JS
- Aucun changement de logique ni de sélecteurs CSS; l'interface reste identique.
- Si besoin de restaurer un comportement de debug, réintroduire des `console.log` localement le temps du diagnostic.