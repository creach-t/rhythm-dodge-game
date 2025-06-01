import { 
  TURN_STATES, 
  TIMING_CONFIG,
  DEBUG_CONFIG 
} from '../utils/Constants';

import { attackSequenceService } from './AttackSequenceService';
import { attackPhaseService } from './AttackPhaseService';
import { playerTurnService } from './PlayerTurnService';

/**
 * Gestionnaire de tour principal
 * Responsabilité unique : Orchestration des tours joueur/ennemi
 */
class TurnManagerService {
  constructor() {
    this.currentTurn = TURN_STATES.PLAYER_TURN;
    this.turnNumber = 1;
    this.roundNumber = 1;
    this.isTransitioning = false;
    this.transitionTimeoutId = null;
    this.activeAttacks = new Set();
  }

  /**
   * Démarrer un nouveau round
   * @param {Object} gameState - État du jeu
   * @param {Array} enemies - Liste des ennemis
   * @param {Object} callbacks - Callbacks pour les événements
   */
  startNewRound(gameState, enemies, callbacks = {}) {
    if (this.isTransitioning) {
      console.warn('Already transitioning');
      return false;
    }

    if (DEBUG_CONFIG.LOG_TURN_CHANGES) {
      console.log(`Starting round ${this.roundNumber}`);
    }

    this.turnNumber = 1;
    
    // Commencer par le tour du joueur
    this._transitionTo(TURN_STATES.PLAYER_TURN, gameState, enemies, callbacks);

    return true;
  }

  /**
   * Transition vers un nouvel état de tour
   */
  _transitionTo(newTurnState, gameState, enemies, callbacks) {
    this.isTransitioning = true;
    this.currentTurn = TURN_STATES.TRANSITION;

    if (DEBUG_CONFIG.LOG_TURN_CHANGES) {
      console.log(`Transitioning to ${newTurnState}`);
    }

    // Notifier la transition
    if (callbacks.onTurnTransition) {
      callbacks.onTurnTransition(newTurnState, this.turnNumber, this.roundNumber);
    }

    // Délai de transition pour l'animation
    this.transitionTimeoutId = setTimeout(() => {
      this.isTransitioning = false;
      this.currentTurn = newTurnState;

      switch (newTurnState) {
        case TURN_STATES.PLAYER_TURN:
          this._startPlayerTurn(gameState, enemies, callbacks);
          break;
        case TURN_STATES.ENEMY_TURN:
          this._startEnemyTurn(gameState, enemies, callbacks);
          break;
      }
    }, TIMING_CONFIG.TURN_TRANSITION_DURATION);
  }

  /**
   * Démarrer le tour du joueur
   */
  _startPlayerTurn(gameState, enemies, callbacks) {
    if (DEBUG_CONFIG.LOG_TURN_CHANGES) {
      console.log(`Player turn ${this.turnNumber} started`);
    }

    // Notifier le début du tour joueur
    if (callbacks.onPlayerTurnStart) {
      callbacks.onPlayerTurnStart(this.turnNumber, this.roundNumber);
    }

    // Démarrer le service de tour du joueur
    playerTurnService.startPlayerTurn({
      onActionSelected: (action, target) => {
        if (callbacks.onPlayerActionSelected) {
          callbacks.onPlayerActionSelected(action, target);
        }
      },
      onTurnTimeout: () => {
        console.log('Player turn timed out');
        this._endPlayerTurn(gameState, enemies, callbacks, null);
      }
    });
  }

  /**
   * Confirmer l'action du joueur
   * @param {Object} gameState - État du jeu
   * @param {Array} enemies - Liste des ennemis
   * @param {Object} callbacks - Callbacks
   */
  confirmPlayerAction(gameState, enemies, callbacks) {
    if (this.currentTurn !== TURN_STATES.PLAYER_TURN || !playerTurnService.isTurnActive) {
      console.warn('Cannot confirm action: not player turn');
      return false;
    }

    const result = playerTurnService.executeSelectedAction(gameState, enemies, {
      onActionComplete: (actionResult) => {
        this._endPlayerTurn(gameState, enemies, callbacks, actionResult);
      }
    });

    return result;
  }

  /**
   * Terminer le tour du joueur
   */
  _endPlayerTurn(gameState, enemies, callbacks, actionResult) {
    if (DEBUG_CONFIG.LOG_TURN_CHANGES) {
      console.log('Player turn ended', actionResult);
    }

    // Notifier la fin du tour joueur
    if (callbacks.onPlayerTurnEnd) {
      callbacks.onPlayerTurnEnd(actionResult, this.turnNumber);
    }

    // Passer au tour des ennemis
    this._transitionTo(TURN_STATES.ENEMY_TURN, gameState, enemies, callbacks);
  }

  /**
   * Démarrer le tour des ennemis
   */
  _startEnemyTurn(gameState, enemies, callbacks) {
    if (DEBUG_CONFIG.LOG_TURN_CHANGES) {
      console.log(`Enemy turn ${this.turnNumber} started`);
    }

    // Notifier le début du tour ennemi
    if (callbacks.onEnemyTurnStart) {
      callbacks.onEnemyTurnStart(this.turnNumber, this.roundNumber);
    }

    // Obtenir la séquence d'attaque pour ce round
    const sequenceName = attackSequenceService.getSequenceForRound(this.roundNumber);
    
    // Démarrer la séquence d'attaque
    attackSequenceService.startSequence(sequenceName, {
      onAttackStart: (attack, index, total) => {
        this._handleAttackStart(attack, enemies, callbacks);
      },
      onSequenceComplete: () => {
        this._endEnemyTurn(gameState, enemies, callbacks);
      }
    });
  }

  /**
   * Gérer le début d'une attaque individuelle
   */
  _handleAttackStart(attack, enemies, callbacks) {
    const enemy = enemies[attack.enemyId];
    if (!enemy) {
      console.error(`Enemy not found: ${attack.enemyId}`);
      return;
    }

    const attackId = `${attack.enemyId}_${Date.now()}`;
    this.activeAttacks.add(attackId);

    // Démarrer les phases d'attaque visuelles
    attackPhaseService.startAttack(enemy, attack.type, {
      onPhaseChange: (phase, attackType, enemy) => {
        if (callbacks.onAttackPhaseChange) {
          callbacks.onAttackPhaseChange(phase, attackType, enemy, attack);
        }
      },
      onExecutionPhase: (attackType, enemy) => {
        // C'est le moment où le joueur doit réagir
        if (callbacks.onAttackExecution) {
          callbacks.onAttackExecution(attackType, enemy, attack);
        }
      },
      onComplete: (enemy) => {
        this.activeAttacks.delete(attackId);
        if (callbacks.onAttackComplete) {
          callbacks.onAttackComplete(attack, enemy);
        }
      }
    });
  }

  /**
   * Terminer le tour des ennemis
   */
  _endEnemyTurn(gameState, enemies, callbacks) {
    if (DEBUG_CONFIG.LOG_TURN_CHANGES) {
      console.log('Enemy turn ended');
    }

    // Notifier la fin du tour ennemi
    if (callbacks.onEnemyTurnEnd) {
      callbacks.onEnemyTurnEnd(this.turnNumber);
    }

    // Incrémenter le numéro de tour
    this.turnNumber++;

    // Vérifier si le round est terminé (par exemple, après N tours)
    const isRoundComplete = this._checkRoundComplete(gameState);

    if (isRoundComplete) {
      this._endRound(gameState, enemies, callbacks);
    } else {
      // Passer au tour suivant du joueur
      this._transitionTo(TURN_STATES.PLAYER_TURN, gameState, enemies, callbacks);
    }
  }

  /**
   * Vérifier si le round est terminé
   */
  _checkRoundComplete(gameState) {
    // Pour l'instant, un round = un tour de chaque
    // Peut être étendu selon les besoins du gameplay
    return this.turnNumber > 2; // 1 tour joueur + 1 tour ennemi
  }

  /**
   * Terminer le round actuel
   */
  _endRound(gameState, enemies, callbacks) {
    if (DEBUG_CONFIG.LOG_TURN_CHANGES) {
      console.log(`Round ${this.roundNumber} completed`);
    }

    // Notifier la fin du round
    if (callbacks.onRoundEnd) {
      callbacks.onRoundEnd(this.roundNumber, gameState);
    }

    // Préparer le round suivant
    this.roundNumber++;
    this.turnNumber = 1;

    // Démarrer le round suivant après un délai
    setTimeout(() => {
      if (callbacks.onRoundStart) {
        callbacks.onRoundStart(this.roundNumber);
      }
      this.startNewRound(gameState, enemies, callbacks);
    }, TIMING_CONFIG.ROUND_END_DELAY);
  }

  /**
   * Gérer une action de défense du joueur pendant une attaque
   * @param {string} defenseAction - Action de défense
   * @param {Object} currentAttack - Attaque en cours
   */
  handlePlayerDefense(defenseAction, currentAttack, callbacks) {
    if (this.currentTurn !== TURN_STATES.ENEMY_TURN) {
      console.warn('Defense action not valid: not enemy turn');
      return false;
    }

    // Évaluer la défense (logique à implémenter selon les besoins)
    const defenseResult = this._evaluateDefense(defenseAction, currentAttack);

    if (callbacks.onDefenseResult) {
      callbacks.onDefenseResult(defenseResult, currentAttack);
    }

    return defenseResult;
  }

  /**
   * Évaluer une action de défense
   */
  _evaluateDefense(defenseAction, attack) {
    // Logique d'évaluation basée sur le type d'attaque et l'action de défense
    const expectedDefense = this._getExpectedDefense(attack.type);
    const isCorrect = defenseAction === expectedDefense;

    return {
      action: defenseAction,
      expected: expectedDefense,
      correct: isCorrect,
      attack: attack,
      timing: performance.now() // Pour l'évaluation du timing
    };
  }

  /**
   * Obtenir la défense attendue pour un type d'attaque
   */
  _getExpectedDefense(attackType) {
    switch (attackType) {
      case 'normal':
        return 'dodge';
      case 'heavy':
        return 'parry';
      case 'feint':
        return 'none';
      default:
        return 'none';
    }
  }

  /**
   * Forcer la fin du tour actuel (pour debug ou cas d'urgence)
   */
  forceTurnEnd(gameState, enemies, callbacks) {
    if (this.currentTurn === TURN_STATES.PLAYER_TURN) {
      playerTurnService.cancelTurn();
      this._endPlayerTurn(gameState, enemies, callbacks, null);
    } else if (this.currentTurn === TURN_STATES.ENEMY_TURN) {
      attackSequenceService.cancelCurrentSequence();
      attackPhaseService.cancelAllAttacks();
      this._endEnemyTurn(gameState, enemies, callbacks);
    }
  }

  /**
   * Mettre en pause le système de tours
   */
  pauseTurns() {
    if (this.transitionTimeoutId) {
      clearTimeout(this.transitionTimeoutId);
    }

    if (this.currentTurn === TURN_STATES.PLAYER_TURN) {
      playerTurnService.cancelTurn();
    } else if (this.currentTurn === TURN_STATES.ENEMY_TURN) {
      attackSequenceService.cancelCurrentSequence();
      attackPhaseService.cancelAllAttacks();
    }
  }

  /**
   * Obtenir l'état actuel du tour
   */
  getCurrentTurnInfo() {
    return {
      currentTurn: this.currentTurn,
      turnNumber: this.turnNumber,
      roundNumber: this.roundNumber,
      isTransitioning: this.isTransitioning,
      activeAttacksCount: this.activeAttacks.size,
      playerTurnActive: playerTurnService.isTurnActive,
      enemySequenceActive: attackSequenceService.isActive()
    };
  }

  /**
   * Réinitialiser le gestionnaire de tours
   */
  reset() {
    this.pauseTurns();
    
    this.currentTurn = TURN_STATES.PLAYER_TURN;
    this.turnNumber = 1;
    this.roundNumber = 1;
    this.isTransitioning = false;
    this.activeAttacks.clear();

    if (DEBUG_CONFIG.LOG_TURN_CHANGES) {
      console.log('Turn manager reset');
    }
  }

  /**
   * Nettoyer les ressources
   */
  dispose() {
    this.pauseTurns();
    this.activeAttacks.clear();
    
    // Les services sont des singletons, ils se nettoient eux-mêmes
    playerTurnService.dispose();
    attackSequenceService.dispose();
    attackPhaseService.cancelAllAttacks();
  }

  // Getters utiles
  get isPlayerTurn() {
    return this.currentTurn === TURN_STATES.PLAYER_TURN;
  }

  get isEnemyTurn() {
    return this.currentTurn === TURN_STATES.ENEMY_TURN;
  }

  get currentRound() {
    return this.roundNumber;
  }

  get currentTurnNumber() {
    return this.turnNumber;
  }
}

// Export d'une instance singleton
export const turnManagerService = new TurnManagerService();

// Export de la classe pour les tests
export { TurnManagerService };