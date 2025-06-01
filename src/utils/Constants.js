// Configuration du jeu
export const GAME_CONFIG = {
  // Écran et rendu
  CANVAS_WIDTH: 400,
  CANVAS_HEIGHT: 800,
  TARGET_FPS: 60,
  
  // Caméra 3D - Ajustée pour vue portrait
  CAMERA: {
    FOV: 60,
    NEAR: 0.1,
    FAR: 1000,
    POSITION: { x: 0, y: 12, z: 8 },  // Plus éloignée et plus haute
    LOOK_AT: { x: 0, y: 0, z: 0 }
  },
  
  // Joueur
  PLAYER: {
    POSITION: { x: 0, y: 0, z: 2 },  // Légèrement vers l'avant
    HEALTH: 100,
    SIZE: 1.2
  },
  
  // Ennemis - Repositionnés pour être plus visibles
  ENEMIES: {
    MAX_COUNT: 3,
    SPAWN_RADIUS: 5,  // Plus près du joueur
    SIZE: 1.5,        // Plus gros
    COLORS: ['#ff6b6b', '#4ecdc4', '#45b7d1', '#96ceb4', '#ffd93d']
  },
  
  // Système de timing
  TIMING: {
    PERFECT_WINDOW: 100,    // ms pour timing parfait
    GOOD_WINDOW: 250,       // ms pour bon timing
    ATTACK_TELEGRAPH: 1000, // ms avant l'attaque
    COMBO_TIMEOUT: 2000     // ms timeout entre attaques
  },
  
  // Types d'attaques
  ATTACK_TYPES: {
    NORMAL: 'normal',    // Nécessite esquive (bouton droite)
    HEAVY: 'heavy',      // Nécessite parade (bouton gauche)
    FEINT: 'feint'       // Aucune action requise
  },
  
  // Actions défensives
  DEFENSE_ACTIONS: {
    NONE: 'none',
    DODGE: 'dodge',      // Bouton droite
    PARRY: 'parry'       // Bouton gauche
  },
  
  // Score
  SCORE: {
    PERFECT_HIT: 100,
    GOOD_HIT: 50,
    MISS_PENALTY: -25,
    WRONG_ACTION_PENALTY: -50
  }
};

// Couleurs du thème
export const COLORS = {
  BACKGROUND: '#1a1a1a',
  PRIMARY: '#4ecdc4',
  SECONDARY: '#45b7d1',
  SUCCESS: '#96ceb4',
  WARNING: '#ffd93d',
  DANGER: '#ff6b6b',
  TEXT: '#ffffff',
  TEXT_SECONDARY: '#cccccc',
  UI_BACKGROUND: '#2a2a2a',
  UI_BORDER: '#404040'
};

// Configuration des boutons - Ajustée pour portrait
export const BUTTON_CONFIG = {
  SIZE: 90,
  MARGIN: 30,
  BORDER_RADIUS: 45,
  ACTIVE_SCALE: 0.9,
  FEEDBACK_DURATION: 150
};

// États du jeu
export const GAME_STATES = {
  MENU: 'menu',
  PLAYING: 'playing',
  PAUSED: 'paused',
  GAME_OVER: 'game_over'
};