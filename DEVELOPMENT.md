# Guide de Développement - Rhythm Dodge Game

## 🚀 Démarrage rapide

### Installation
```bash
git clone https://github.com/creach-t/rhythm-dodge-game.git
cd rhythm-dodge-game
npm install
npm start
```

### Premier lancement
1. Installer Expo CLI globalement : `npm install -g @expo/cli`
2. Lancer le projet : `expo start`
3. Scanner le QR code avec Expo Go (mobile) ou lancer sur simulateur

## 🏗️ Architecture du projet

### Structure modulaire
Le projet est organisé en modules indépendants pour faciliter la maintenance et l'extension :

```
src/
├── components/     # Composants UI React Native
├── engine/         # Moteur de jeu principal
├── entities/       # Entités du jeu (Player, Enemy)
├── render/         # Système de rendu 3D
├── systems/        # Systèmes de gameplay
└── utils/          # Utilitaires et helpers
```

### Flux de données
1. **GameEngine** → Logique principale et état du jeu
2. **InputManager** → Capture et timing des inputs
3. **TimingSystem** → Évaluation de la précision
4. **AttackSequencer** → Génération des patterns d'attaque
5. **GameScreen** → Rendu 3D et interface

## 🎮 Système de gameplay

### Types d'actions
- **Esquive (Droite)** → Contre attaques normales (jaune)
- **Parade (Gauche)** → Contre attaques lourdes (bleu)
- **Aucune action** → Contre feintes (rouge)

### Timing Windows
- **Parfait** : ±100ms → 100 points
- **Bon** : ±250ms → 50 points
- **Raté** : > 250ms → -25 points

### Progression des rounds
- **Round 1** : Tutorial (1 de chaque type)
- **Rounds 2-3** : Débutant (70% normal, 20% lourd, 10% feinte)
- **Rounds 4-10** : Intermédiaire (50%/35%/15%)
- **Round 11+** : Avancé (40%/40%/20%)

## 🛠️ Développement

### Ajout de nouvelles fonctionnalités

#### Nouveau type d'attaque
1. Ajouter dans `Constants.js` → `ATTACK_TYPES`
2. Mettre à jour `AttackSequencer.js` → patterns
3. Ajouter la logique dans `GameEngine.js` → `getExpectedAction()`
4. Créer les visuels dans `GameScreen.js` → `highlightEnemy()`

#### Nouveau système de scoring
1. Modifier `Constants.js` → `SCORE`
2. Mettre à jour `TimingSystem.js` → `evaluateAction()`
3. Ajuster `GameEngine.js` → `applyActionResult()`

#### Nouveaux modèles 3D
1. Remplacer les formes basiques dans `GameScreen.js` → `createEnemies()`
2. Utiliser un loader pour .obj/.gltf
3. Ajouter animations avec Three.js AnimationMixer

### Performance mobile

#### Optimisations importantes
- **Frame rate** : Target 60 FPS, fallback 30 FPS
- **Géométries** : Réutiliser les geometries/materials
- **Textures** : Limiter à 512x512 max
- **Polygones** : < 1000 par ennemi pour mobile
- **Effets** : Éviter les shaders complexes

#### Monitoring performance
```javascript
// Dans GameScreen.js
const stats = renderer.info;
console.log(`Triangles: ${stats.render.triangles}`);
console.log(`Calls: ${stats.render.calls}`);
```

### Debug et tests

#### Logs de debug
```javascript
// Activer dans Constants.js
export const DEBUG = {
  TIMING: true,
  ATTACKS: true,
  PERFORMANCE: false
};
```

#### Tests de timing
```javascript
// Dans AttackSequencer.js
const testSequence = attackSequencer.generateTestSequence([
  { type: 'normal', enemyId: 0 },
  { type: 'heavy', enemyId: 1 },
  { type: 'feint', enemyId: 2 }
]);
```

## 🎨 Customisation visuelle

### Couleurs et thème
Modifier `Constants.js` → `COLORS` pour changer l'apparence globale.

### Animations ennemies
Dans `GameScreen.js` → `animateEnemies()` :
```javascript
// Rotation personnalisée
enemy.rotation.y = time * customSpeed + offset;

// Mouvement personnalisé
enemy.position.y = baseY + Math.sin(time * freq) * amplitude;
```

### Effets visuels
```javascript
// Particules d'impact
const particles = new THREE.Points(geometry, material);
scene.add(particles);

// Glow effect
enemy.material.emissive.setHex(glowColor);
```

## 📱 Déploiement mobile

### Build Android
```bash
expo build:android
```

### Build iOS
```bash
expo build:ios
```

### Configuration des icônes
Placer les assets dans le dossier `assets/` :
- `icon.png` (1024x1024)
- `splash.png` (1242x2436)
- `adaptive-icon.png` (1024x1024)

## 🔧 Extensions futures

### Audio système
```javascript
// Dans un nouveau AudioManager.js
import { Audio } from 'expo-av';

const sound = new Audio.Sound();
await sound.loadAsync(require('./assets/sounds/hit.wav'));
await sound.playAsync();
```

### Sauvegarde scores
```javascript
// Avec AsyncStorage
import AsyncStorage from '@react-native-async-storage/async-storage';

const saveScore = async (score) => {
  await AsyncStorage.setItem('bestScore', score.toString());
};
```

### Multijoueur local
```javascript
// Système de tour par tour
class MultiplayerManager {
  constructor() {
    this.players = [];
    this.currentPlayer = 0;
  }
  
  switchPlayer() {
    this.currentPlayer = (this.currentPlayer + 1) % this.players.length;
  }
}
```

### Analytics
```javascript
// Avec expo-analytics-amplitude
import { Amplitude } from '@amplitude/react-native';

Amplitude.getInstance().logEvent('level_completed', {
  level: gameState.currentRound,
  score: gameState.score
});
```

## 🐛 Dépannage commun

### Three.js ne s'affiche pas
- Vérifier que `expo-gl` et `expo-three` sont installés
- S'assurer que `onContextCreate` est appelé
- Vérifier les erreurs dans la console

### Performance faible
- Réduire le nombre de polygones
- Utiliser `renderer.setPixelRatio(1)` sur mobile
- Désactiver les ombres si nécessaire

### Timing imprécis
- Utiliser `performance.now()` au lieu de `Date.now()`
- Éviter les `setTimeout` pour le gameplay critique
- Implémenter un système de buffering d'inputs

### Erreurs de build
- Nettoyer le cache : `expo r -c`
- Vérifier les versions dans `package.json`
- Rebuilder : `rm -rf node_modules && npm install`

## 📚 Ressources utiles

### Documentation
- [Expo Documentation](https://docs.expo.dev/)
- [Three.js Documentation](https://threejs.org/docs/)
- [React Native Performance](https://reactnative.dev/docs/performance)

### Outils
- [Expo Snack](https://snack.expo.dev/) - Tests rapides
- [Three.js Editor](https://threejs.org/editor/) - Création de scènes
- [Flipper](https://fbflipper.com/) - Debug mobile

### Assets gratuits
- [Kenney Assets](https://kenney.nl/) - Modèles 3D
- [Freesound](https://freesound.org/) - Sons libres
- [OpenGameArt](https://opengameart.org/) - Assets de jeu

---

**Happy coding! 🎮✨**