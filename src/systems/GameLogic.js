import { DEFENSE_ACTIONS } from './EnemySystem';

export class GameLogic {
  constructor() {
    this.currentRound = 1;
    this.awaitingAction = false;
    this.expectedAction = null;
    this.attackStartTime = 0;
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