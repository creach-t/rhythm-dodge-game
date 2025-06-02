import { GAME_STATES, GAME_CONFIG } from '../utils/Constants';

/**
 * Gère l'état global du jeu
 */
export class StateManager {
  constructor() {
    this.state = {
      gameState: GAME_STATES.PLAYING,
      score: 0,
      health: GAME_CONFIG.PLAYER.HEALTH,
      combo: 0,
      expectedAction: null,
      resultMessage: ''
    };
    this.listeners = [];
  }

  /**
   * Ajoute un listener pour les changements d'état
   */
  addListener(callback) {
    this.listeners.push(callback);
  }

  /**
   * Notifie tous les listeners d'un changement d'état
   */
  notifyListeners() {
    this.listeners.forEach(callback => callback(this.state));
  }

  /**
   * Met à jour l'état du jeu
   */
  updateState(updates) {
    this.state = { ...this.state, ...updates };
    this.notifyListeners();
  }

  /**
   * Réinitialise l'état du jeu
   */
  resetState() {
    this.state = {
      gameState: GAME_STATES.PLAYING,
      score: 0,
      health: GAME_CONFIG.PLAYER.HEALTH,
      combo: 0,
      expectedAction: null,
      resultMessage: ''
    };
    this.notifyListeners();
  }

  /**
   * Obtient l'état actuel
   */
  getState() {
    return this.state;
  }

  /**
   * Met à jour le score et le combo
   */
  updateScore(points) {
    const newScore = Math.max(0, this.state.score + points);
    const newCombo = points > 0 ? this.state.combo + 1 : 0;
    
    this.updateState({
      score: newScore,
      combo: newCombo
    });
  }

  /**
   * Applique des dégâts au joueur
   */
  takeDamage(damage) {
    const newHealth = Math.max(0, this.state.health - damage);
    this.updateState({
      health: newHealth,
      combo: 0
    });
    
    if (newHealth === 0) {
      this.setGameOver();
    }
  }

  /**
   * Définit l'état de game over
   */
  setGameOver() {
    this.updateState({
      gameState: GAME_STATES.GAME_OVER,
      expectedAction: null
    });
  }

  /**
   * Définit l'action attendue
   */
  setExpectedAction(action) {
    this.updateState({ expectedAction: action });
  }

  /**
   * Définit le message de résultat
   */
  setResultMessage(message) {
    this.updateState({ resultMessage: message });
  }

  /**
   * Vérifie si le jeu est en cours
   */
  isPlaying() {
    return this.state.gameState === GAME_STATES.PLAYING;
  }
}