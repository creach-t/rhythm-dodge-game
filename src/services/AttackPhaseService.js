import { 
  ATTACK_PHASES, 
  ATTACK_TYPES, 
  TIMING_CONFIG, 
  COLORS,
  DEBUG_CONFIG,
  ENEMY_CONFIG 
} from '../utils/Constants';

/**
 * Service de gestion des phases d'attaque
 * Responsabilité unique : Gestion des phases visuelles et timing des attaques
 */
class AttackPhaseService {
  constructor() {
    this.currentPhase = null;
    this.phaseStartTime = 0;
    this.phaseTimeouts = new Map();
    this.attackingEnemies = new Set();
  }

  /**
   * Démarrer une attaque avec toutes ses phases
   * @param {Object} enemy - Objet 3D de l'ennemi
   * @param {string} attackType - Type d'attaque
   * @param {Function} onPhaseChange - Callback appelé à chaque changement de phase
   * @param {Function} onExecutionPhase - Callback appelé pendant la phase d'exécution
   * @param {Function} onComplete - Callback appelé à la fin de l'attaque
   */
  startAttack(enemy, attackType, { onPhaseChange, onExecutionPhase, onComplete } = {}) {
    if (!enemy || this.attackingEnemies.has(enemy.userData.id)) {
      console.warn('Enemy already attacking or invalid enemy');
      return false;
    }

    const enemyId = enemy.userData.id;
    this.attackingEnemies.add(enemyId);

    if (DEBUG_CONFIG.LOG_ATTACK_PHASES) {
      console.log(`Starting attack: Enemy ${enemyId}, Type: ${attackType}`);
    }

    // Phase 1: Preparation
    this._startPreparationPhase(enemy, attackType, {
      onPhaseChange,
      onExecutionPhase,
      onComplete
    });

    return true;
  }

  /**
   * Phase 1: Préparation de l'attaque
   */
  _startPreparationPhase(enemy, attackType, callbacks) {
    this.currentPhase = ATTACK_PHASES.PREPARATION;
    this.phaseStartTime = performance.now();

    // Effets visuels de préparation
    this._applyPreparationVisuals(enemy, attackType);

    // Notifier le changement de phase
    if (callbacks.onPhaseChange) {
      callbacks.onPhaseChange(ATTACK_PHASES.PREPARATION, attackType, enemy);
    }

    // Programmer la phase d'exécution
    const timeout = setTimeout(() => {
      this._startExecutionPhase(enemy, attackType, callbacks);
    }, TIMING_CONFIG.ATTACK_PREPARATION_DURATION);

    this.phaseTimeouts.set(enemy.userData.id, timeout);
  }

  /**
   * Phase 2: Exécution de l'attaque
   */
  _startExecutionPhase(enemy, attackType, callbacks) {
    this.currentPhase = ATTACK_PHASES.EXECUTION;
    this.phaseStartTime = performance.now();

    // Effets visuels d'exécution
    this._applyExecutionVisuals(enemy, attackType);

    // Notifier le changement de phase et déclencher l'action
    if (callbacks.onPhaseChange) {
      callbacks.onPhaseChange(ATTACK_PHASES.EXECUTION, attackType, enemy);
    }

    if (callbacks.onExecutionPhase) {
      callbacks.onExecutionPhase(attackType, enemy);
    }

    // Programmer la phase de récupération
    const timeout = setTimeout(() => {
      this._startRecoveryPhase(enemy, attackType, callbacks);
    }, TIMING_CONFIG.ATTACK_EXECUTION_DURATION);

    this.phaseTimeouts.set(enemy.userData.id, timeout);
  }

  /**
   * Phase 3: Récupération après l'attaque
   */
  _startRecoveryPhase(enemy, attackType, callbacks) {
    this.currentPhase = ATTACK_PHASES.RECOVERY;
    this.phaseStartTime = performance.now();

    // Effets visuels de récupération
    this._applyRecoveryVisuals(enemy, attackType);

    // Notifier le changement de phase
    if (callbacks.onPhaseChange) {
      callbacks.onPhaseChange(ATTACK_PHASES.RECOVERY, attackType, enemy);
    }

    // Programmer la fin de l'attaque
    const timeout = setTimeout(() => {
      this._completeAttack(enemy, callbacks);
    }, TIMING_CONFIG.ATTACK_RECOVERY_DURATION);

    this.phaseTimeouts.set(enemy.userData.id, timeout);
  }

  /**
   * Terminer l'attaque et nettoyer
   */
  _completeAttack(enemy, callbacks) {
    const enemyId = enemy.userData.id;

    // Réinitialiser les visuels
    this._resetEnemyVisuals(enemy);

    // Nettoyer les données d'attaque
    this.attackingEnemies.delete(enemyId);
    this.phaseTimeouts.delete(enemyId);

    this.currentPhase = null;
    this.phaseStartTime = 0;

    if (DEBUG_CONFIG.LOG_ATTACK_PHASES) {
      console.log(`Attack completed: Enemy ${enemyId}`);
    }

    // Notifier la fin
    if (callbacks.onComplete) {
      callbacks.onComplete(enemy);
    }
  }

  /**
   * Appliquer les effets visuels de préparation
   */
  _applyPreparationVisuals(enemy, attackType) {
    if (!enemy || !enemy.material) return;

    try {
      // Couleur selon le type d'attaque
      const color = this._getAttackTypeColor(attackType);
      
      // Appliquer les matériaux de préparation
      enemy.material.color.setHex(color);
      enemy.material.emissive.setHex(color);
      enemy.material.emissiveIntensity = ENEMY_CONFIG.MATERIALS.EMISSIVE_INTENSITY_PREPARATION;

      // Marquer l'ennemi comme en préparation
      enemy.userData.isAttacking = true;
      enemy.userData.attackType = attackType;
      enemy.userData.attackPhase = ATTACK_PHASES.PREPARATION;

    } catch (error) {
      console.error('Error applying preparation visuals:', error);
    }
  }

  /**
   * Appliquer les effets visuels d'exécution
   */
  _applyExecutionVisuals(enemy, attackType) {
    if (!enemy || !enemy.material) return;

    try {
      // Couleur rouge intense pour l'exécution
      enemy.material.color.setHex(COLORS.ATTACK_EXECUTION);
      enemy.material.emissive.setHex(COLORS.ATTACK_EXECUTION);
      enemy.material.emissiveIntensity = ENEMY_CONFIG.MATERIALS.EMISSIVE_INTENSITY_EXECUTION;

      // Agrandir l'ennemi
      const scale = ENEMY_CONFIG.ANIMATION.EXECUTION_SCALE;
      enemy.scale.set(scale, scale, scale);

      // Mettre à jour la phase
      enemy.userData.attackPhase = ATTACK_PHASES.EXECUTION;

    } catch (error) {
      console.error('Error applying execution visuals:', error);
    }
  }

  /**
   * Appliquer les effets visuels de récupération
   */
  _applyRecoveryVisuals(enemy, attackType) {
    if (!enemy || !enemy.material) return;

    try {
      // Couleur verte douce pour la récupération
      enemy.material.color.setHex(COLORS.ATTACK_RECOVERY);
      enemy.material.emissive.setHex(COLORS.ATTACK_RECOVERY);
      enemy.material.emissiveIntensity = ENEMY_CONFIG.MATERIALS.EMISSIVE_INTENSITY_RECOVERY;

      // Réduire légèrement la taille
      enemy.scale.set(1, 1, 1);

      // Mettre à jour la phase
      enemy.userData.attackPhase = ATTACK_PHASES.RECOVERY;

    } catch (error) {
      console.error('Error applying recovery visuals:', error);
    }
  }

  /**
   * Réinitialiser les visuels de l'ennemi
   */
  _resetEnemyVisuals(enemy) {
    if (!enemy || !enemy.material) return;

    try {
      // Restaurer l'apparence originale
      enemy.material.color.setHex(enemy.userData.originalColor);
      enemy.material.emissive.setHex(enemy.userData.originalColor);
      enemy.material.emissiveIntensity = ENEMY_CONFIG.MATERIALS.EMISSIVE_INTENSITY_DEFAULT;

      // Réinitialiser la taille
      enemy.scale.set(1, 1, 1);

      // Nettoyer les données d'attaque
      enemy.userData.isAttacking = false;
      enemy.userData.attackType = null;
      enemy.userData.attackPhase = null;

    } catch (error) {
      console.error('Error resetting enemy visuals:', error);
    }
  }

  /**
   * Obtenir la couleur selon le type d'attaque
   */
  _getAttackTypeColor(attackType) {
    switch (attackType) {
      case ATTACK_TYPES.NORMAL:
        return COLORS.ATTACK_NORMAL;
      case ATTACK_TYPES.HEAVY:
        return COLORS.ATTACK_HEAVY;
      case ATTACK_TYPES.FEINT:
        return COLORS.ATTACK_FEINT;
      default:
        return COLORS.ENEMY_DEFAULT;
    }
  }

  /**
   * Animer les ennemis en fonction de leur phase d'attaque
   * @param {Array} enemies - Liste des ennemis
   * @param {number} time - Temps de l'animation
   */
  animateAttackingEnemies(enemies, time) {
    enemies.forEach(enemy => {
      if (!enemy || !enemy.userData.isAttacking) return;

      const phase = enemy.userData.attackPhase;
      const originalPos = enemy.userData.originalPosition;

      switch (phase) {
        case ATTACK_PHASES.PREPARATION:
          this._animatePreparation(enemy, time, originalPos);
          break;
        case ATTACK_PHASES.EXECUTION:
          this._animateExecution(enemy, time, originalPos);
          break;
        case ATTACK_PHASES.RECOVERY:
          this._animateRecovery(enemy, time, originalPos);
          break;
      }
    });
  }

  /**
   * Animation de la phase de préparation
   */
  _animatePreparation(enemy, time, originalPos) {
    // Pulsation douce
    const pulseSpeed = ENEMY_CONFIG.ANIMATION.PREPARATION_PULSE_SPEED;
    const amplitude = ENEMY_CONFIG.ANIMATION.PREPARATION_SCALE_AMPLITUDE;
    const pulse = Math.sin(time * pulseSpeed) * amplitude;
    const scale = 1 + pulse;
    
    enemy.scale.set(scale, scale, scale);
  }

  /**
   * Animation de la phase d'exécution
   */
  _animateExecution(enemy, time, originalPos) {
    // Mouvement vers le centre (attaque)
    const direction = originalPos.clone().negate().normalize();
    const distance = 0.8;
    
    enemy.position.x = originalPos.x + direction.x * distance;
    enemy.position.z = originalPos.z + direction.z * distance;
  }

  /**
   * Animation de la phase de récupération
   */
  _animateRecovery(enemy, time, originalPos) {
    // Retour progressif à la position originale
    const fadeSpeed = ENEMY_CONFIG.ANIMATION.RECOVERY_FADE_SPEED;
    const progress = Math.min(1, (time * fadeSpeed) % 1);
    
    enemy.position.x = enemy.position.x + (originalPos.x - enemy.position.x) * progress * 0.1;
    enemy.position.z = enemy.position.z + (originalPos.z - enemy.position.z) * progress * 0.1;
  }

  /**
   * Annuler une attaque en cours
   */
  cancelAttack(enemyId) {
    if (this.phaseTimeouts.has(enemyId)) {
      clearTimeout(this.phaseTimeouts.get(enemyId));
      this.phaseTimeouts.delete(enemyId);
    }
    
    this.attackingEnemies.delete(enemyId);
  }

  /**
   * Annuler toutes les attaques en cours
   */
  cancelAllAttacks() {
    this.phaseTimeouts.forEach((timeout, enemyId) => {
      clearTimeout(timeout);
    });
    
    this.phaseTimeouts.clear();
    this.attackingEnemies.clear();
    this.currentPhase = null;
    this.phaseStartTime = 0;
  }

  /**
   * Vérifier si un ennemi est en train d'attaquer
   */
  isEnemyAttacking(enemyId) {
    return this.attackingEnemies.has(enemyId);
  }

  /**
   * Obtenir la phase actuelle d'un ennemi
   */
  getEnemyPhase(enemy) {
    return enemy?.userData?.attackPhase || null;
  }

  /**
   * Obtenir le temps écoulé dans la phase actuelle
   */
  getPhaseElapsedTime() {
    if (!this.currentPhase) return 0;
    return performance.now() - this.phaseStartTime;
  }
}

// Export d'une instance singleton
export const attackPhaseService = new AttackPhaseService();

// Export de la classe pour les tests
export { AttackPhaseService };