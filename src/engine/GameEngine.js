import { GAME_CONFIG, ATTACK_TYPES, DEFENSE_ACTIONS, GAME_STATES } from '../utils/Constants';
import { getCurrentTime, Timer, TimingWindow } from '../utils/TimeUtils';
import AttackSequencer from '../systems/AttackSequencer';
import InputManager from './InputManager';
import TimingSystem from './TimingSystem';

/**
 * Moteur principal du jeu - Gère la logique de gameplay, le timing et les interactions
 */
class GameEngine {
  constructor({ scene, camera, renderer, onGameStateChange }) {
    this.scene = scene;
    this.camera = camera;
    this.renderer = renderer;
    this.onGameStateChange = onGameStateChange;

    // État du jeu
    this.gameState = {
      state: GAME_STATES.PLAYING,
      score: 0,
      health: 100,
      combo: 0,
      currentRound: 1
    };

    // Systèmes
    this.inputManager = new InputManager();
    this.timingSystem = new TimingSystem();
    this.attackSequencer = new AttackSequencer();

    // Timer principal
    this.gameTimer = new Timer(0);
    this.lastUpdateTime = getCurrentTime();

    // Combat
    this.currentAttackSequence = null;
    this.awaitingPlayerAction = false;
    this.currentExpectedAction = null;
    this.attackTimer = new Timer(0);

    // Initialisation
    this.initialize();
  }

  initialize() {
    console.log('GameEngine: Initializing...');
    
    // Démarrer le premier round
    this.startNewRound();
    
    // Notifier l'état initial
    this.notifyStateChange();
  }

  startNewRound() {
    console.log(`GameEngine: Starting round ${this.gameState.currentRound}`);
    
    // Générer une nouvelle séquence d'attaques
    this.currentAttackSequence = this.attackSequencer.generateSequence(
      GAME_CONFIG.ENEMIES.MAX_COUNT,
      this.gameState.currentRound
    );
    
    console.log('Generated attack sequence:', this.currentAttackSequence);
    
    // Démarrer la séquence
    this.startAttackSequence();
  }

  startAttackSequence() {
    if (!this.currentAttackSequence || this.currentAttackSequence.attacks.length === 0) {
      this.endRound();
      return;
    }

    // Prendre la première attaque
    const nextAttack = this.currentAttackSequence.attacks.shift();
    console.log('Next attack:', nextAttack);

    // Préparer l'attaque
    this.prepareAttack(nextAttack);
  }

  prepareAttack(attack) {
    // Marquer l'ennemi comme préparant une attaque
    const enemy = this.scene.getObjectByName(`enemy_${attack.enemyId}`);
    if (enemy) {
      enemy.userData.isAttacking = true;
      enemy.userData.attackType = attack.type;
      
      // Effet visuel de préparation (changement de couleur)
      this.highlightEnemy(enemy, attack.type);
    }

    // Configurer le timer d'attaque
    this.attackTimer = new Timer(GAME_CONFIG.TIMING.ATTACK_TELEGRAPH);
    this.attackTimer.start();

    // Définir l'action attendue
    this.currentExpectedAction = this.getExpectedAction(attack.type);
    this.awaitingPlayerAction = true;

    console.log(`Attack prepared: ${attack.type}, expected action: ${this.currentExpectedAction}`);
  }

  highlightEnemy(enemy, attackType) {
    if (!enemy || !enemy.material) return;

    // Couleurs selon le type d'attaque
    let highlightColor;
    switch (attackType) {
      case ATTACK_TYPES.NORMAL:
        highlightColor = 0xffd93d; // Jaune pour esquive
        break;
      case ATTACK_TYPES.HEAVY:
        highlightColor = 0x45b7d1; // Bleu pour parade
        break;
      case ATTACK_TYPES.FEINT:
        highlightColor = 0xff6b6b; // Rouge pour feinte
        break;
      default:
        highlightColor = enemy.userData.originalColor;
    }

    enemy.material.color.setHex(highlightColor);
    enemy.material.emissive.setHex(highlightColor * 0.1);
  }

  resetEnemyVisuals(enemy) {
    if (!enemy || !enemy.material) return;
    
    enemy.material.color.setHex(enemy.userData.originalColor);
    enemy.material.emissive.setHex(0x000000);
    enemy.userData.isAttacking = false;
    enemy.userData.attackType = null;
  }

  getExpectedAction(attackType) {
    switch (attackType) {
      case ATTACK_TYPES.NORMAL:
        return DEFENSE_ACTIONS.DODGE;
      case ATTACK_TYPES.HEAVY:
        return DEFENSE_ACTIONS.PARRY;
      case ATTACK_TYPES.FEINT:
        return DEFENSE_ACTIONS.NONE;
      default:
        return DEFENSE_ACTIONS.NONE;
    }
  }

  handlePlayerAction(action) {
    if (!this.awaitingPlayerAction) {
      console.log('No action expected at this time');
      return;
    }

    console.log(`Player action: ${action}, expected: ${this.currentExpectedAction}`);

    // Évaluer le timing
    const actionTime = getCurrentTime();
    const timingResult = this.timingSystem.evaluateAction(
      this.attackTimer.getElapsed(),
      GAME_CONFIG.TIMING.ATTACK_TELEGRAPH,
      action,
      this.currentExpectedAction
    );

    console.log('Timing result:', timingResult);

    // Appliquer les résultats
    this.applyActionResult(timingResult);

    // Réinitialiser l'état d'attaque
    this.awaitingPlayerAction = false;
    this.currentExpectedAction = null;

    // Continuer vers la prochaine attaque après un délai
    setTimeout(() => {
      this.continueSequence();
    }, 500);
  }

  applyActionResult(result) {
    // Mettre à jour le score
    this.gameState.score += result.scoreChange;

    // Gérer les combos
    if (result.success) {
      this.gameState.combo++;
    } else {
      this.gameState.combo = 0;
      // Réduire la santé en cas d'échec
      this.gameState.health = Math.max(0, this.gameState.health - 10);
    }

    // Vérifier game over
    if (this.gameState.health <= 0) {
      this.gameOver();
      return;
    }

    // Nettoyer les visuels des ennemis
    this.cleanupEnemyVisuals();

    // Notifier les changements
    this.notifyStateChange();
  }

  cleanupEnemyVisuals() {
    for (let i = 0; i < GAME_CONFIG.ENEMIES.MAX_COUNT; i++) {
      const enemy = this.scene.getObjectByName(`enemy_${i}`);
      if (enemy && enemy.userData.isAttacking) {
        this.resetEnemyVisuals(enemy);
      }
    }
  }

  continueSequence() {
    if (this.gameState.state !== GAME_STATES.PLAYING) return;

    // Si il reste des attaques, continuer
    if (this.currentAttackSequence && this.currentAttackSequence.attacks.length > 0) {
      this.startAttackSequence();
    } else {
      // Fin du round
      this.endRound();
    }
  }

  endRound() {
    console.log(`Round ${this.gameState.currentRound} completed`);
    
    // Bonus de fin de round
    const roundBonus = this.gameState.currentRound * 50;
    this.gameState.score += roundBonus;
    
    // Passer au round suivant
    this.gameState.currentRound++;
    
    // Notifier et démarrer le prochain round après un délai
    this.notifyStateChange();
    
    setTimeout(() => {
      if (this.gameState.state === GAME_STATES.PLAYING) {
        this.startNewRound();
      }
    }, 2000);
  }

  gameOver() {
    console.log('Game Over');
    this.gameState.state = GAME_STATES.GAME_OVER;
    this.cleanupEnemyVisuals();
    this.notifyStateChange();
  }

  update() {
    const currentTime = getCurrentTime();
    const deltaTime = (currentTime - this.lastUpdateTime) / 1000;
    this.lastUpdateTime = currentTime;

    // Vérifier les timeouts d'attaque
    if (this.awaitingPlayerAction && this.attackTimer.isFinished()) {
      console.log('Attack timeout - player missed');
      
      // Le joueur a raté l'attaque
      const missResult = {
        success: false,
        quality: 'timeout',
        scoreChange: GAME_CONFIG.SCORE.MISS_PENALTY,
        message: 'Trop lent!'
      };
      
      this.applyActionResult(missResult);
      this.awaitingPlayerAction = false;
      
      setTimeout(() => {
        this.continueSequence();
      }, 500);
    }

    // Mettre à jour les systèmes
    this.inputManager.update(deltaTime);
    this.timingSystem.update(deltaTime);
  }

  notifyStateChange() {
    if (this.onGameStateChange) {
      this.onGameStateChange({ ...this.gameState });
    }
  }

  destroy() {
    console.log('GameEngine: Destroying...');
    
    // Nettoyer les timers
    if (this.gameTimer) this.gameTimer.stop();
    if (this.attackTimer) this.attackTimer.stop();
    
    // Nettoyer les systèmes
    if (this.inputManager) this.inputManager.destroy();
    if (this.timingSystem) this.timingSystem.destroy();
  }
}

export default GameEngine;