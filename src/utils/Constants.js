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

// Turn-based States
export const TURN_STATES = {
  PLAYER_TURN: 'player_turn',
  ENEMY_TURN: 'enemy_turn',
  TRANSITION: 'transition'
};

// Attack Phases
export const ATTACK_PHASES = {
  PREPARATION: 'preparation',    // Visual warning, enemy glows
  EXECUTION: 'execution',       // Attack happens - player must react
  RECOVERY: 'recovery'          // Brief pause after attack
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

// Player Turn Actions
export const PLAYER_ACTIONS = {
  HEAL: 'heal',        // Restore health
  ATTACK: 'attack',    // Attack an enemy
  DEFEND: 'defend'     // Defensive stance for next turn
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
  
  // Attack Phase Colors
  ATTACK_PREPARATION: 0xffd93d,  // Yellow during preparation
  ATTACK_EXECUTION: 0xff6b6b,   // Red during execution
  ATTACK_RECOVERY: 0x96ceb4,    // Green during recovery
  
  // Attack Type Colors
  ATTACK_NORMAL: 0xffd93d,  // Yellow for dodge
  ATTACK_HEAVY: 0x45b7d1,   // Blue for parry
  ATTACK_FEINT: 0xff6b6b,   // Red for feint
  
  // Player Turn Colors
  PLAYER_HEAL: 0x96ceb4,    // Green for heal
  PLAYER_ATTACK: 0xff6b6b,  // Red for attack
  PLAYER_DEFEND: 0x45b7d1   // Blue for defend
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
    HOVER_AMPLITUDE: 0.2,
    HEAL_GLOW_INTENSITY: 0.8,
    ATTACK_PULSE_SPEED: 4.0
  },
  ACTIONS: {
    HEAL_AMOUNT: 25,
    ATTACK_DAMAGE: 30,
    DEFEND_REDUCTION: 0.5  // 50% damage reduction
  }
};

// Enemy Configuration
export const ENEMY_CONFIG = {
  MAX_COUNT: 3,
  SPAWN_RADIUS: 5,
  SIZE: 1.5,
  HEALTH: 100,
  COLORS: [0xD3D3D3, 0xD3D3D3, 0xD3D3D3, 0xD3D3D3],
  GEOMETRIES: ['sphere', 'sphere', 'sphere'], // can be sphere, box, cone
  ANIMATION: {
    ROTATION_SPEED: 0.5,
    HOVER_SPEED: 2.0,
    HOVER_AMPLITUDE: 0.3,
    PREPARATION_PULSE_SPEED: 2.0,     // Plus lent
    PREPARATION_SCALE_AMPLITUDE: 0.1,  // Plus subtil
    EXECUTION_SCALE: 1.2,             // Plus subtil
    RECOVERY_FADE_SPEED: 1.0          // Plus lent
  },
  MATERIALS: {
    EMISSIVE_INTENSITY_DEFAULT: 0.2,
    EMISSIVE_INTENSITY_PREPARATION: 0.4,  // Plus subtil
    EMISSIVE_INTENSITY_EXECUTION: 0.8,    // Plus subtil
    EMISSIVE_INTENSITY_RECOVERY: 0.1,
    SHININESS: 100
  }
};

// ============================================================================
// TIMING & GAMEPLAY CONFIGURATION - CORRIGÉ
// ============================================================================

// Core Timing Settings
export const TIMING_CONFIG = {
  TARGET_FPS: 60,
  
  // Turn-based Timing
  TURN_TRANSITION_DURATION: 1000,
  PLAYER_TURN_DURATION: 8000,  // 8 secondes pour choisir
  
  // Attack Phase Timing - RALENTI
  ATTACK_PREPARATION_DURATION: 3000,  // 3 secondes de préparation
  ATTACK_EXECUTION_DURATION: 2000,    // 2 secondes pour réagir
  ATTACK_RECOVERY_DURATION: 1500,     // 1.5 secondes de récupération
  
  // Action Windows (in milliseconds) - PLUS GÉNÉREUX
  PERFECT_WINDOW: 500,      // 500ms pour timing parfait
  GOOD_WINDOW: 1000,        // 1000ms pour bon timing
  TOTAL_ACTION_WINDOW: 2000, // 2 secondes totales pour réagir
  
  // Round Timing
  ROUND_START_DELAY: 2000,
  ROUND_END_DELAY: 3000,
  ACTION_RESULT_DISPLAY: 2000,
  
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
  COMBO_MULTIPLIER: 1.1,  // 10% bonus per combo hit
  PLAYER_ATTACK_BONUS: 25,
  HEAL_BONUS: 10
};

// Health System
export const HEALTH_CONFIG = {
  MAX_HEALTH: 100,
  DAMAGE_ON_MISS: 15,
  DAMAGE_ON_WRONG_ACTION: 10,
  HEALING_PER_PERFECT: 0,
  CRITICAL_HEALTH_THRESHOLD: 20,
  ENEMY_ATTACK_DAMAGE: {
    NORMAL: 15,
    HEAVY: 25,
    FEINT: 5  // Feint does small damage if not avoided
  }
};

// ============================================================================
// ATTACK SEQUENCES CONFIGURATION - PLUS ESPACÉES
// ============================================================================

// Predefined Attack Sequences
export const ATTACK_SEQUENCES = {
  TUTORIAL: {
    name: "Tutorial Sequence",
    attacks: [
      { enemyId: 0, type: ATTACK_TYPES.NORMAL, delay: 0 },
      { enemyId: 1, type: ATTACK_TYPES.HEAVY, delay: 8000 },   // 8 secondes entre attaques
      { enemyId: 2, type: ATTACK_TYPES.FEINT, delay: 16000 }   // 16 secondes
    ]
  },
  
  BASIC_COMBO: {
    name: "Basic Combo",
    attacks: [
      { enemyId: 0, type: ATTACK_TYPES.NORMAL, delay: 0 },
      { enemyId: 1, type: ATTACK_TYPES.NORMAL, delay: 7000 },  // 7 secondes
      { enemyId: 2, type: ATTACK_TYPES.HEAVY, delay: 14000 }   // 14 secondes
    ]
  },
  
  MIXED_ASSAULT: {
    name: "Mixed Assault",
    attacks: [
      { enemyId: 0, type: ATTACK_TYPES.FEINT, delay: 0 },
      { enemyId: 1, type: ATTACK_TYPES.NORMAL, delay: 6000 },  // 6 secondes
      { enemyId: 2, type: ATTACK_TYPES.HEAVY, delay: 12000 },  // 12 secondes
      { enemyId: 0, type: ATTACK_TYPES.NORMAL, delay: 18000 }  // 18 secondes
    ]
  },
  
  SIMPLE_TEST: {
    name: "Simple Test",
    attacks: [
      { enemyId: 0, type: ATTACK_TYPES.NORMAL, delay: 0 }      // Une seule attaque pour tester
    ]
  }
};

// Round-based sequence selection - COMMENCE PAR LE TEST
export const ROUND_SEQUENCES = {
  1: 'SIMPLE_TEST',
  2: 'TUTORIAL',
  3: 'BASIC_COMBO',
  4: 'MIXED_ASSAULT',
  // Round 5+ uses random selection from all patterns
};

// ============================================================================
// LEVEL & PROGRESSION CONFIGURATION
// ============================================================================

// Difficulty Progression
export const DIFFICULTY_CONFIG = {
  ROUND_SCALING: {
    SPEED_INCREASE_PER_ROUND: 0.05,  // Plus lent
    MAX_SPEED_MULTIPLIER: 1.5,       // Limite plus basse
    DAMAGE_INCREASE_PER_ROUND: 2,
    ENEMY_HEALTH_INCREASE: 10
  },
  
  ENEMY_SCALING: {
    NEW_ENEMY_EVERY_N_ROUNDS: 5,
    MAX_ACTIVE_ENEMIES: 3
  }
};

// ============================================================================
// AUDIO CONFIGURATION (for future use)
// ============================================================================

export const AUDIO_CONFIG = {
  MASTER_VOLUME: 0.7,
  SFX_VOLUME: 0.8,
  MUSIC_VOLUME: 0.5,
  
  SOUNDS: {
    ATTACK_PREPARATION: 'attack_preparation.wav',
    ATTACK_EXECUTION: 'attack_execution.wav',
    PERFECT_HIT: 'perfect_hit.wav',
    GOOD_HIT: 'good_hit.wav',
    MISS: 'miss.wav',
    PLAYER_HEAL: 'player_heal.wav',
    PLAYER_ATTACK: 'player_attack.wav',
    TURN_TRANSITION: 'turn_transition.wav',
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
  
  TURN_INDICATOR: {
    FONT_SIZE: 28,
    POSITION: 'top-center',
    BACKGROUND_OPACITY: 0.8
  },
  
  ACTION_BUTTONS: {
    SIZE: 80,
    MARGIN: 15,
    HEAL_COLOR: '#96ceb4',
    ATTACK_COLOR: '#ff6b6b',
    DEFEND_COLOR: '#45b7d1'
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
  ENABLE_LOGGING: true,  // Activé pour débugger
  LOG_FRAME_COUNT: 120,  // Log moins souvent
  SHOW_FPS: __DEV__ || false,
  SHOW_WIREFRAMES: false,
  ENABLE_STATS: __DEV__ || false,
  LOG_ATTACK_PHASES: true,
  LOG_TURN_CHANGES: true,
  LOG_TIMING: true       // Nouveau: log des timings
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
  SCORE: SCORE_CONFIG
};

export const TIMING = TIMING_CONFIG;
export const BUTTON_CONFIG_LEGACY = BUTTON_CONFIG;