import { 
  ATTACK_PHASES, 
  ATTACK_TYPES, 
  TIMING_CONFIG, 
  COLORS,
  DEBUG_CONFIG,
  ENEMY_CONFIG 
} from '../utils/Constants';

/**
 * Service de gestion des phases d'attaque - VERSION CORRIGÉE FEINTE
 * Responsabilité unique : Gestion des phases visuelles et timing des attaques
 */
class AttackPhaseService {
  constructor() {
    this.currentPhase = null;
    this.phaseStartTime = 0;
    this.phaseTimeouts = new Map();
    this.attackingEnemies = new Set();
    this.awaitingPlayerResponse = false;
    this.executionStartTime = 0;
    this.currentAttackType = null; // Ajouté pour tracker le type d'attaque
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
    this.currentAttackType = attackType; // Sauvegarder le type

    if (DEBUG_CONFIG.LOG_ATTACK_PHASES) {
      console.log(`🎯 Starting attack: Enemy ${enemyId}, Type: ${attackType}`);
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
   * Phase 1: Préparation de l'attaque - 3 secondes
   */
  _startPreparationPhase(enemy, attackType, callbacks) {
    this.currentPhase = ATTACK_PHASES.PREPARATION;
    this.phaseStartTime = performance.now();

    if (DEBUG_CONFIG.LOG_ATTACK_PHASES) {
      console.log(`⚠️  PREPARATION phase started - ${TIMING_CONFIG.ATTACK_PREPARATION_DURATION}ms`);
    }

    // Effets visuels de préparation
    this._applyPreparationVisuals(enemy, attackType);

    // Notifier le changement de phase
    if (callbacks.onPhaseChange) {
      callbacks.onPhaseChange(ATTACK_PHASES.PREPARATION, attackType, enemy);
    }

    // Programmer la phase d'exécution
    const timeout = setTimeout(() => {
      if (this.attackingEnemies.has(enemy.userData.id)) {
        this._startExecutionPhase(enemy, attackType, callbacks);
      }
    }, TIMING_CONFIG.ATTACK_PREPARATION_DURATION);

    this.phaseTimeouts.set(enemy.userData.id, timeout);
  }

  /**
   * Phase 2: Exécution de l'attaque - LOGIQUE FEINTE CORRIGÉE
   */
  _startExecutionPhase(enemy, attackType, callbacks) {
    this.currentPhase = ATTACK_PHASES.EXECUTION;
    this.phaseStartTime = performance.now();
    this.executionStartTime = performance.now();

    // CORRECTION FEINTE: Pour les feintes, pas besoin d'attendre une réaction
    if (attackType === ATTACK_TYPES.FEINT) {
      this.awaitingPlayerResponse = false;
      if (DEBUG_CONFIG.LOG_ATTACK_PHASES) {
        console.log(`🎭 FEINT execution - no player response needed`);
      }
    } else {
      this.awaitingPlayerResponse = true;
      if (DEBUG_CONFIG.LOG_ATTACK_PHASES) {
        console.log(`⚡ EXECUTION phase started - ${TIMING_CONFIG.ATTACK_EXECUTION_DURATION}ms to react!`);
      }
    }

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
      if (this.attackingEnemies.has(enemy.userData.id)) {
        // CORRECTION FEINTE: Si c'est une feinte et que le joueur n'a pas bougé = SUCCÈS
        if (attackType === ATTACK_TYPES.FEINT && this.awaitingPlayerResponse === false) {
          if (DEBUG_CONFIG.LOG_TIMING) {
            console.log(`✅ Feint successful - player correctly did nothing`);
          }
          // Pas de dégâts pour feinte réussie
        } else if (this.awaitingPlayerResponse) {
          if (DEBUG_CONFIG.LOG_TIMING) {
            console.log(`⏰ Player missed - no reaction in time`);
          }
        }
        this._startRecoveryPhase(enemy, attackType, callbacks);
      }
    }, TIMING_CONFIG.ATTACK_EXECUTION_DURATION);

    this.phaseTimeouts.set(enemy.userData.id, timeout);
  }

  /**
   * Phase 3: Récupération après l'attaque - 1.5 secondes
   */
  _startRecoveryPhase(enemy, attackType, callbacks) {
    this.currentPhase = ATTACK_PHASES.RECOVERY;
    this.phaseStartTime = performance.now();
    this.awaitingPlayerResponse = false;

    if (DEBUG_CONFIG.LOG_ATTACK_PHASES) {
      console.log(`🔄 RECOVERY phase started - ${TIMING_CONFIG.ATTACK_RECOVERY_DURATION}ms`);
    }

    // Effets visuels de récupération
    this._applyRecoveryVisuals(enemy, attackType);

    // Notifier le changement de phase
    if (callbacks.onPhaseChange) {
      callbacks.onPhaseChange(ATTACK_PHASES.RECOVERY, attackType, enemy);
    }

    // Programmer la fin de l'attaque
    const timeout = setTimeout(() => {
      if (this.attackingEnemies.has(enemy.userData.id)) {
        this._completeAttack(enemy, callbacks);
      }
    }, TIMING_CONFIG.ATTACK_RECOVERY_DURATION);

    this.phaseTimeouts.set(enemy.userData.id, timeout);
  }

  /**
   * Terminer l'attaque et nettoyer
   */
  _completeAttack(enemy, callbacks) {
    const enemyId = enemy.userData.id;

    if (DEBUG_CONFIG.LOG_ATTACK_PHASES) {
      console.log(`✅ Attack completed: Enemy ${enemyId}`);
    }

    // Réinitialiser les visuels
    this._resetEnemyVisuals(enemy);

    // Nettoyer les données d'attaque
    this.attackingEnemies.delete(enemyId);
    this.phaseTimeouts.delete(enemyId);

    this.currentPhase = null;
    this.phaseStartTime = 0;
    this.awaitingPlayerResponse = false;
    this.executionStartTime = 0;
    this.currentAttackType = null;

    // Notifier la fin
    if (callbacks.onComplete) {
      callbacks.onComplete(enemy);
    }
  }

  /**
   * Évaluer le timing d'une action du joueur - LOGIQUE FEINTE CORRIGÉE
   * @param {number} actionTime - Temps de l'action du joueur
   */
  evaluatePlayerTiming(actionTime = performance.now()) {
    // CORRECTION FEINTE: Si c'est une feinte, toute action = échec
    if (this.currentAttackType === ATTACK_TYPES.FEINT) {
      if (DEBUG_CONFIG.LOG_TIMING) {
        console.log(`❌ Player reacted to FEINT - should have done nothing!`);
      }
      
      this.awaitingPlayerResponse = false;
      return {
        quality: 'wrong_action',
        timeDiff: 0,
        message: 'Ne bougez pas sur les feintes!',
        success: false,
        isFeintFail: true
      };
    }

    if (!this.awaitingPlayerResponse || this.currentPhase !== ATTACK_PHASES.EXECUTION) {
      if (DEBUG_CONFIG.LOG_TIMING) {
        console.log(`❌ No valid attack to react to (phase: ${this.currentPhase}, awaiting: ${this.awaitingPlayerResponse})`);
      }
      return null;
    }

    const timeDiff = actionTime - this.executionStartTime;

    if (DEBUG_CONFIG.LOG_TIMING) {
      console.log(`⏱️  Player reacted in ${timeDiff}ms (Perfect: <${TIMING_CONFIG.PERFECT_WINDOW}ms, Good: <${TIMING_CONFIG.GOOD_WINDOW}ms)`);
    }

    let result;
    if (timeDiff <= TIMING_CONFIG.PERFECT_WINDOW) {
      result = {
        quality: 'perfect',
        timeDiff,
        message: 'PARFAIT!',
        success: true
      };
    } else if (timeDiff <= TIMING_CONFIG.GOOD_WINDOW) {
      result = {
        quality: 'good',
        timeDiff,
        message: 'Bien!',
        success: true
      };
    } else if (timeDiff <= TIMING_CONFIG.TOTAL_ACTION_WINDOW) {
      result = {
        quality: 'late',
        timeDiff,
        message: 'En retard!',
        success: false
      };
    } else {
      result = {
        quality: 'miss',
        timeDiff,
        message: 'Trop lent!',
        success: false
      };
    }

    // Marquer que le joueur a réagi
    this.awaitingPlayerResponse = false;

    if (DEBUG_CONFIG.LOG_TIMING) {
      console.log(`📊 Timing result:`, result);
    }

    return result;
  }

  /**
   * Évaluer une feinte réussie (appelée quand l'exécution se termine sans action)
   */
  evaluateFeintSuccess() {
    if (this.currentAttackType === ATTACK_TYPES.FEINT && this.currentPhase === ATTACK_PHASES.EXECUTION) {
      if (DEBUG_CONFIG.LOG_TIMING) {
        console.log(`✅ Feint avoided successfully - player did nothing`);
      }
      
      return {
        quality: 'perfect',
        timeDiff: 0,
        message: 'Feinte évitée!',
        success: true,
        isFeintSuccess: true
      };
    }
    
    return null;
  }

  /**
   * Appliquer les effets visuels de préparation - Plus subtils
   */
  _applyPreparationVisuals(enemy, attackType) {
    if (!enemy || !enemy.material) return;

    try {
      // Couleur selon le type d'attaque
      const color = this._getAttackTypeColor(attackType);
      
      // Appliquer les matériaux de préparation - Plus subtils
      enemy.material.color.setHex(color);
      enemy.material.emissive.setHex(color);
      enemy.material.emissiveIntensity = ENEMY_CONFIG.MATERIALS.EMISSIVE_INTENSITY_PREPARATION;

      // Marquer l'ennemi comme en préparation
      enemy.userData.isAttacking = true;
      enemy.userData.attackType = attackType;
      enemy.userData.attackPhase = ATTACK_PHASES.PREPARATION;

      if (DEBUG_CONFIG.LOG_ATTACK_PHASES) {
        console.log(`🎨 Applied preparation visuals: ${attackType} -> color: ${color.toString(16)}`);
      }

    } catch (error) {
      console.error('Error applying preparation visuals:', error);
    }
  }

  /**
   * Appliquer les effets visuels d'exécution - Plus visible mais pas excessif
   */
  _applyExecutionVisuals(enemy, attackType) {
    if (!enemy || !enemy.material) return;

    try {
      // Couleur rouge intense pour l'exécution
      enemy.material.color.setHex(COLORS.ATTACK_EXECUTION);
      enemy.material.emissive.setHex(COLORS.ATTACK_EXECUTION);
      enemy.material.emissiveIntensity = ENEMY_CONFIG.MATERIALS.EMISSIVE_INTENSITY_EXECUTION;

      // Agrandir légèrement l'ennemi
      const scale = ENEMY_CONFIG.ANIMATION.EXECUTION_SCALE;
      enemy.scale.set(scale, scale, scale);

      // Mettre à jour la phase
      enemy.userData.attackPhase = ATTACK_PHASES.EXECUTION;

      if (DEBUG_CONFIG.LOG_ATTACK_PHASES) {
        console.log(`🔥 Applied execution visuals: scale ${scale}, intensity ${ENEMY_CONFIG.MATERIALS.EMISSIVE_INTENSITY_EXECUTION}`);
      }

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

      // Réduire la taille
      enemy.scale.set(1, 1, 1);

      // Mettre à jour la phase
      enemy.userData.attackPhase = ATTACK_PHASES.RECOVERY;

      if (DEBUG_CONFIG.LOG_ATTACK_PHASES) {
        console.log(`🌿 Applied recovery visuals`);
      }

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

      if (DEBUG_CONFIG.LOG_ATTACK_PHASES) {
        console.log(`🔄 Reset enemy visuals to default`);
      }

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
   * Animer les ennemis en fonction de leur phase d'attaque - Animations plus douces
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
   * Animation de la phase de préparation - Plus douce
   */
  _animatePreparation(enemy, time, originalPos) {
    // Pulsation très douce
    const pulseSpeed = ENEMY_CONFIG.ANIMATION.PREPARATION_PULSE_SPEED;
    const amplitude = ENEMY_CONFIG.ANIMATION.PREPARATION_SCALE_AMPLITUDE;
    const pulse = Math.sin(time * pulseSpeed) * amplitude;
    const scale = 1 + pulse;
    
    enemy.scale.set(scale, scale, scale);
    
    // Garder la position d'origine
    enemy.position.copy(originalPos);
  }

  /**
   * Animation de la phase d'exécution - Plus marquée
   */
  _animateExecution(enemy, time, originalPos) {
    // Mouvement vers le centre (attaque) - Plus lent
    const direction = originalPos.clone().negate().normalize();
    const distance = 0.6; // Un peu moins
    const progress = Math.sin(time * 4) * 0.5 + 0.5; // Oscillation plus lente
    
    enemy.position.x = originalPos.x + direction.x * distance * progress;
    enemy.position.z = originalPos.z + direction.z * distance * progress;
  }

  /**
   * Animation de la phase de récupération - Retour progressif
   */
  _animateRecovery(enemy, time, originalPos) {
    // Retour progressif et lent à la position originale
    const fadeSpeed = ENEMY_CONFIG.ANIMATION.RECOVERY_FADE_SPEED;
    const progress = Math.min(1, (time * fadeSpeed) % 2); // Plus lent
    const smoothProgress = progress * 0.05; // Très progressif
    
    enemy.position.x = enemy.position.x + (originalPos.x - enemy.position.x) * smoothProgress;
    enemy.position.z = enemy.position.z + (originalPos.z - enemy.position.z) * smoothProgress;
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
    
    if (DEBUG_CONFIG.LOG_ATTACK_PHASES) {
      console.log(`🚫 Cancelled attack for enemy ${enemyId}`);
    }
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
    this.awaitingPlayerResponse = false;
    this.executionStartTime = 0;
    this.currentAttackType = null;
    
    if (DEBUG_CONFIG.LOG_ATTACK_PHASES) {
      console.log(`🚫 Cancelled all attacks`);
    }
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

  /**
   * Vérifier si le joueur peut actuellement réagir
   */
  canPlayerReact() {
    return this.awaitingPlayerResponse && this.currentPhase === ATTACK_PHASES.EXECUTION;
  }

  /**
   * Obtenir le type d'attaque actuel
   */
  getCurrentAttackType() {
    return this.currentAttackType;
  }

  /**
   * Obtenir des informations de debug
   */
  getDebugInfo() {
    return {
      currentPhase: this.currentPhase,
      currentAttackType: this.currentAttackType,
      attackingEnemies: Array.from(this.attackingEnemies),
      awaitingPlayerResponse: this.awaitingPlayerResponse,
      phaseElapsedTime: this.getPhaseElapsedTime(),
      canPlayerReact: this.canPlayerReact()
    };
  }
}

// Export d'une instance singleton
export const attackPhaseService = new AttackPhaseService();

// Export de la classe pour les tests
export { AttackPhaseService };