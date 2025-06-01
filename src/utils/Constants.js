// ============================================================================
// GAME CONSTANTS - Centralized configuration
// ============================================================================

// Core Game States
export const GAME_STATES = {
  MENU: 'menu',
  PLAYING: 'playing',
  PAUSED: 'paused',
  GAME_OVER: 'game_over'
};

// Attack Types & Defense Actions
export const ATTACK_TYPES = {
  NORMAL: 'normal',    // Requires dodge (right button)
  HEAVY: 'heavy',      // Requires parry (left button) 
  FEINT: 'feint'       // No action required
};

export const DEFENSE_ACTIONS = {
  NONE: 'none',
  DODGE: 'dodge',      // Right button
  PARRY: 'parry'       // Left button
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
  GROUND: '#2a2a2a',
  GRID: '#404040',
  
  // Enemy Colors (hex values for THREE.js)
  ENEMY_DEFAULT: 0xD3D3D3,
  ENEMY_VARIANTS: [0xD3D3D3, 0xD3D3D3, 0xD3D3D3, 0xD3D3D3],
  
  // Attack Highlight Colors
  ATTACK_NORMAL: 0xffd93d,  // Yellow for dodge
  ATTACK_HEAVY: 0x45b7d1,   // Blue for parry
  ATTACK_FEINT: 0xff6b6b    // Red for feint
};

// Button Configuration
export const BUTTON_CONFIG = {
  SIZE: 90,
  MARGIN: 30,
  BORDER_RADIUS: 20,
  ACTIVE_SCALE: 0.9,
  FEEDBACK_DURATION: 150
};

// ============================================================================
// 3D SCENE CONFIGURATION
// ============================================================================

// Camera Settings
export const CAMERA_CONFIG = {
  FOV: 60,
  NEAR: 0.1,
  FAR: 1000,
  POSITION: { x: 0, y: 14, z: 25 },
  LOOK_AT: { x: 0, y: 0, z: 0 }
};

// Lighting Configuration
export const LIGHTING_CONFIG = {
  AMBIENT: {
    COLOR: 0x404040,
    INTENSITY: 0.4
  },
  DIRECTIONAL: {
    COLOR: 0xffffff,
    INTENSITY: 1,
    POSITION: { x: 10, y: 10, z: 5 },
    CAST_SHADOW: true,
    SHADOW_MAP_SIZE: 2048
  }
};

// Scene Objects Configuration
export const SCENE_CONFIG = {
  GROUND: {
    SIZE: 20,
    COLOR: 0x2a2a2a,
    POSITION: { x: 0, y: -0.5, z: 0 }
  },
  GRID: {
    SIZE: 20,
    DIVISIONS: 20,
    COLOR: 0x404040,
    POSITION: { x: 0, y: -0.49, z: 0 }
  }
};

// ============================================================================
// GAME ENTITY CONFIGURATION  
// ============================================================================

// Player Configuration
export const PLAYER_CONFIG = {
  POSITION: { x: 0, y: 0, z: 2 },
  HEALTH: 100,
  SIZE: 1.2,
  COLOR: 0x4ecdc4,
  GEOMETRY: 'box', // box, sphere, cone
  ANIMATION: {
    IDLE_SPEED: 1.0,
    HOVER_AMPLITUDE: 0.2
  }
};

// Enemy Configuration
export const ENEMY_CONFIG = {
  MAX_COUNT: 3,
  SPAWN_RADIUS: 5,
  SIZE: 1.5,
  COLORS: [0xD3D3D3, 0xD3D3D3, 0xD3D3D3, 0xD3D3D3],
  GEOMETRIES: ['sphere', 'sphere', 'sphere'], // can be sphere, box, cone
  ANIMATION: {
    ROTATION_SPEED: 0.5,
    HOVER_SPEED: 2.0,
    HOVER_AMPLITUDE: 0.3,
    ATTACK_PULSE_SPEED: 8.0,
    ATTACK_PULSE_AMPLITUDE: 0.1,
    ATTACK_MOVE_DISTANCE: 0.5
  },
  MATERIALS: {
    EMISSIVE_INTENSITY_DEFAULT: 0.2,
    EMISSIVE_INTENSITY_ATTACKING: 0.5,
    SHININESS: 100
  }
};

// ============================================================================
// TIMING & GAMEPLAY CONFIGURATION
// ============================================================================

// Core Timing Settings
export const TIMING_CONFIG = {
  TARGET_FPS: 60,
  
  // Action Windows (in milliseconds)
  PERFECT_WINDOW: 100,      // Perfect timing window
  GOOD_WINDOW: 250,         // Good timing window
  TOTAL_ACTION_WINDOW: 4000, // Total time player has to react
  
  // Attack Timing
  ATTACK_TELEGRAPH: 2000,   // Warning time before attack
  COMBO_TIMEOUT: 800,       // Time between attacks in combo
  
  // Round Timing
  ROUND_START_DELAY: 1000,
  ROUND_END_DELAY: 2000,
  ACTION_RESULT_DISPLAY: 1500,
  
  // Speed Scaling
  MIN_SPEED_MULTIPLIER: 0.80,
  SPEED_LOG_FACTOR: 0.08
};

// Score System
export const SCORE_CONFIG = {
  PERFECT_HIT: 100,
  GOOD_HIT: 50,
  MISS_PENALTY: 0,
  WRONG_ACTION_PENALTY: 0,
  ROUND_COMPLETION_BONUS: 50,
  COMBO_MULTIPLIER: 1.1  // 10% bonus per combo hit
};

// Health System
export const HEALTH_CONFIG = {
  MAX_HEALTH: 100,
  DAMAGE_ON_MISS: 10,
  DAMAGE_ON_WRONG_ACTION: 5,
  HEALING_PER_PERFECT: 0, // Can be used for difficulty balancing
  CRITICAL_HEALTH_THRESHOLD: 20 // For UI warnings
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
    MAX_SPEED_MULTIPLIER: 2.0
  },
  
  ENEMY_SCALING: {
    NEW_ENEMY_EVERY_N_ROUNDS: 3,
    MAX_ACTIVE_ENEMIES: 3
  }
};

// Predefined Attack Sequences
export const ATTACK_SEQUENCES = {
  TUTORIAL: [
    { enemyId: 0, type: ATTACK_TYPES.NORMAL, delay: 0 },
    { enemyId: 1, type: ATTACK_TYPES.HEAVY, delay: 3000 },
    { enemyId: 2, type: ATTACK_TYPES.FEINT, delay: 6000 }
  ],
  
  BASIC: [
    { enemyId: 0, type: ATTACK_TYPES.NORMAL, delay: 0 },
    { enemyId: 0, type: ATTACK_TYPES.NORMAL, delay: 2000 },
    { enemyId: 1, type: ATTACK_TYPES.HEAVY, delay: 4000 },
    { enemyId: 2, type: ATTACK_TYPES.NORMAL, delay: 6000 }
  ]
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
    PERFECT_HIT: 'perfect_hit.wav',
    GOOD_HIT: 'good_hit.wav',
    MISS: 'miss.wav',
    GAME_OVER: 'game_over.wav'
  }
};

// ============================================================================
// UI LAYOUT CONFIGURATION
// ============================================================================

export const UI_CONFIG = {
  HUD: {
    PADDING: 20,
    HEALTH_BAR_HEIGHT: 8,
    SCORE_FONT_SIZE: 24,
    COMBO_FONT_SIZE: 18
  },
  
  RESULT_MESSAGE: {
    FONT_SIZE: 36,
    DISPLAY_DURATION: 3000,
    FADE_DURATION: 1000
  },
  
  GAME_OVER: {
    OVERLAY_OPACITY: 0.8,
    TITLE_FONT_SIZE: 48,
    SCORE_FONT_SIZE: 32
  }
};

// ============================================================================
// DEBUG & DEVELOPMENT
// ============================================================================

export const DEBUG_CONFIG = {
  ENABLE_LOGGING: __DEV__ || false,
  LOG_FRAME_COUNT: 60, // Log every N frames
  SHOW_FPS: __DEV__ || false,
  SHOW_WIREFRAMES: false,
  ENABLE_STATS: __DEV__ || false
};

// ============================================================================
// LEGACY COMPATIBILITY (to be removed after refactoring)
// ============================================================================

// Maintain backward compatibility during refactoring
export const GAME_CONFIG = {
  TARGET_FPS: TIMING_CONFIG.TARGET_FPS,
  CAMERA: CAMERA_CONFIG,
  PLAYER: PLAYER_CONFIG,
  ENEMIES: ENEMY_CONFIG,
  TIMING: TIMING_CONFIG,
  SCORE: SCORE_CONFIG,
  ATTACK_SEQUENCE_1: ATTACK_SEQUENCES.BASIC
};

export const TIMING = TIMING_CONFIG;
export const BUTTON_CONFIG_LEGACY = BUTTON_CONFIG;