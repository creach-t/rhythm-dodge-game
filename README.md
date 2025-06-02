# Rhythm Dodge Game

Un jeu d'esquive rythmée mobile développé avec Expo et Three.js, avec une vue 3/4 arrière et un système de timing précis.

## 🎮 Concept du jeu

- **Gameplay** : Esquive rythmée en temps réel avec système de combat tour par tour
- **Contrôles** : 2 boutons tactiles (Esquive / Parade) avec feedback visuel
- **Perspective** : Vue 3/4 arrière du personnage en 3D
- **Ennemis** : Maximum 3 ennemis simultanés avec patterns d'attaque prédéfinis
- **Combat** : Système de timing précis avec fenêtres de réaction
- **Progression** : Système de score et de santé avec game over

## 🛠️ Technologies

- **Framework** : Expo/React Native
- **Rendu 3D** : Three.js (expo-three/expo-gl)
- **Langage** : JavaScript avec architecture modulaire
- **Gestion d'état** : React Hooks + système modulaire

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

## 📁 Structure du projet (Refactorisée)

```
src/
├── components/         # Composants UI réutilisables
│   ├── GameButton.js  # Boutons d'action avec feedback visuel
│   ├── GameScreen.js  # Écran principal simplifié
│   └── GameUI.js      # Interface utilisateur modulaire
├── engine/            # Moteur de jeu épuré
│   ├── GameEngine.js  # Moteur principal (legacy - à refactoriser)
│   ├── GameRenderer.js # Système de rendu 3D encapsulé
│   └── SceneSetup.js  # Configuration de la scène 3D
├── systems/           # Systèmes de gameplay simplifiés
│   ├── EnemySystem.js # Gestion des ennemis et animations
│   └── GameLogic.js   # Logique de combat et scoring
└── utils/             # Utilitaires centralisés
    ├── Constants.js   # ✅ TOUTES les constantes centralisées
    ├── MathUtils.js   # Utilitaires mathématiques
    └── TimeUtils.js   # Gestion du timing
```

## 🎯 Fonctionnalités actuelles

### ✅ Implémenté
- ✅ Configuration Expo complète
- ✅ Interface avec 2 boutons tactiles + feedback visuel
- ✅ Scène 3D fonctionnelle avec éclairage
- ✅ Système de timing précis avec fenêtres d'action
- ✅ Gestion des inputs avec highlighting des boutons
- ✅ Logique de combat basique fonctionnelle
- ✅ Système de santé et game over
- ✅ Animations d'ennemis avec feedback d'attaque
- ✅ Scoring avec messages de résultat
- ✅ Architecture modulaire avec constantes centralisées

### 🔄 En cours de refactorisation
- 🔄 Séparation modulaire (un fichier = une responsabilité)
- 🔄 Gestionnaires d'état centralisés
- 🔄 Services métier découplés
- 🔄 Controllers spécialisés

### 📋 À venir
- [ ] Modèles 3D personnalisés
- [ ] Effets visuels et particules  
- [ ] Système audio/musical synchronisé
- [ ] Niveaux et progression dynamique
- [ ] Nouveaux types d'attaques et mécaniques

## 🎮 Types d'actions & Contrôles

| Action | Bouton | Usage | Couleur de feedback |
|--------|--------|-------|-------------------|
| **Esquive** | Droite | Contre attaques normales | 🟡 Jaune |
| **Parade** | Gauche | Contre attaques lourdes | 🔵 Bleu |
| **Attendre** | - | Quand l'ennemi feinte | 🔴 Rouge |

### Timing
- **Parfait** : ±100ms → 100 points
- **Bon** : ±250ms → 50 points  
- **Raté** : Action incorrecte ou timeout → 0 points + dégâts

## 🏗️ Architecture modulaire (En refactorisation)

### Objectifs de l'architecture
- **Modularité maximale** : Un fichier = une responsabilité
- **Constantes centralisées** : Tout dans `utils/Constants.js`
- **Séparation des préoccupations** : UI / Logique / Rendu découplés
- **Facilité de maintenance** et d'extension

### Nouveaux modules prévus
- **Gestionnaires d'état** : `GameStateManager`, `SceneStateManager`
- **Controllers** : `GameController`, `RenderController`, `UIController`
- **Services métier** : `AttackService`, `PlayerActionService`, `ScoreService`
- **Hooks personnalisés** : `useGameLoop`, `useThreeJS`, `useGameState`

## 📊 Commits récents

- ✅ **Centralisation des constantes** - Toutes les configs dans `Constants.js`
- ✅ **Amélioration UI/UX** - Feedback visuel et layout optimisé
- ✅ **Système de santé** - Game over fonctionnel
- ✅ **Module GameRenderer** - Encapsulation du rendu 3D
- ✅ **Simplification architecture** - Suppression des modules complexes non utilisés

## 🔧 Développement & Refactorisation

### Phase actuelle : Modularisation
Le projet est en cours de refactorisation pour atteindre une architecture où chaque fichier a une responsabilité unique et toutes les constantes sont centralisées.

### Contribuer à la refactorisation
1. Vérifier que les nouvelles constantes vont dans `src/utils/Constants.js`
2. Respecter le principe "un fichier = une responsabilité"
3. Utiliser les modules centralisés plutôt que dupliquer le code
4. Tester les modifications avant commit

## 🤝 Contribution

1. Fork le projet
2. Créer une branche feature (`git checkout -b feature/ModularComponent`)
3. Respecter l'architecture modulaire
4. Commit avec messages descriptifs
5. Push et créer une Pull Request

## 📝 License

Ce projet est sous licence MIT. Voir le fichier `LICENSE` pour plus de détails.

## 🔗 Liens utiles

- [Documentation Expo](https://docs.expo.dev/)
- [Three.js Documentation](https://threejs.org/docs/)
- [Expo Three Documentation](https://github.com/expo/expo-three)

---

**Status** : 🚧 En refactorisation active vers architecture modulaire maximale  
**Prochaine étape** : Création des gestionnaires d'état centralisés