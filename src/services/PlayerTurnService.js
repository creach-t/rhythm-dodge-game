import { 
  PLAYER_ACTIONS, 
  PLAYER_CONFIG, 
  TIMING_CONFIG,
  COLORS,
  DEBUG_CONFIG,
  SCORE_CONFIG 
} from '../utils/Constants';

/**
 * Service de gestion du tour du joueur
 * Responsabilité unique : Actions du joueur (heal, attack, defend)
 */
class PlayerTurnService {
  constructor() {
    this.isPlayerTurn = false;
    this.turnStartTime = 0;
    this.turnTimeoutId = null;
    this.selectedAction = null;
    this.selectedTarget = null;
    this.actionInProgress = false;
  }

  /**
   * Démarrer le tour du joueur
   * @param {Function} onActionSelected - Callback appelé quand le joueur choisit une action
   * @param {Function} onTurnTimeout - Callback appelé si le tour expire
   */
  startPlayerTurn({ onActionSelected, onTurnTimeout } = {}) {
    if (this.isPlayerTurn) {
      console.warn('Player turn already active');
      return false;
    }

    this.isPlayerTurn = true;
    this.turnStartTime = performance.now();
    this.selectedAction = null;
    this.selectedTarget = null;
    this.actionInProgress = false;

    if (DEBUG_CONFIG.LOG_TURN_CHANGES) {
      console.log('Player turn started');
    }

    // Programmer le timeout du tour
    this.turnTimeoutId = setTimeout(() => {
      if (this.isPlayerTurn && !this.actionInProgress) {
        console.log('Player turn timed out');
        this._endPlayerTurn();
        
        if (onTurnTimeout) {
          onTurnTimeout();
        }
      }
    }, TIMING_CONFIG.PLAYER_TURN_DURATION);

    return true;
  }

  /**
   * Le joueur choisit une action
   * @param {string} action - Action choisie (HEAL, ATTACK, DEFEND)
   * @param {number} targetId - ID de la cible (pour l'attaque)
   */
  selectAction(action, targetId = null) {
    if (!this.isPlayerTurn || this.actionInProgress) {
      console.warn('Cannot select action: not player turn or action in progress');
      return false;
    }

    if (!Object.values(PLAYER_ACTIONS).includes(action)) {
      console.error(`Invalid action: ${action}`);
      return false;
    }

    // Valider la cible pour l'attaque
    if (action === PLAYER_ACTIONS.ATTACK && targetId === null) {
      console.error('Attack action requires a target');
      return false;
    }

    this.selectedAction = action;
    this.selectedTarget = targetId;

    if (DEBUG_CONFIG.LOG_TURN_CHANGES) {
      console.log(`Player selected action: ${action}`, targetId !== null ? `Target: ${targetId}` : '');
    }

    return true;
  }

  /**
   * Confirmer et exécuter l'action sélectionnée
   * @param {Object} gameState - État actuel du jeu
   * @param {Array} enemies - Liste des ennemis
   * @param {Function} onActionComplete - Callback appelé à la fin de l'action
   */
  executeSelectedAction(gameState, enemies, { onActionComplete } = {}) {
    if (!this.isPlayerTurn || !this.selectedAction || this.actionInProgress) {
      console.warn('Cannot execute action: invalid state');
      return false;
    }

    this.actionInProgress = true;

    if (DEBUG_CONFIG.LOG_TURN_CHANGES) {
      console.log(`Executing action: ${this.selectedAction}`);
    }

    let result = null;

    switch (this.selectedAction) {
      case PLAYER_ACTIONS.HEAL:
        result = this._executeHeal(gameState);
        break;
      case PLAYER_ACTIONS.ATTACK:
        result = this._executeAttack(gameState, enemies);
        break;
      case PLAYER_ACTIONS.DEFEND:
        result = this._executeDefend(gameState);
        break;
      default:
        console.error(`Unknown action: ${this.selectedAction}`);
        this.actionInProgress = false;
        return false;
    }

    // Terminer le tour après l'action
    setTimeout(() => {
      this._endPlayerTurn();
      
      if (onActionComplete) {
        onActionComplete(result);
      }
    }, 1000); // Délai pour l'animation

    return result;
  }

  /**
   * Exécuter l'action de soin
   */
  _executeHeal(gameState) {
    const healAmount = PLAYER_CONFIG.ACTIONS.HEAL_AMOUNT;
    const maxHealth = PLAYER_CONFIG.HEALTH;
    const actualHeal = Math.min(healAmount, maxHealth - gameState.health);

    const result = {
      action: PLAYER_ACTIONS.HEAL,
      success: actualHeal > 0,
      healthChange: actualHeal,
      scoreChange: actualHeal > 0 ? SCORE_CONFIG.HEAL_BONUS : 0,
      message: actualHeal > 0 ? `Soigné: +${actualHeal} PV` : 'Santé déjà au maximum',
      animationType: 'heal'
    };

    if (DEBUG_CONFIG.LOG_TURN_CHANGES) {
      console.log('Heal executed:', result);
    }

    return result;
  }

  /**
   * Exécuter l'action d'attaque
   */
  _executeAttack(gameState, enemies) {
    const targetEnemy = enemies.find(enemy => enemy?.userData?.id === this.selectedTarget);
    
    if (!targetEnemy) {
      return {
        action: PLAYER_ACTIONS.ATTACK,
        success: false,
        healthChange: 0,
        scoreChange: 0,
        message: 'Cible introuvable',
        animationType: 'attack_fail'
      };
    }

    const damage = PLAYER_CONFIG.ACTIONS.ATTACK_DAMAGE;
    const targetHealth = targetEnemy.userData.health || PLAYER_CONFIG.HEALTH;
    const actualDamage = Math.min(damage, targetHealth);

    // Mettre à jour la santé de l'ennemi
    targetEnemy.userData.health = targetHealth - actualDamage;
    const isEnemyDefeated = targetEnemy.userData.health <= 0;

    const result = {
      action: PLAYER_ACTIONS.ATTACK,
      success: true,
      targetId: this.selectedTarget,
      damage: actualDamage,
      enemyDefeated: isEnemyDefeated,
      scoreChange: SCORE_CONFIG.PLAYER_ATTACK_BONUS + (isEnemyDefeated ? 50 : 0),
      message: isEnemyDefeated ? 'Ennemi vaincu!' : `Dégâts: ${actualDamage}`,
      animationType: 'attack_success'
    };

    if (DEBUG_CONFIG.LOG_TURN_CHANGES) {
      console.log('Attack executed:', result);
    }

    return result;
  }

  /**
   * Exécuter l'action de défense
   */
  _executeDefend(gameState) {
    const result = {
      action: PLAYER_ACTIONS.DEFEND,
      success: true,
      defenseBonus: PLAYER_CONFIG.ACTIONS.DEFEND_REDUCTION,
      scoreChange: 10,
      message: 'Position défensive',
      animationType: 'defend'
    };

    if (DEBUG_CONFIG.LOG_TURN_CHANGES) {
      console.log('Defend executed:', result);
    }

    return result;
  }

  /**
   * Terminer le tour du joueur
   */
  _endPlayerTurn() {
    this.isPlayerTurn = false;
    this.actionInProgress = false;
    this.selectedAction = null;
    this.selectedTarget = null;

    if (this.turnTimeoutId) {
      clearTimeout(this.turnTimeoutId);
      this.turnTimeoutId = null;
    }

    if (DEBUG_CONFIG.LOG_TURN_CHANGES) {
      console.log('Player turn ended');
    }
  }

  /**
   * Animer le joueur selon l'action en cours
   * @param {Object} player - Objet 3D du joueur
   * @param {number} time - Temps de l'animation
   */
  animatePlayerAction(player, time) {
    if (!player || !this.actionInProgress) return;

    const action = this.selectedAction;

    switch (action) {
      case PLAYER_ACTIONS.HEAL:
        this._animateHeal(player, time);
        break;
      case PLAYER_ACTIONS.ATTACK:
        this._animateAttack(player, time);
        break;
      case PLAYER_ACTIONS.DEFEND:
        this._animateDefend(player, time);
        break;
    }
  }

  /**
   * Animation de soin
   */
  _animateHeal(player, time) {
    if (!player.material) return;

    // Lueur verte pulsante
    const pulseSpeed = PLAYER_CONFIG.ANIMATION.HEAL_GLOW_INTENSITY;
    const intensity = (Math.sin(time * 4) + 1) * 0.5 * pulseSpeed;
    
    player.material.emissive.setHex(COLORS.PLAYER_HEAL);
    player.material.emissiveIntensity = intensity;
  }

  /**
   * Animation d'attaque
   */
  _animateAttack(player, time) {
    if (!player.material) return;

    // Lueur rouge avec pulsation rapide
    const pulseSpeed = PLAYER_CONFIG.ANIMATION.ATTACK_PULSE_SPEED;
    const intensity = (Math.sin(time * pulseSpeed) + 1) * 0.5;
    
    player.material.emissive.setHex(COLORS.PLAYER_ATTACK);
    player.material.emissiveIntensity = intensity;

    // Légère avancée vers la cible
    const originalPos = player.userData.originalPosition || player.position.clone();
    const moveDistance = Math.sin(time * 8) * 0.3;
    player.position.z = originalPos.z - moveDistance;
  }

  /**
   * Animation de défense
   */
  _animateDefend(player, time) {
    if (!player.material) return;

    // Lueur bleue stable
    player.material.emissive.setHex(COLORS.PLAYER_DEFEND);
    player.material.emissiveIntensity = 0.4;

    // Légère réduction de taille (position défensive)
    const scale = 0.9 + Math.sin(time * 2) * 0.05;
    player.scale.set(scale, scale, scale);
  }

  /**
   * Réinitialiser les visuels du joueur
   * @param {Object} player - Objet 3D du joueur
   */
  resetPlayerVisuals(player) {
    if (!player || !player.material) return;

    try {
      // Restaurer l'apparence originale
      player.material.emissive.setHex(player.userData.originalColor || COLORS.PLAYER);
      player.material.emissiveIntensity = 0.2;
      player.scale.set(1, 1, 1);

      // Restaurer la position
      if (player.userData.originalPosition) {
        player.position.copy(player.userData.originalPosition);
      }
    } catch (error) {
      console.error('Error resetting player visuals:', error);
    }
  }

  /**
   * Obtenir le temps restant pour le tour
   */
  getRemainingTime() {
    if (!this.isPlayerTurn) return 0;
    
    const elapsed = performance.now() - this.turnStartTime;
    const remaining = TIMING_CONFIG.PLAYER_TURN_DURATION - elapsed;
    return Math.max(0, remaining);
  }

  /**
   * Obtenir le progrès du tour (0-1)
   */
  getTurnProgress() {
    if (!this.isPlayerTurn) return 0;
    
    const elapsed = performance.now() - this.turnStartTime;
    return Math.min(1, elapsed / TIMING_CONFIG.PLAYER_TURN_DURATION);
  }

  /**
   * Vérifier si une action est disponible
   * @param {string} action - Action à vérifier
   * @param {Object} gameState - État du jeu
   */
  isActionAvailable(action, gameState) {
    switch (action) {
      case PLAYER_ACTIONS.HEAL:
        return gameState.health < PLAYER_CONFIG.HEALTH;
      case PLAYER_ACTIONS.ATTACK:
        return true; // Toujours disponible si des ennemis existent
      case PLAYER_ACTIONS.DEFEND:
        return true; // Toujours disponible
      default:
        return false;
    }
  }

  /**
   * Annuler le tour en cours
   */
  cancelTurn() {
    if (this.turnTimeoutId) {
      clearTimeout(this.turnTimeoutId);
      this.turnTimeoutId = null;
    }

    this._endPlayerTurn();
  }

  /**
   * Nettoyer les ressources
   */
  dispose() {
    this.cancelTurn();
  }

  // Getters
  get isTurnActive() {
    return this.isPlayerTurn;
  }

  get currentAction() {
    return this.selectedAction;
  }

  get currentTarget() {
    return this.selectedTarget;
  }

  get isActionInProgress() {
    return this.actionInProgress;
  }
}

// Export d'une instance singleton
export const playerTurnService = new PlayerTurnService();

// Export de la classe pour les tests
export { PlayerTurnService };