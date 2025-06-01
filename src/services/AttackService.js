import { ATTACK_TYPES, ENEMY_CONFIG, TIMING_CONFIG } from '../utils/Constants';
import { highlightEnemyAttack, resetEnemyAppearance } from '../systems/EnemySystem';

/**
 * Service de gestion des attaques
 * Responsabilité unique : Logique des attaques ennemies et timing
 */
class AttackService {
  constructor() {
    this.isAwaitingAction = false;
    this.currentAttack = null;
    this.attackStartTime = 0;
    this.timeoutId = null;
  }

  /**
   * Générer un type d'attaque aléatoire
   */
  getRandomAttackType() {
    const types = Object.values(ATTACK_TYPES);
    return types[Math.floor(Math.random() * types.length)];
  }

  /**
   * Générer un ID d'ennemi aléatoire
   */
  getRandomEnemyId() {
    return Math.floor(Math.random() * ENEMY_CONFIG.MAX_COUNT);
  }

  /**
   * Déclencher une attaque
   * @param {number} enemyId - ID de l'ennemi qui attaque
   * @param {string} attackType - Type d'attaque
   * @param {Object} enemy - Objet 3D de l'ennemi
   * @param {Function} onTimeout - Callback en cas de timeout
   */
  triggerAttack(enemyId, attackType, enemy, onTimeout) {
    if (this.isAwaitingAction) {
      console.warn('Attack already in progress');
      return false;
    }

    try {
      this.isAwaitingAction = true;
      this.currentAttack = {
        enemyId,
        type: attackType,
        startTime: performance.now()
      };
      this.attackStartTime = performance.now();

      // Effet visuel sur l'ennemi
      if (enemy) {
        highlightEnemyAttack(enemy, attackType);
      }

      // Timeout automatique
      this.timeoutId = setTimeout(() => {
        if (this.isAwaitingAction) {
          console.log('Attack timed out');
          this.resetAttack();
          if (onTimeout) {
            onTimeout();
          }
        }
      }, TIMING_CONFIG.TOTAL_ACTION_WINDOW);

      console.log(`Attack triggered: Enemy ${enemyId}, Type: ${attackType}`);
      return true;

    } catch (error) {
      console.error('Error triggering attack:', error);
      this.resetAttack();
      return false;
    }
  }

  /**
   * Obtenir l'action attendue pour un type d'attaque
   * @param {string} attackType - Type d'attaque
   */
  getExpectedAction(attackType) {
    switch (attackType) {
      case ATTACK_TYPES.NORMAL:
        return 'dodge';
      case ATTACK_TYPES.HEAVY:
        return 'parry';
      case ATTACK_TYPES.FEINT:
        return 'none';
      default:
        return 'none';
    }
  }

  /**
   * Évaluer le timing d'une action du joueur
   * @param {number} actionTime - Temps de l'action du joueur
   */
  evaluateTiming(actionTime = performance.now()) {
    if (!this.isAwaitingAction || !this.currentAttack) {
      return null;
    }

    const timeDiff = actionTime - this.attackStartTime;

    if (timeDiff <= TIMING_CONFIG.PERFECT_WINDOW) {
      return {
        quality: 'perfect',
        timeDiff,
        message: 'PARFAIT!'
      };
    } else if (timeDiff <= TIMING_CONFIG.GOOD_WINDOW) {
      return {
        quality: 'good',
        timeDiff,
        message: 'Bien!'
      };
    } else {
      return {
        quality: 'miss',
        timeDiff,
        message: 'Trop lent!'
      };
    }
  }

  /**
   * Réinitialiser l'état d'attaque
   */
  resetAttack() {
    this.isAwaitingAction = false;
    this.currentAttack = null;
    this.attackStartTime = 0;

    if (this.timeoutId) {
      clearTimeout(this.timeoutId);
      this.timeoutId = null;
    }
  }

  /**
   * Réinitialiser tous les ennemis visuellement
   * @param {Array} enemies - Liste des ennemis
   */
  resetAllEnemies(enemies) {
    if (!Array.isArray(enemies)) return;
    
    enemies.forEach(enemy => {
      if (enemy) {
        resetEnemyAppearance(enemy);
      }
    });
  }

  /**
   * Déclencher une attaque aléatoire
   * @param {Array} enemies - Liste des ennemis
   * @param {Function} onTimeout - Callback en cas de timeout
   */
  triggerRandomAttack(enemies, onTimeout) {
    if (this.isAwaitingAction) {
      return null;
    }

    const enemyId = this.getRandomEnemyId();
    const attackType = this.getRandomAttackType();
    const enemy = enemies[enemyId];

    const success = this.triggerAttack(enemyId, attackType, enemy, onTimeout);
    
    if (success) {
      return {
        enemyId,
        attackType,
        expectedAction: this.getExpectedAction(attackType)
      };
    }

    return null;
  }

  // Getters
  get awaitingAction() {
    return this.isAwaitingAction;
  }

  get currentAttackInfo() {
    return this.currentAttack;
  }

  get attackDuration() {
    if (!this.currentAttack) return 0;
    return performance.now() - this.attackStartTime;
  }
}

// Export d'une instance singleton
export const attackService = new AttackService();

// Export de la classe pour les tests ou instances multiples
export { AttackService };