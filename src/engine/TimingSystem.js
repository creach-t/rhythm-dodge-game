import { GAME_CONFIG, DEFENSE_ACTIONS } from '../utils/Constants';
import { TimingWindow } from '../utils/TimeUtils';

/**
 * Système de timing pour évaluer la précision des actions du joueur
 */
class TimingSystem {
  constructor() {
    this.timingWindow = new TimingWindow(
      GAME_CONFIG.TIMING.PERFECT_WINDOW,
      GAME_CONFIG.TIMING.GOOD_WINDOW
    );
    
    this.actionHistory = [];
    this.maxHistorySize = 50;
  }

  /**
   * Évalue une action du joueur par rapport au timing attendu
   */
  evaluateAction(actionTime, targetTime, playerAction, expectedAction) {
    const timingResult = this.timingWindow.evaluateTiming(targetTime, actionTime);
    
    // Vérifier si l'action est correcte
    const actionCorrect = this.isActionCorrect(playerAction, expectedAction);
    
    // Calculer le score final
    let finalScore = 0;
    let success = false;
    let message = '';

    if (!actionCorrect) {
      // Mauvaise action
      finalScore = GAME_CONFIG.SCORE.WRONG_ACTION_PENALTY;
      message = 'Mauvaise action!';
    } else if (expectedAction === DEFENSE_ACTIONS.NONE) {
      // Action correcte pour une feinte (ne rien faire)
      if (playerAction === DEFENSE_ACTIONS.NONE) {
        finalScore = GAME_CONFIG.SCORE.PERFECT_HIT;
        success = true;
        message = 'Parfait! Feinte évitée';
      } else {
        finalScore = GAME_CONFIG.SCORE.WRONG_ACTION_PENALTY;
        message = 'Ne pas bouger sur une feinte!';
      }
    } else {
      // Action correcte, évaluer le timing
      switch (timingResult.quality) {
        case 'perfect':
          finalScore = GAME_CONFIG.SCORE.PERFECT_HIT;
          success = true;
          message = 'PARFAIT!';
          break;
        case 'good':
          finalScore = GAME_CONFIG.SCORE.GOOD_HIT;
          success = true;
          message = 'Bien!';
          break;
        case 'miss':
          finalScore = GAME_CONFIG.SCORE.MISS_PENALTY;
          message = 'Trop lent!';
          break;
      }
    }

    const result = {
      success,
      quality: timingResult.quality,
      scoreChange: finalScore,
      timingDiff: timingResult.diff,
      actionCorrect,
      message,
      timestamp: Date.now()
    };

    // Enregistrer dans l'historique
    this.recordActionResult(result);

    return result;
  }

  /**
   * Vérifie si l'action du joueur correspond à l'action attendue
   */
  isActionCorrect(playerAction, expectedAction) {
    return playerAction === expectedAction;
  }

  /**
   * Enregistre le résultat d'une action dans l'historique
   */
  recordActionResult(result) {
    this.actionHistory.push(result);
    
    // Maintenir la taille de l'historique
    if (this.actionHistory.length > this.maxHistorySize) {
      this.actionHistory.shift();
    }
  }

  /**
   * Calcule les statistiques de performance
   */
  getPerformanceStats() {
    if (this.actionHistory.length === 0) {
      return {
        totalActions: 0,
        successRate: 0,
        averageScore: 0,
        perfectHits: 0,
        goodHits: 0,
        misses: 0
      };
    }

    const totalActions = this.actionHistory.length;
    const successfulActions = this.actionHistory.filter(r => r.success).length;
    const perfectHits = this.actionHistory.filter(r => r.quality === 'perfect').length;
    const goodHits = this.actionHistory.filter(r => r.quality === 'good').length;
    const misses = this.actionHistory.filter(r => !r.success).length;
    
    const totalScore = this.actionHistory.reduce((sum, r) => sum + r.scoreChange, 0);
    
    return {
      totalActions,
      successRate: (successfulActions / totalActions) * 100,
      averageScore: totalScore / totalActions,
      perfectHits,
      goodHits,
      misses,
      accuracy: {
        perfect: (perfectHits / totalActions) * 100,
        good: (goodHits / totalActions) * 100,
        miss: (misses / totalActions) * 100
      }
    };
  }

  /**
   * Obtient la tendance de performance récente
   */
  getRecentPerformance(lastN = 10) {
    const recentActions = this.actionHistory.slice(-lastN);
    
    if (recentActions.length === 0) return null;
    
    const successRate = (recentActions.filter(r => r.success).length / recentActions.length) * 100;
    const averageScore = recentActions.reduce((sum, r) => sum + r.scoreChange, 0) / recentActions.length;
    
    return {
      successRate,
      averageScore,
      trend: this.calculateTrend(recentActions)
    };
  }

  /**
   * Calcule la tendance de performance (amélioration/dégradation)
   */
  calculateTrend(actions) {
    if (actions.length < 2) return 'stable';
    
    const firstHalf = actions.slice(0, Math.floor(actions.length / 2));
    const secondHalf = actions.slice(Math.floor(actions.length / 2));
    
    const firstHalfAvg = firstHalf.reduce((sum, r) => sum + r.scoreChange, 0) / firstHalf.length;
    const secondHalfAvg = secondHalf.reduce((sum, r) => sum + r.scoreChange, 0) / secondHalf.length;
    
    const difference = secondHalfAvg - firstHalfAvg;
    
    if (difference > 10) return 'improving';
    if (difference < -10) return 'declining';
    return 'stable';
  }

  /**
   * Obtient des conseils basés sur la performance
   */
  getPerformanceFeedback() {
    const stats = this.getPerformanceStats();
    const recent = this.getRecentPerformance();
    
    if (stats.totalActions < 5) {
      return 'Continue à jouer pour obtenir des statistiques!';
    }
    
    if (stats.successRate >= 90) {
      return 'Excellent! Vous maîtrisez parfaitement le timing!';
    } else if (stats.successRate >= 70) {
      return 'Bon travail! Essayez d\'être plus précis dans le timing.';
    } else if (stats.successRate >= 50) {
      return 'Pas mal! Concentrez-vous sur le rythme des attaques.';
    } else {
      return 'Prenez votre temps et observez bien les signaux visuels.';
    }
  }

  /**
   * Réinitialise les statistiques
   */
  reset() {
    this.actionHistory = [];
  }

  /**
   * Mise à jour du système (appelée chaque frame)
   */
  update(deltaTime) {
    // Nettoyage périodique des anciennes actions (plus de 5 minutes)
    const currentTime = Date.now();
    const cutoffTime = currentTime - 300000; // 5 minutes
    
    this.actionHistory = this.actionHistory.filter(action => 
      action.timestamp > cutoffTime
    );
  }

  /**
   * Nettoyage des ressources
   */
  destroy() {
    this.reset();
  }
}

export default TimingSystem;