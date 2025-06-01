import { GAME_CONFIG, ATTACK_TYPES, DEFENSE_ACTIONS, GAME_STATES } from '../utils/Constants';
import { getCurrentTime } from '../utils/TimeUtils';
import AttackSequencer from '../systems/AttackSequencer';

/**
 * Moteur principal du jeu - Version simplifiée pour éviter les erreurs d'import
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

    // Systèmes simplifiés
    this.attackSequencer = new AttackSequencer();
    this.lastUpdateTime = getCurrentTime();

    // Combat
    this.currentAttackSequence = null;
    this.awaitingPlayerAction = false;
    this.currentExpectedAction = null;
    this.attackStartTime = 0;
    this.attackDuration = GAME_CONFIG.TIMING.ATTACK_TELEGRAPH;

    // Initialisation
    this.initialize();
  }

  initialize() {
    console.log('GameEngine: Initializing...');
    
    // Démarrer le premier round après un délai
    setTimeout(() => {
      this.startNewRound();
    }, 1000);
    
    // Notifier l'état initial
    this.notifyStateChange();
  }

  startNewRound() {
    console.log(`GameEngine: Starting round ${this.gameState.currentRound}`);
    
    try {
      // Générer une nouvelle séquence d'attaques
      this.currentAttackSequence = this.attackSequencer.generateSequence(
        GAME_CONFIG.ENEMIES.MAX_COUNT,
        this.gameState.currentRound
      );
      
      console.log('Generated attack sequence:', this.currentAttackSequence);
      
      // Démarrer la séquence
      setTimeout(() => {
        this.startAttackSequence();
      }, 500);
    } catch (error) {
      console.error('Error starting new round:', error);
    }
  }

  startAttackSequence() {
    if (!this.currentAttackSequence || this.currentAttackSequence.attacks.length === 0) {
      this.endRound();
      return;
    }

    try {
      // Prendre la première attaque
      const nextAttack = this.currentAttackSequence.attacks.shift();
      console.log('Next attack:', nextAttack);

      // Préparer l'attaque
      this.prepareAttack(nextAttack);
    } catch (error) {
      console.error('Error starting attack sequence:', error);
    }
  }

  prepareAttack(attack) {
    try {
      // Marquer l'ennemi comme préparant une attaque
      const enemy = this.scene.getObjectByName(`enemy_${attack.enemyId}`);
      if (enemy) {
        enemy.userData.isAttacking = true;
        enemy.userData.attackType = attack.type;
        
        // Effet visuel de préparation (changement de couleur)
        this.highlightEnemy(enemy, attack.type);
      }

      // Configurer le timing d'attaque
      this.attackStartTime = getCurrentTime();
      this.awaitingPlayerAction = true;

      // Définir l'action attendue
      this.currentExpectedAction = this.getExpectedAction(attack.type);

      console.log(`Attack prepared: ${attack.type}, expected action: ${this.currentExpectedAction}`);
    } catch (error) {
      console.error('Error preparing attack:', error);
    }
  }

  highlightEnemy(enemy, attackType) {
    if (!enemy || !enemy.material) return;

    try {
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
      
      // Ajouter un effet emissive si supporté
      if (enemy.material.emissive) {
        enemy.material.emissive.setHex(highlightColor * 0.1);
      }
    } catch (error) {
      console.error('Error highlighting enemy:', error);
    }
  }

  resetEnemyVisuals(enemy) {
    if (!enemy || !enemy.material) return;
    
    try {
      enemy.material.color.setHex(enemy.userData.originalColor);
      if (enemy.material.emissive) {
        enemy.material.emissive.setHex(0x000000);
      }
      enemy.userData.isAttacking = false;
      enemy.userData.attackType = null;
    } catch (error) {
      console.error('Error resetting enemy visuals:', error);
    }
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

    try {
      // Évaluer le timing simple
      const actionTime = getCurrentTime();
      const timeDiff = actionTime - this.attackStartTime;
      const isCorrectAction = action === this.currentExpectedAction;
      
      let result = {
        success: false,
        quality: 'miss',
        scoreChange: GAME_CONFIG.SCORE.MISS_PENALTY,
        message: 'Raté!'
      };

      if (isCorrectAction) {
        if (timeDiff <= GAME_CONFIG.TIMING.PERFECT_WINDOW) {
          result = {
            success: true,
            quality: 'perfect',
            scoreChange: GAME_CONFIG.SCORE.PERFECT_HIT,
            message: 'PARFAIT!'
          };
        } else if (timeDiff <= GAME_CONFIG.TIMING.GOOD_WINDOW) {
          result = {
            success: true,
            quality: 'good',
            scoreChange: GAME_CONFIG.SCORE.GOOD_HIT,
            message: 'Bien!'
          };
        }
      } else {
        result.scoreChange = GAME_CONFIG.SCORE.WRONG_ACTION_PENALTY;
        result.message = 'Mauvaise action!';
      }

      console.log('Action result:', result);

      // Appliquer les résultats
      this.applyActionResult(result);

      // Réinitialiser l'état d'attaque
      this.awaitingPlayerAction = false;
      this.currentExpectedAction = null;

      // Continuer vers la prochaine attaque après un délai
      setTimeout(() => {
        this.continueSequence();
      }, 800);
    } catch (error) {
      console.error('Error handling player action:', error);
    }
  }

  applyActionResult(result) {
    try {
      // Mettre à jour le score
      this.gameState.score = Math.max(0, this.gameState.score + result.scoreChange);

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
    } catch (error) {
      console.error('Error applying action result:', error);
    }
  }

  cleanupEnemyVisuals() {
    try {
      for (let i = 0; i < GAME_CONFIG.ENEMIES.MAX_COUNT; i++) {
        const enemy = this.scene.getObjectByName(`enemy_${i}`);
        if (enemy && enemy.userData.isAttacking) {
          this.resetEnemyVisuals(enemy);
        }
      }
    } catch (error) {
      console.error('Error cleaning up enemy visuals:', error);
    }
  }

  continueSequence() {
    if (this.gameState.state !== GAME_STATES.PLAYING) return;

    try {
      // Si il reste des attaques, continuer
      if (this.currentAttackSequence && this.currentAttackSequence.attacks.length > 0) {
        setTimeout(() => {
          this.startAttackSequence();
        }, 500);
      } else {
        // Fin du round
        this.endRound();
      }
    } catch (error) {
      console.error('Error continuing sequence:', error);
    }
  }

  endRound() {
    console.log(`Round ${this.gameState.currentRound} completed`);
    
    try {
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
    } catch (error) {
      console.error('Error ending round:', error);
    }
  }

  gameOver() {
    console.log('Game Over');
    try {
      this.gameState.state = GAME_STATES.GAME_OVER;
      this.cleanupEnemyVisuals();
      this.notifyStateChange();
    } catch (error) {
      console.error('Error in game over:', error);
    }
  }

  update() {
    try {
      const currentTime = getCurrentTime();
      
      // Vérifier les timeouts d'attaque
      if (this.awaitingPlayerAction) {
        const timeSinceAttack = currentTime - this.attackStartTime;
        
        if (timeSinceAttack > this.attackDuration + GAME_CONFIG.TIMING.GOOD_WINDOW) {
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
      }

      this.lastUpdateTime = currentTime;
    } catch (error) {
      console.error('Error in update:', error);
    }
  }

  notifyStateChange() {
    try {
      if (this.onGameStateChange) {
        this.onGameStateChange({ ...this.gameState });
      }
    } catch (error) {
      console.error('Error notifying state change:', error);
    }
  }

  destroy() {
    console.log('GameEngine: Destroying...');
    try {
      // Réinitialiser l'état
      this.awaitingPlayerAction = false;
      this.currentAttackSequence = null;
    } catch (error) {
      console.error('Error destroying game engine:', error);
    }
  }
}

export default GameEngine;