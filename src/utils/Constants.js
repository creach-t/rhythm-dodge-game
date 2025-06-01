// Configuration du jeu
export const GAME_CONFIG = {
  // Écran et rendu
  TARGET_FPS: 60,
  
  // Caméra 3D - Ajustée pour vue portrait
  CAMERA: {
    FOV: 60,
    NEAR: 0.1,
    FAR: 1000,
    POSITION: { x: 0, y: 14, z: 25 },  // Plus éloignée et plus haute
    LOOK_AT: { x: 0, y: 0, z: 0 }
  },
  
  // Joueur
  PLAYER: {
    POSITION: { x: 0, y: 0, z: 2 },  // Légèrement vers l'avant
    HEALTH: 100,
    SIZE: 1.2
  },
  
  // Ennemis
  ENEMIES: {
    MAX_COUNT: 3,
    SPAWN_RADIUS: 5,
    SIZE: 1.5,
    COLORS: ['#D3D3D3', '#D3D3D3', '#D3D3D3', '#D3D3D3'], // Couleurs plus vives
  },
  
  // Système de timing
  TIMING: {
    PERFECT_WINDOW: 100,    // ms pour timing parfait
    GOOD_WINDOW: 250,       // ms pour bon timing
    ATTACK_TELEGRAPH: 2000, // ms avant l'attaque
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

  ATTACK_SEQUENCE_1: [
    { enemyId: 0, type: 'normal', delay: 0 },
    { enemyId: 0, type: 'normal', delay: 3000 },
    { enemyId: 0, type: 'normal', delay: 6000 },
    { enemyId: 0, type: 'heavy', delay: 9000 },

  ],
  
  // Score
  SCORE: {
    PERFECT_HIT: 100,
    GOOD_HIT: 50,
    MISS_PENALTY: 0,
    WRONG_ACTION_PENALTY: 0
  }
};

export const TIMING = {
  ATTACK_TELEGRAPH: 1000,        // Durée de l'avertissement visuel/sonore avant l'attaque (ms)
  COMBO_TIMEOUT: 800,            // Temps entre deux attaques dans un combo (ms)
  MIN_SPEED_MULTIPLIER: 0.80,    // Vitesse minimale autorisée (évite que ça devienne injouable)
  SPEED_LOG_FACTOR: 0.08         // Facteur de réduction logarithmique de la vitesse selon le round
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
  BORDER_RADIUS: 20,
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