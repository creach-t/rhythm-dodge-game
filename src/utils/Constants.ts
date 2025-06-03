// ============================================================================
// GAME CONSTANTS - Centralized configuration
// ============================================================================

// Core Game States
export const GAME_STATES = {
  MENU: 'menu',
  PLAYING: 'playing',
  PAUSED: 'paused',
  GAME_OVER: 'game_over',
};

// Attack Types & Defense Actions
export const ATTACK_TYPES = {
  NORMAL: 'NORMAL', // -20 PV
  HEAVY: 'HEAVY', // -50 PV
  FEINT: 'FEINT', // Piège - ne rien faire
};

export const DEFENSE_ACTIONS = {
  NONE: 'none',
  DODGE: 'dodge', // Esquive (faible risque)
  PARRY: 'parry', // Parade (haut risque, contre-attaque si réussie)
};

// ============================================================================
// COMBAT CONFIGURATION
// ============================================================================

// Damage System
export const DAMAGE_CONFIG = {
  NORMAL_ATTACK: 20, // Dégâts attaque normale
  HEAVY_ATTACK: 50, // Dégâts attaque lourde
  FEINT_PENALTY: 10, // Pénalité si action sur feinte
  COUNTER_DAMAGE: 25, // Dégâts de contre-attaque (parade réussie)
};

// Success Rates (probabilités de réussite)
export const SUCCESS_RATES = {
  DODGE: 0.85, // 85% de chance de réussir l'esquive
  PARRY: 0.65, // 65% de chance de réussir la parade
};

// ============================================================================
// VISUAL CONFIGURATION
// ============================================================================

// Color Palette
export const COLORS = {
  // UI Colors
  BACKGROUND: '#1a1a1a',
  PRIMARY: '#4ecdc4',
  SECONDARY: '#45b7d1',
  SUCCESS: '#96ceb4',
  WARNING: '#ffd93d',
  DANGER: '#ff6b6b',
  TEXT: '#ffffff',
  TEXT_SECONDARY: '#cccccc',
  UI_BACKGROUND: '#2a2a2a',
  UI_BORDER: '#404040',

  // Game Object Colors
  PLAYER: '#4ecdc4',
  GROUND: '#331133',
  GRID: '#404040',

  DEFENSE: {
    dodge: 0x4ecdc4,
    parry: 0xff6b6b,
  }, // Couleur de défense par défaut
  // Enemy Colors (hex values for THREE.js)
  ENEMY_DEFAULT: 0xd3d3d3,
  ENEMY_VARIANTS: [0xd3d3d3, 0xd3d3d3, 0xd3d3d3, 0xd3d3d3],

  // Attack Highlight Colors
  ATTACK: {
    normal: 0x4ecdc4, // Cyan pour attaque normale
    heavy: 0xff6b6b, // Rouge pour attaque lourde
    feint: 0x96ceb4, // vert pour feinte
  },
};

// Button Configuration
export const BUTTON_CONFIG = {
  SIZE: 90,
  MARGIN: 30,
  BORDER_RADIUS: 20,
  ACTIVE_SCALE: 0.9,
  FEEDBACK_DURATION: 150,
};

// ============================================================================
// 3D SCENE CONFIGURATION
// ============================================================================

// Camera Settings
export const CAMERA_CONFIG = {
  FOV: 60,
  NEAR: 0.1,
  FAR: 1000,
  POSITION: {x: 0, y: 14, z: 25},
  LOOK_AT: {x: 0, y: 0, z: 0},
};

// Lighting Configuration
export const LIGHTING_CONFIG = {
  AMBIENT: {
    COLOR: 0x404040,
    INTENSITY: 0.4,
  },
  DIRECTIONAL: {
    COLOR: 0xffffff,
    INTENSITY: 1,
    POSITION: {x: 10, y: 10, z: 5},
    CAST_SHADOW: true,
    SHADOW_MAP_SIZE: 2048,
  },
};

// Scene Objects Configuration
export const SCENE_CONFIG = {
  GROUND: {
    SIZE: 20,
    COLOR: 0x2a2a2a,
    POSITION: {x: 0, y: -0.5, z: 0},
  },
  GRID: {
    SIZE: 20,
    DIVISIONS: 20,
    COLOR: 0x404040,
    POSITION: {x: 0, y: -0.49, z: 0},
  },
};

// ============================================================================
// GAME ENTITY CONFIGURATION
// ============================================================================

// Player Configuration
export const PLAYER_CONFIG = {
  POSITION: {x: 0, y: 0, z: 2},
  HEALTH: 250,
  SIZE: 1.2,
  COLOR: 0x4ecdc4,
  GEOMETRY: 'box', // box, sphere, cone
  ANIMATION: {
    IDLE_SPEED: 1.0,
    HOVER_AMPLITUDE: 0.2,
  },
};

// Enemy Configuration
export const ENEMY_CONFIG = {
  MAX_COUNT: 3,
  SPAWN_RADIUS: 5,
  SIZE: 1.5,
  COLORS: [0xd3d3d3, 0xd3d3d3, 0xd3d3d3, 0xd3d3d3],
  GEOMETRIES: ['sphere', 'sphere', 'sphere'], // can be sphere, box, cone
  HEALTH: 50, // Santé des ennemis
  ANIMATION: {
    ROTATION_SPEED: 0.5,
    HOVER_SPEED: 2.0,
    HOVER_AMPLITUDE: 0.3,
    ATTACK_PULSE_SPEED: 8.0,
    ATTACK_PULSE_AMPLITUDE: 0.1,
    ATTACK_MOVE_DISTANCE: 0.5,
  },
  MATERIALS: {
    EMISSIVE_INTENSITY_DEFAULT: 0.2,
    EMISSIVE_INTENSITY_ATTACKING: 0.5,
    SHININESS: 100,
  },
};

// ============================================================================
// TIMING & GAMEPLAY CONFIGURATION
// ============================================================================

// Core Timing Settings
export const TIMING_CONFIG = {
  TARGET_FPS: 60,

  // Action Windows (in milliseconds)
  ACTION_WINDOW: 2000, // Temps pour réagir à une attaque

  // Attack Timing
  ATTACK_TELEGRAPH: 1500, // Temps d'annonce avant l'attaque
  ATTACK_COOLDOWN: 1500, // Temps entre les attaques

  // Round Timing
  ROUND_START_DELAY: 1000,
  ROUND_END_DELAY: 2000,
  ACTION_RESULT_DISPLAY: 1500,
};

// Score System
export const SCORE_CONFIG = {
  DODGE_SUCCESS: 100, // Points pour esquive réussie
  PARRY_SUCCESS: 200, // Points pour parade réussie (plus risqué)
  COUNTER_BONUS: 150, // Bonus pour contre-attaque
  MISS_PENALTY: -50, // Pénalité pour échec
  FEINT_SUCCESS: 100, // Points pour ne pas tomber dans le piège
  COMBO_MULTIPLIER: 1.1, // 10% bonus par combo
};

// ============================================================================
// LEVEL & PROGRESSION CONFIGURATION
// ============================================================================

// Difficulty Progression
export const DIFFICULTY_CONFIG = {
  ROUND_SCALING: {
    ATTACK_COUNT_BASE: 3,
    ATTACK_COUNT_INCREASE_PER_ROUND: 1,
    MAX_ATTACKS_PER_ROUND: 8,
    SPEED_INCREASE_PER_ROUND: 0.05,
    MAX_SPEED_MULTIPLIER: 2.0,
  },

  ENEMY_SCALING: {
    NEW_ENEMY_EVERY_N_ROUNDS: 3,
    MAX_ACTIVE_ENEMIES: 3,
  },
};

// Predefined Attack Sequences
export const ATTACK_SEQUENCES = {
  TUTORIAL: [
    {enemyId: 0, type: ATTACK_TYPES.NORMAL, delay: 0},
    {enemyId: 1, type: ATTACK_TYPES.HEAVY, delay: 3000},
    {enemyId: 2, type: ATTACK_TYPES.FEINT, delay: 6000},
  ],

  BASIC: [
    {enemyId: 0, type: ATTACK_TYPES.NORMAL, delay: 0},
    {enemyId: 0, type: ATTACK_TYPES.NORMAL, delay: 2000},
    {enemyId: 1, type: ATTACK_TYPES.HEAVY, delay: 4000},
    {enemyId: 2, type: ATTACK_TYPES.NORMAL, delay: 6000},
  ],
};

// ============================================================================
// AUDIO CONFIGURATION (for future use)
// ============================================================================

export const AUDIO_CONFIG = {
  MASTER_VOLUME: 0.7,
  SFX_VOLUME: 0.8,
  MUSIC_VOLUME: 0.5,

  SOUNDS: {
    ATTACK_WARNING: 'attack_warning.wav',
    DODGE_SUCCESS: 'dodge_success.wav',
    PARRY_SUCCESS: 'parry_success.wav',
    COUNTER_ATTACK: 'counter_attack.wav',
    MISS: 'miss.wav',
    GAME_OVER: 'game_over.wav',
  },
};

// ============================================================================
// UI LAYOUT CONFIGURATION
// ============================================================================

export const UI_CONFIG = {
  HUD: {
    PADDING: 20,
    HEALTH_BAR_HEIGHT: 8,
    SCORE_FONT_SIZE: 24,
    COMBO_FONT_SIZE: 18,
  },

  RESULT_MESSAGE: {
    FONT_SIZE: 36,
    DISPLAY_DURATION: 3000,
    FADE_DURATION: 1000,
  },

  GAME_OVER: {
    OVERLAY_OPACITY: 0.8,
    TITLE_FONT_SIZE: 48,
    SCORE_FONT_SIZE: 32,
  },
};
