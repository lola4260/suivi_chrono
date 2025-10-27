# Suivi Chrono - Guide d'installation

## Configuration requise

- Node.js 14+ et npm
- Pour Android : Android Studio
- Pour iOS : Xcode (Mac uniquement)

## Installation

1. Installer les dépendances :
```bash
npm install
```

2. Initialiser Capacitor :
```bash
npx cap init
```

3. Ajouter les plateformes :
```bash
# Pour Android
npx cap add android

# Pour iOS (Mac uniquement)
npx cap add ios
```

## Développement local

Pour tester l'application dans le navigateur :
```bash
npm start
```
Ouvrez http://localhost:8080/html/formulaire.html

## Construction des applications natives

### Android
```bash
npm run build:android
```
Cela ouvrira Android Studio. Cliquez sur "Run" pour compiler et lancer l'application.

### iOS (Mac uniquement)
```bash
npm run build:ios
```
Cela ouvrira Xcode. Cliquez sur "Play" pour compiler et lancer l'application.

## Notes importantes

- L'application utilise un service worker pour le fonctionnement hors ligne
- Les icônes sont générées en SVG dans le dossier css/icons
- L'interface s'adapte automatiquement aux différentes tailles d'écran
- La mise en page est optimisée pour les interactions tactiles

## Sécurité

Pour le déploiement en production :
1. Utilisez HTTPS
2. Configurez les en-têtes de sécurité appropriés
3. Testez sur différents appareils avant le déploiement

## Mises à jour

Après modification du code web :
```bash
npm run copy
npx cap sync
```