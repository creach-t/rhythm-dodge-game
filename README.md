# Rhythm Dodge Game

Un jeu d'esquive rythmée mobile développé avec Expo et Three.js, avec une vue 3/4 arrière et un système de timing précis.

## 🎮 Concept du jeu

- **Gameplay** : Esquive rythmée en temps réel
- **Contrôles** : 2 boutons (Esquive droite / Parade gauche)
- **Perspective** : Vue 3/4 arrière du personnage
- **Ennemis** : Maximum 3 ennemis simultanés avec patterns d'attaque prédéfinis
- **Combat** : Tour par tour avec système de timing précis

## 🛠️ Technologies

- **Framework** : Expo/React Native
- **Rendu 3D** : Three.js (expo-three/expo-gl)
- **Langage** : JavaScript/TypeScript
- **Architecture** : Modulaire et extensible

## 🚀 Installation et lancement

### Prérequis
```bash
node >= 16
npm ou yarn
expo-cli
```

### Installation
```bash
# Cloner le repository
git clone https://github.com/creach-t/rhythm-dodge-game.git
cd rhythm-dodge-game

# Installer les dépendances
npm install

# Lancer en mode développement
npm start
```

### Tests sur appareil
```bash
# Android
npm run android

# iOS
npm run ios
```

## 📁 Structure du projet

```
src/
├── components/         # Composants UI réutilisables
│   ├── GameButton.js
│   └── GameUI.js
├── engine/            # Moteur de jeu principal
│   ├── GameEngine.js
│   ├── InputManager.js
│   └── TimingSystem.js
├── entities/          # Gestion des entités du jeu
│   ├── Player.js
│   ├── Enemy.js
│   └── EnemyManager.js
├── render/            # Système de rendu 3D
│   ├── SceneRenderer.js
│   ├── CameraController.js
│   └── ModelLoader.js
├── systems/           # Systèmes de gameplay
│   ├── AttackSequencer.js
│   ├── CombatSystem.js
│   └── ScoreManager.js
└── utils/             # Utilitaires et helpers
    ├── Constants.js
    ├── MathUtils.js
    └── TimeUtils.js
```

## 🎯 Fonctionnalités actuelles

### ✅ Implémenté
- [ ] Configuration Expo de base
- [ ] Interface avec 2 boutons
- [ ] Scène 3D basique
- [ ] Système de timing
- [ ] Gestion des inputs
- [ ] Logique de combat basique

### 🔄 En cours
- [ ] Séquences d'attaques prédéfinies
- [ ] Système de score
- [ ] Animations ennemies

### 📋 À venir
- [ ] Modèles 3D personnalisés
- [ ] Effets visuels et particules
- [ ] Système audio/musical
- [ ] Niveaux et progression
- [ ] Nouveaux types d'attaques

## 🎮 Types d'actions

| Action | Bouton | Usage |
|--------|--------|-------|
| **Esquive** | Droite | Contre attaques normales |
| **Parade** | Gauche | Contre attaques lourdes |
| **Aucune** | - | Quand l'ennemi feinte |

## 🏗️ Architecture modulaire

Le jeu est conçu avec une architecture modulaire pour faciliter :
- L'ajout de nouvelles fonctionnalités
- La maintenance du code
- Les tests unitaires
- La réutilisabilité des composants

### Modules principaux :
- **GameEngine** : Boucle principale et état du jeu
- **InputManager** : Gestion des contrôles tactiles
- **SceneRenderer** : Rendu 3D avec Three.js
- **EnemyManager** : IA et comportements ennemis
- **TimingSystem** : Score basé sur la précision

## 🤝 Contribution

1. Fork le projet
2. Créer une branche feature (`git checkout -b feature/AmazingFeature`)
3. Commit les changements (`git commit -m 'Add AmazingFeature'`)
4. Push sur la branche (`git push origin feature/AmazingFeature`)
5. Ouvrir une Pull Request

## 📝 License

Ce projet est sous licence MIT. Voir le fichier `LICENSE` pour plus de détails.

## 🔗 Liens utiles

- [Documentation Expo](https://docs.expo.dev/)
- [Three.js Documentation](https://threejs.org/docs/)
- [Expo Three Documentation](https://github.com/expo/expo-three)

---

**Status** : 🚧 En développement actif - POC en cours