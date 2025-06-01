import { SCORE_CONFIG, HEALTH_CONFIG } from '../utils/Constants';

/**
 * Service de gestion des actions du joueur
 * Responsabilité unique : Traitement des actions, scoring, résultats
 */
class PlayerActionService {
  constructor() {
    this.lastActionTime = 0;
    this.actionHistory = [];
    this.maxHistorySize = 10;
  }

  /**
   * Traiter une action du joueur
   * @param {string} playerAction - Action effectuée par le joueur
   * @param {string} expectedAction - Action attendue
   * @param {Object} timingResult - Résultat du timing de l'AttackService
   */
  processAction(playerAction, expectedAction, timingResult) {
    const actionTime = performance.now();
    this.lastActionTime = actionTime;

    // Vérifier si l'action est correcte
    const isCorrectAction = playerAction === expectedAction;

    // Calculer le score et le résultat
    let result = {
      success: false,
      correct: isCorrectAction,
      action: playerAction,
      expected: expectedAction,
      timing: timingResult,
      scoreChange: 0,
      healthChange: 0,
      message: 'Raté!',
      actionTime
    };

    if (isCorrectAction && timingResult) {
      // Action correcte avec bon timing
      result = this._processCorrectAction(result, timingResult);
    } else if (isCorrectAction && !timingResult) {
      // Action correcte mais timing raté
      result = this._processLateAction(result);
    } else {
      // Action incorrecte
      result = this._processWrongAction(result);
    }

    // Ajouter à l'historique
    this._addToHistory(result);

    console.log('Action processed:', result);
    return result;
  }

  /**
   * Traiter une action correcte avec bon timing
   */
  _processCorrectAction(result, timingResult) {
    result.success = true;
    
    switch (timingResult.quality) {
      case 'perfect':
        result.scoreChange = SCORE_CONFIG.PERFECT_HIT;
        result.healthChange = HEALTH_CONFIG.HEALING_PER_PERFECT;
        result.message = 'PARFAIT!';
        break;
        
      case 'good':
        result.scoreChange = SCORE_CONFIG.GOOD_HIT;
        result.message = 'Bien!';
        break;
        
      default:
        result.scoreChange = SCORE_CONFIG.MISS_PENALTY;
        result.message = 'Trop lent!';
        result.success = false;
    }

    return result;
  }

  /**
   * Traiter une action correcte mais en retard
   */
  _processLateAction(result) {
    result.scoreChange = SCORE_CONFIG.MISS_PENALTY;
    result.healthChange = -HEALTH_CONFIG.DAMAGE_ON_MISS;
    result.message = 'Trop lent!';
    result.success = false;
    
    return result;
  }

  /**
   * Traiter une action incorrecte
   */
  _processWrongAction(result) {
    result.scoreChange = SCORE_CONFIG.WRONG_ACTION_PENALTY;
    result.healthChange = -HEALTH_CONFIG.DAMAGE_ON_WRONG_ACTION;
    result.message = 'Mauvaise action!';
    result.success = false;
    
    return result;
  }

  /**
   * Traiter un timeout (aucune action)
   */
  processTimeout() {
    const result = {
      success: false,
      correct: false,
      action: 'timeout',
      expected: 'any',
      timing: null,
      scoreChange: SCORE_CONFIG.MISS_PENALTY,
      healthChange: -HEALTH_CONFIG.DAMAGE_ON_MISS,
      message: 'Trop lent!',
      actionTime: performance.now()
    };

    this._addToHistory(result);
    return result;
  }

  /**
   * Calculer le bonus de combo
   * @param {number} comboCount - Nombre de combos actuels
   * @param {number} baseScore - Score de base
   */
  calculateComboBonus(comboCount, baseScore) {
    if (comboCount <= 1) return baseScore;
    
    const multiplier = Math.pow(SCORE_CONFIG.COMBO_MULTIPLIER, comboCount - 1);
    return Math.round(baseScore * multiplier);
  }

  /**
   * Ajouter une action à l'historique
   */
  _addToHistory(actionResult) {
    this.actionHistory.push(actionResult);
    
    // Limiter la taille de l'historique
    if (this.actionHistory.length > this.maxHistorySize) {
      this.actionHistory.shift();
    }
  }

  /**
   * Obtenir les statistiques de performance
   */
  getPerformanceStats() {
    if (this.actionHistory.length === 0) {
      return {
        totalActions: 0,
        successRate: 0,
        averageScore: 0,
        perfectCount: 0,
        goodCount: 0,
        missCount: 0
      };
    }

    const stats = this.actionHistory.reduce((acc, action) => {
      acc.totalActions++;
      
      if (action.success) {
        acc.successCount++;
        acc.totalScore += action.scoreChange;
      }
      
      if (action.timing?.quality === 'perfect') {
        acc.perfectCount++;
      } else if (action.timing?.quality === 'good') {
        acc.goodCount++;
      } else {
        acc.missCount++;
      }
      
      return acc;
    }, {
      totalActions: 0,
      successCount: 0,
      totalScore: 0,
      perfectCount: 0,
      goodCount: 0,
      missCount: 0
    });

    return {
      totalActions: stats.totalActions,
      successRate: (stats.successCount / stats.totalActions) * 100,
      averageScore: stats.totalScore / stats.totalActions,
      perfectCount: stats.perfectCount,
      goodCount: stats.goodCount,
      missCount: stats.missCount
    };
  }

  /**
   * Obtenir l'historique des actions récentes
   */
  getRecentActions(count = 5) {
    return this.actionHistory.slice(-count);
  }

  /**
   * Réinitialiser l'historique
   */
  resetHistory() {
    this.actionHistory = [];
    this.lastActionTime = 0;
  }

  /**
   * Obtenir le temps écoulé depuis la dernière action
   */
  getTimeSinceLastAction() {
    if (this.lastActionTime === 0) return 0;
    return performance.now() - this.lastActionTime;
  }

  /**
   * Vérifier si le joueur est dans une série de succès
   */
  isOnStreak(minLength = 3) {
    if (this.actionHistory.length < minLength) return false;
    
    const recentActions = this.actionHistory.slice(-minLength);
    return recentActions.every(action => action.success);
  }

  /**
   * Obtenir la longueur de la série actuelle
   */
  getCurrentStreak() {
    let streak = 0;
    
    for (let i = this.actionHistory.length - 1; i >= 0; i--) {
      if (this.actionHistory[i].success) {
        streak++;
      } else {
        break;
      }
    }
    
    return streak;
  }
}

// Export d'une instance singleton
export const playerActionService = new PlayerActionService();

// Export de la classe pour les tests ou instances multiples
export { PlayerActionService };