import { getCurrentTime } from '../utils/TimeUtils';

/**
 * Gestionnaire des entrées utilisateur avec timing précis
 */
class InputManager {
  constructor() {
    this.lastInputTime = 0;
    this.inputHistory = [];
    this.maxHistorySize = 10;
    
    // Débounce pour éviter les inputs multiples
    this.debounceDelay = 100; // ms
  }

  /**
   * Enregistre une action utilisateur avec timestamp précis
   */
  recordAction(action, timestamp = null) {
    const actionTime = timestamp || getCurrentTime();
    
    // Vérifier le debounce
    if (actionTime - this.lastInputTime < this.debounceDelay) {
      console.log('Input debounced');
      return false;
    }

    const inputRecord = {
      action,
      timestamp: actionTime,
      deltaTime: this.lastInputTime ? actionTime - this.lastInputTime : 0
    };

    // Ajouter à l'historique
    this.inputHistory.push(inputRecord);
    
    // Maintenir la taille de l'historique
    if (this.inputHistory.length > this.maxHistorySize) {
      this.inputHistory.shift();
    }

    this.lastInputTime = actionTime;
    
    console.log('Input recorded:', inputRecord);
    return true;
  }

  /**
   * Obtient le dernier input
   */
  getLastInput() {
    return this.inputHistory[this.inputHistory.length - 1] || null;
  }

  /**
   * Obtient l'historique des inputs
   */
  getInputHistory() {
    return [...this.inputHistory];
  }

  /**
   * Calcule la fréquence moyenne des inputs
   */
  getAverageInputFrequency() {
    if (this.inputHistory.length < 2) return 0;

    const totalTime = this.inputHistory[this.inputHistory.length - 1].timestamp - 
                     this.inputHistory[0].timestamp;
    
    return (this.inputHistory.length - 1) / (totalTime / 1000); // inputs per second
  }

  /**
   * Détecte les patterns d'input (ex: spam)
   */
  detectSpamming(threshold = 5) {
    if (this.inputHistory.length < 3) return false;
    
    const recentInputs = this.inputHistory.slice(-3);
    const avgDelta = recentInputs.reduce((sum, input) => sum + input.deltaTime, 0) / recentInputs.length;
    
    return avgDelta < (1000 / threshold); // Plus rapide que le seuil
  }

  /**
   * Nettoie l'historique
   */
  clearHistory() {
    this.inputHistory = [];
    this.lastInputTime = 0;
  }

  /**
   * Obtient les statistiques d'input
   */
  getStats() {
    return {
      totalInputs: this.inputHistory.length,
      averageFrequency: this.getAverageInputFrequency(),
      lastInputTime: this.lastInputTime,
      isSpamming: this.detectSpamming()
    };
  }

  /**
   * Mise à jour du gestionnaire (appelée chaque frame)
   */
  update(deltaTime) {
    // Nettoyage périodique des anciens inputs (plus de 10 secondes)
    const currentTime = getCurrentTime();
    const cutoffTime = currentTime - 10000; // 10 secondes
    
    this.inputHistory = this.inputHistory.filter(input => 
      input.timestamp > cutoffTime
    );
  }

  /**
   * Nettoyage des ressources
   */
  destroy() {
    this.clearHistory();
  }
}

export default InputManager;