import { 
  DEFENSE_ACTIONS, 
  ATTACK_TYPES,
  DAMAGE_CONFIG,
  SUCCESS_RATES,
  SCORE_CONFIG
} from '../utils/Constants.js';

export class GameLogic {
  constructor() {
    this.currentRound = 1;
    this.awaitingAction = false;
    this.currentAttackType = null;
    this.currentEnemyId = null;
    this.attackStartTime = 0;
    this.playerHealth = 100;
    this.enemyHealths = [100, 100, 100]; // Santé pour chaque ennemi
  }

  /**
   * Déclenche une attaque ennemie
   */
  triggerAttack(enemyId, attackType) {
    this.awaitingAction = true;
    this.currentEnemyId = enemyId;
    this.currentAttackType = attackType;
    this.attackStartTime = Date.now();

    console.log(`Enemy ${enemyId} announces ${attackType} attack!`);
    return true;
  }

  /**
   * Vérifie l'action du joueur et calcule les résultats
   */
  checkPlayerAction(action) {
    if (!this.awaitingAction) return null;

    const timeTaken = Date.now() - this.attackStartTime;
    let result = {
      success: false,
      damage: 0,
      counterAttack: false,
      points: 0,
      message: '',
      isCorrect: false
    };

    // Traiter selon le type d'attaque
    switch (this.currentAttackType) {
      case ATTACK_TYPES.NORMAL:
        result = this.handleNormalAttack(action);
        break;
      case ATTACK_TYPES.HEAVY:
        result = this.handleHeavyAttack(action);
        break;
      case ATTACK_TYPES.FEINT:
        result = this.handleFeintAttack(action);
        break;
    }

    // Réinitialiser l'état
    this.reset();

    return result;
  }

  /**
   * Gère une attaque normale (-20 PV)
   */
  handleNormalAttack(action) {
    let result = {
      success: false,
      damage: 0,
      counterAttack: false,
      points: 0,
      message: ''
    };

    if (action === DEFENSE_ACTIONS.DODGE) {
      // Esquive - faible risque
      if (Math.random() < SUCCESS_RATES.DODGE) {
        result.success = true;
        result.points = SCORE_CONFIG.DODGE_SUCCESS;
        result.message = 'Esquive réussie !';
      } else {
        result.damage = DAMAGE_CONFIG.NORMAL_ATTACK;
        result.points = SCORE_CONFIG.MISS_PENALTY;
        result.message = 'Esquive ratée !';
      }
    } else if (action === DEFENSE_ACTIONS.PARRY) {
      // Parade - haut risque mais contre-attaque si réussie
      if (Math.random() < SUCCESS_RATES.PARRY) {
        result.success = true;
        result.counterAttack = true;
        result.points = SCORE_CONFIG.PARRY_SUCCESS + SCORE_CONFIG.COUNTER_BONUS;
        result.message = 'Parade parfaite ! Contre-attaque !';
        
        // Infliger des dégâts à l'ennemi
        this.damageEnemy(this.currentEnemyId, DAMAGE_CONFIG.COUNTER_DAMAGE);
      } else {
        result.damage = DAMAGE_CONFIG.NORMAL_ATTACK;
        result.points = SCORE_CONFIG.MISS_PENALTY;
        result.message = 'Parade ratée !';
      }
    } else {
      // Aucune action ou mauvaise action
      result.damage = DAMAGE_CONFIG.NORMAL_ATTACK;
      result.points = SCORE_CONFIG.MISS_PENALTY;
      result.message = 'Touché !';
    }

    return result;
  }

  /**
   * Gère une attaque lourde (-50 PV)
   */
  handleHeavyAttack(action) {
    let result = {
      success: false,
      damage: 0,
      counterAttack: false,
      points: 0,
      message: ''
    };

    if (action === DEFENSE_ACTIONS.DODGE) {
      // Esquive - faible risque
      if (Math.random() < SUCCESS_RATES.DODGE) {
        result.success = true;
        result.points = SCORE_CONFIG.DODGE_SUCCESS;
        result.message = 'Esquive réussie !';
      } else {
        result.damage = DAMAGE_CONFIG.HEAVY_ATTACK;
        result.points = SCORE_CONFIG.MISS_PENALTY;
        result.message = 'Esquive ratée ! Gros dégâts !';
      }
    } else if (action === DEFENSE_ACTIONS.PARRY) {
      // Parade - haut risque mais contre-attaque si réussie
      if (Math.random() < SUCCESS_RATES.PARRY) {
        result.success = true;
        result.counterAttack = true;
        result.points = SCORE_CONFIG.PARRY_SUCCESS + SCORE_CONFIG.COUNTER_BONUS;
        result.message = 'Parade héroïque ! Contre-attaque !';
        
        // Infliger des dégâts à l'ennemi
        this.damageEnemy(this.currentEnemyId, DAMAGE_CONFIG.COUNTER_DAMAGE);
      } else {
        result.damage = DAMAGE_CONFIG.HEAVY_ATTACK;
        result.points = SCORE_CONFIG.MISS_PENALTY;
        result.message = 'Parade ratée ! Dégâts critiques !';
      }
    } else {
      // Aucune action ou mauvaise action
      result.damage = DAMAGE_CONFIG.HEAVY_ATTACK;
      result.points = SCORE_CONFIG.MISS_PENALTY;
      result.message = 'Coup dévastateur !';
    }

    return result;
  }

  /**
   * Gère une feinte (piège - ne rien faire)
   */
  handleFeintAttack(action) {
    let result = {
      success: false,
      damage: 0,
      counterAttack: false,
      points: 0,
      message: ''
    };

    if (action === DEFENSE_ACTIONS.NONE) {
      // Bonne réaction - ne rien faire
      result.success = true;
      result.points = SCORE_CONFIG.FEINT_SUCCESS;
      result.message = 'Feinte évitée !';
    } else {
      // Le joueur est tombé dans le piège
      result.damage = DAMAGE_CONFIG.FEINT_PENALTY;
      result.points = SCORE_CONFIG.MISS_PENALTY;
      result.message = 'Piégé par la feinte !';
    }

    return result;
  }

  /**
   * Inflige des dégâts à un ennemi
   */
  damageEnemy(enemyId, damage) {
    if (enemyId >= 0 && enemyId < this.enemyHealths.length) {
      this.enemyHealths[enemyId] = Math.max(0, this.enemyHealths[enemyId] - damage);
      console.log(`Enemy ${enemyId} takes ${damage} damage! Health: ${this.enemyHealths[enemyId]}`);
    }
  }

  /**
   * Vérifie si l'action était à temps (non utilisé mais peut être utile)
   */
  checkActionTiming() {
    const timeTaken = Date.now() - this.attackStartTime;
    if (timeTaken > 2000) {
      return { damage: this.getDamageForAttack(), message: 'Trop lent !' };
    }
    return null;
  }

  /**
   * Retourne les dégâts pour l'attaque actuelle
   */
  getDamageForAttack() {
    switch (this.currentAttackType) {
      case ATTACK_TYPES.NORMAL:
        return DAMAGE_CONFIG.NORMAL_ATTACK;
      case ATTACK_TYPES.HEAVY:
        return DAMAGE_CONFIG.HEAVY_ATTACK;
      default:
        return 0;
    }
  }

  /**
   * Réinitialise l'état après une action
   */
  reset() {
    this.awaitingAction = false;
    this.currentAttackType = null;
    this.currentEnemyId = null;
    this.attackStartTime = 0;
  }

  /**
   * Génère une attaque aléatoire
   */
  getRandomAttack() {
    const attacks = Object.values(ATTACK_TYPES);
    return attacks[Math.floor(Math.random() * attacks.length)];
  }

  /**
   * Obtient la santé d'un ennemi
   */
  getEnemyHealth(enemyId) {
    return this.enemyHealths[enemyId] || 0;
  }

  /**
   * Vérifie si tous les ennemis sont vaincus
   */
  areAllEnemiesDefeated() {
    return this.enemyHealths.every(health => health <= 0);
  }
}
