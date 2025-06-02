/**
 * Système de combat gérant les attaques et défenses
 */
export class CombatSystem {
  constructor() {
    this.attackTypes = ['low', 'high', 'special'];
    this.defenseActions = {
      DODGE: 'dodge',
      PARRY: 'parry'
    };
    this.attackDefenseMap = {
      'low': 'dodge',
      'high': 'parry',
      'special': 'dodge'
    };
  }

  /**
   * Génère un type d'attaque aléatoire
   */
  getRandomAttackType() {
    const randomIndex = Math.floor(Math.random() * this.attackTypes.length);
    return this.attackTypes[randomIndex];
  }

  /**
   * Vérifie si l'action du joueur est correcte
   */
  checkPlayerAction(attackType, playerAction) {
    const expectedAction = this.attackDefenseMap[attackType];
    const isCorrect = playerAction === expectedAction;
    
    return {
      isCorrect,
      expectedAction,
      playerAction
    };
  }

  /**
   * Calcule les points selon le résultat
   */
  calculatePoints(isCorrect, combo = 0) {
    if (isCorrect) {
      const basePoints = 10;
      const comboBonus = Math.min(combo * 2, 20);
      return basePoints + comboBonus;
    }
    return -5; // Pénalité pour mauvaise action
  }

  /**
   * Génère un message de résultat
   */
  getResultMessage(isCorrect, attackType, playerAction) {
    if (isCorrect) {
      return this.getSuccessMessage(attackType, playerAction);
    } else {
      return this.getFailureMessage(attackType, playerAction);
    }
  }

  /**
   * Messages de succès
   */
  getSuccessMessage(attackType, playerAction) {
    const messages = {
      'dodge': [
        "Esquive parfaite !",
        "Évité avec style !",
        "Mouvement impeccable !"
      ],
      'parry': [
        "Parade réussie !",
        "Bloqué !",
        "Défense solide !"
      ]
    };
    
    const actionMessages = messages[playerAction] || ["Bien joué !"];
    return actionMessages[Math.floor(Math.random() * actionMessages.length)];
  }

  /**
   * Messages d'échec
   */
  getFailureMessage(attackType, expectedAction) {
    const messages = {
      'dodge': "Il fallait esquiver !",
      'parry': "Il fallait parer !"
    };
    
    return messages[expectedAction] || "Mauvaise défense !";
  }

  /**
   * Obtient l'action attendue pour un type d'attaque
   */
  getExpectedAction(attackType) {
    return this.attackDefenseMap[attackType];
  }

  /**
   * Obtient la couleur associée à un type d'attaque
   */
  getAttackColor(attackType) {
    const colors = {
      'low': 0xff0000,    // Rouge
      'high': 0x0000ff,   // Bleu
      'special': 0xffff00 // Jaune
    };
    
    return colors[attackType] || 0xffffff;
  }
}