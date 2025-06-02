import { ATTACK_TYPES, ENEMY_CONFIG, TIMING_CONFIG } from '../utils/Constants';
import { highlightEnemyAttack, resetEnemyAppearance } from '../systems/EnemySystem';

/**
 * Service de gestion des attaques - FEINTES CORRIGÉES
 * Responsabilité unique : Logique des attaques ennemies et timing
 */
class AttackService {
  constructor() {
    this.isAwaitingAction = false;
    this.currentAttack = null;
    this.attackStartTime = 0;
    this.timeoutId = null;
    this.isFeintActive = false; // Nouveau flag pour les feintes
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
   * Déclencher une attaque - LOGIQUE FEINTE CORRIGÉE
   * @param {number} enemyId - ID de l'ennemi qui attaque
   * @param {string} attackType - Type d'attaque
   * @param {Object} enemy - Objet 3D de l'ennemi
   * @param {Function} onTimeout - Callback en cas de timeout
   */
  triggerAttack(enemyId, attackType, enemy, onTimeout) {
    if (this.isAwaitingAction || this.isFeintActive) {
      console.warn('Attack already in progress');
      return false;
    }

    try {
      this.currentAttack = {
        enemyId,
        type: attackType,
        startTime: performance.now()
      };
      this.attackStartTime = performance.now();

      // CORRECTION FEINTE: Pour les feintes, pas d'attente d'action
      if (attackType === ATTACK_TYPES.FEINT) {
        this.isFeintActive = true;
        this.isAwaitingAction = false;
        console.log(`🎭 Feint started - player should not react`);
        
        // Effet visuel sur l'ennemi
        if (enemy) {
          highlightEnemyAttack(enemy, attackType);
        }

        // Auto-succès après le temps d'exécution (si pas d'action du joueur)
        this.timeoutId = setTimeout(() => {
          if (this.isFeintActive && !this.isAwaitingAction) {
            console.log('✅ Feint successful - player did nothing');
            this.handleFeintSuccess(onTimeout);
          }
        }, TIMING_CONFIG.TOTAL_ACTION_WINDOW);

      } else {
        // Attaques normales et lourdes : attendre une action
        this.isAwaitingAction = true;
        this.isFeintActive = false;
        
        // Effet visuel sur l'ennemi
        if (enemy) {
          highlightEnemyAttack(enemy, attackType);
        }

        // Timeout pour les attaques normales
        this.timeoutId = setTimeout(() => {
          if (this.isAwaitingAction) {
            console.log('Attack timed out');
            this.resetAttack();
            if (onTimeout) {
              onTimeout();
            }
          }
        }, TIMING_CONFIG.TOTAL_ACTION_WINDOW);
      }

      console.log(`Attack triggered: Enemy ${enemyId}, Type: ${attackType}`);
      return true;

    } catch (error) {
      console.error('Error triggering attack:', error);
      this.resetAttack();
      return false;
    }
  }

  /**
   * Gérer le succès d'une feinte (appelé automatiquement)
   */
  handleFeintSuccess(onComplete) {
    console.log('🎭 Feint completed successfully');
    this.resetAttack();
    
    // Simuler un résultat positif pour le succès de feinte
    if (onComplete) {
      // Créer un "faux" timeout qui indique le succès
      setTimeout(() => {
        onComplete('feint_success');
      }, 10);
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
        return 'none'; // Indique qu'aucune action n'est attendue
      default:
        return 'none';
    }
  }

  /**
   * Évaluer le timing d'une action du joueur - CORRECTION FEINTE
   * @param {number} actionTime - Temps de l'action du joueur
   */
  evaluateTiming(actionTime = performance.now()) {
    // CORRECTION FEINTE: Si c'est une feinte et que le joueur agit = ÉCHEC
    if (this.isFeintActive && this.currentAttack?.type === ATTACK_TYPES.FEINT) {
      console.log(`❌ Player reacted to FEINT - should have done nothing!`);
      
      // Arrêter la feinte et marquer comme échec
      this.isFeintActive = false;
      return {
        quality: 'feint_fail',
        timeDiff: actionTime - this.attackStartTime,
        message: 'Ne bougez pas sur les feintes!'
      };
    }

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
   * Vérifier si c'est une feinte et créer le résultat de succès
   */
  evaluateFeintSuccess() {
    if (this.isFeintActive && this.currentAttack?.type === ATTACK_TYPES.FEINT) {
      return {
        quality: 'feint_success',
        timeDiff: 0,
        message: 'Feinte évitée!'
      };
    }
    return null;
  }

  /**
   * Réinitialiser l'état d'attaque
   */
  resetAttack() {
    this.isAwaitingAction = false;
    this.isFeintActive = false;
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
    if (this.isAwaitingAction || this.isFeintActive) {
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

  get isCurrentlyFeint() {
    return this.isFeintActive;
  }

  // Méthodes utilitaires pour le debug
  getDebugInfo() {
    return {
      isAwaitingAction: this.isAwaitingAction,
      isFeintActive: this.isFeintActive,
      currentAttack: this.currentAttack,
      attackDuration: this.attackDuration
    };
  }
}

// Export d'une instance singleton
export const attackService = new AttackService();

// Export de la classe pour les tests ou instances multiples
export { AttackService };