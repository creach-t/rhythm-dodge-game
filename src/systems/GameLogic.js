import { DEFENSE_ACTIONS } from './EnemySystem';

export class GameLogic {
  constructor() {
    this.currentRound = 1;
    this.awaitingAction = false;
    this.expectedAction = null;
    this.attackStartTime = 0;
    this.playerHealth = 100;
    this.enemyHealth = 20;
  }

  triggerAttack(enemyId, attackType) {
    if (this.awaitingAction) return false;

    // Déterminer l'action attendue selon le type d'attaque
    switch (attackType) {
      case 'normal':
        this.expectedAction = DEFENSE_ACTIONS.DODGE;
        break;
      case 'heavy':
        this.expectedAction = DEFENSE_ACTIONS.PARRY;
        break;
      case 'feint':
        this.expectedAction = DEFENSE_ACTIONS.NONE;
        break;
      default:
        return false;
    }

    this.awaitingAction = true;
    this.attackStartTime = Date.now();
    
    return true;
  }

    playerTurn(playerChoice) {
    // playerChoice est un objet { action: 'attack'|'heal', targetId? }

    if (playerChoice.action === 'heal') {
      this.playerHealth = Math.min(100, this.playerHealth + 30);
      return { message: 'Vous vous soignez de 30 points de vie', playerHealth: this.playerHealth };
    }

    if (playerChoice.action === 'attack') {
      // Simple attaque sur ennemi ciblé
      this.enemyHealth = Math.max(0, this.enemyHealth - 20);
      return { message: `Vous attaquez l'ennemi ${playerChoice.targetId}`, enemyHealth: this.enemyHealth };
    }

    return { message: 'Action inconnue' };
  }

  checkPlayerAction(action) {
    if (!this.awaitingAction) return null;

    const isCorrect = action === this.expectedAction;
    const timeTaken = Date.now() - this.attackStartTime;

    let points = 0;
    let message = '';

    if (isCorrect) {
      if (timeTaken < 1000) {
        points = 100;
        message = 'PARFAIT!';
      } else {
        points = 50;
        message = 'Bien!';
      }
    } else {
      points = -50;
      message = 'Mauvaise action!';
    }

    this.reset();

    return { points, message, isCorrect, timeTaken };
  }

  reset() {
    this.awaitingAction = false;
    this.expectedAction = null;
    this.attackStartTime = 0;
  }

  getRandomAttack() {
    const attackTypes = ['normal', 'heavy', 'feint'];
    return attackTypes[Math.floor(Math.random() * attackTypes.length)];
  }
}