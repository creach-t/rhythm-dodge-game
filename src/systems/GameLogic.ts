import {
  ATTACK_TYPES,
  DAMAGE_CONFIG,
  DEFENSE_ACTIONS,
  ENEMY_CONFIG,
  PLAYER_CONFIG,
  SCORE_CONFIG,
  SUCCESS_RATES,
} from '../utils/Constants';

export class GameLogic {
  currentRound: number;
  awaitingAction: boolean;
  currentAttackType: keyof typeof ATTACK_TYPES | null;
  currentEnemyId: number | null;
  attackStartTime: number;
  playerHealth: number;
  enemyHealths: number[];

  constructor() {
    this.currentRound = 1;
    this.awaitingAction = false;
    this.currentAttackType = null;
    this.currentEnemyId = null;
    this.attackStartTime = 0;
    this.playerHealth = PLAYER_CONFIG.HEALTH;
    this.enemyHealths = Array(ENEMY_CONFIG.MAX_COUNT).fill(ENEMY_CONFIG.HEALTH);
  }

  triggerAttack(
    enemyId: number,
    attackType: keyof typeof ATTACK_TYPES,
  ): boolean {
    this.awaitingAction = true;
    this.currentEnemyId = enemyId;
    this.currentAttackType = attackType;
    this.attackStartTime = Date.now();
    console.log(`Enemy ${enemyId} announces ${attackType} attack!`);
    return true;
  }

  resetAll() {
    this.currentRound = 1;
    this.awaitingAction = false;
    this.currentAttackType = null;
    this.currentEnemyId = null;
    this.attackStartTime = 0;
    this.playerHealth = PLAYER_CONFIG.HEALTH;
    this.enemyHealths = Array(ENEMY_CONFIG.MAX_COUNT).fill(ENEMY_CONFIG.HEALTH);
  }

  checkPlayerAction(action: keyof typeof DEFENSE_ACTIONS): {
    success: boolean;
    damage: number;
    counterAttack: boolean;
    points: number;
    message: string;
    isCorrect: boolean;
  } | null {
    if (!this.awaitingAction) return null;

    // 🔍 DEBUGGING - Ajoutez ces lignes
    console.log('currentAttackType:', this.currentAttackType);
    console.log('ATTACK_TYPES:', ATTACK_TYPES);
    console.log('Comparison results:');
    console.log('NORMAL:', this.currentAttackType === ATTACK_TYPES.NORMAL);
    console.log('HEAVY:', this.currentAttackType === ATTACK_TYPES.HEAVY);
    console.log('FEINT:', this.currentAttackType === ATTACK_TYPES.FEINT);

    let result = {
      success: false,
      damage: 0,
      counterAttack: false,
      points: 0,
      message: '',
      isCorrect: false,
    };

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
      default:
        result.message = 'Attaque inconnue !';
        break;
    }

    this.awaitingAction = false;
    if (result.damage > 0) {
      this.playerHealth = Math.max(0, this.playerHealth - result.damage);
    }
    return result;
  }

  private handleNormalAttack(action: keyof typeof DEFENSE_ACTIONS): {
    success: boolean;
    damage: number;
    counterAttack: boolean;
    points: number;
    message: string;
    isCorrect: boolean;
  } {
    const result = {
      success: false,
      damage: 0,
      counterAttack: false,
      points: 0,
      message: '',
      isCorrect: false,
    };

    if (action === DEFENSE_ACTIONS.DODGE) {
      if (Math.random() < SUCCESS_RATES.DODGE) {
        result.success = true;
        result.points = SCORE_CONFIG.DODGE_SUCCESS;
        result.message = 'Esquive réussie !';
        result.isCorrect = true;
      } else {
        result.damage = DAMAGE_CONFIG.NORMAL_ATTACK;
        result.points = SCORE_CONFIG.MISS_PENALTY;
        result.message = 'Esquive ratée !';
        result.isCorrect = false;
      }
    } else if (action === DEFENSE_ACTIONS.PARRY) {
      if (Math.random() < SUCCESS_RATES.PARRY) {
        result.success = true;
        result.counterAttack = true;
        result.points = SCORE_CONFIG.PARRY_SUCCESS + SCORE_CONFIG.COUNTER_BONUS;
        result.message = 'Parade parfaite ! Contre-attaque !';
        result.isCorrect = true;
        this.damageEnemy(
          this.currentEnemyId as number,
          DAMAGE_CONFIG.COUNTER_DAMAGE,
        );
      } else {
        result.damage = DAMAGE_CONFIG.NORMAL_ATTACK;
        result.points = SCORE_CONFIG.MISS_PENALTY;
        result.message = 'Parade ratée !';
        result.isCorrect = false;
      }
    } else {
      result.damage = DAMAGE_CONFIG.NORMAL_ATTACK;
      result.points = SCORE_CONFIG.MISS_PENALTY;
      result.message = 'Mauvaise action !';
      result.isCorrect = false;
    }
    return result;
  }

  private handleHeavyAttack(action: keyof typeof DEFENSE_ACTIONS): {
    success: boolean;
    damage: number;
    counterAttack: boolean;
    points: number;
    message: string;
    isCorrect: boolean;
  } {
    const result = {
      success: false,
      damage: 0,
      counterAttack: false,
      points: 0,
      message: '',
      isCorrect: false,
    };

    if (action === DEFENSE_ACTIONS.DODGE) {
      if (Math.random() < SUCCESS_RATES.DODGE) {
        result.success = true;
        result.points = SCORE_CONFIG.DODGE_SUCCESS;
        result.message = 'Esquive réussie !';
        result.isCorrect = true;
      } else {
        result.damage = DAMAGE_CONFIG.HEAVY_ATTACK;
        result.points = SCORE_CONFIG.MISS_PENALTY;
        result.message = 'Esquive ratée ! Gros dégâts !';
        result.isCorrect = false;
      }
    } else if (action === DEFENSE_ACTIONS.PARRY) {
      if (Math.random() < SUCCESS_RATES.PARRY) {
        result.success = true;
        result.counterAttack = true;
        result.points = SCORE_CONFIG.PARRY_SUCCESS + SCORE_CONFIG.COUNTER_BONUS;
        result.message = 'Parade héroïque ! Contre-attaque !';
        result.isCorrect = true;
        this.damageEnemy(
          this.currentEnemyId as number,
          DAMAGE_CONFIG.COUNTER_DAMAGE,
        );
      } else {
        result.damage = DAMAGE_CONFIG.HEAVY_ATTACK;
        result.points = SCORE_CONFIG.MISS_PENALTY;
        result.message = 'Parade ratée ! Gros dégâts !';
        result.isCorrect = false;
      }
    } else {
      result.damage = DAMAGE_CONFIG.HEAVY_ATTACK;
      result.points = SCORE_CONFIG.MISS_PENALTY;
      result.message = 'Mauvaise action ! Gros dégâts !';
      result.isCorrect = false;
    }
    return result;
  }

  private handleFeintAttack(action: keyof typeof DEFENSE_ACTIONS): {
    success: boolean;
    damage: number;
    counterAttack: boolean;
    points: number;
    message: string;
    isCorrect: boolean;
  } {
    const result = {
      success: false,
      damage: 0,
      counterAttack: false,
      points: 0,
      message: '',
      isCorrect: false,
    };

    if (action === DEFENSE_ACTIONS.NONE) {
      result.success = true;
      result.points = SCORE_CONFIG.FEINT_SUCCESS;
      result.message = 'Feinte évitée !';
      result.isCorrect = true;
    } else {
      result.damage = DAMAGE_CONFIG.FEINT_PENALTY;
      result.points = SCORE_CONFIG.MISS_PENALTY;
      result.message = 'Piégé par la feinte !';
      result.isCorrect = false;
    }
    return result;
  }

  damageEnemy(enemyId: number, damage: number): void {
    if (enemyId >= 0 && enemyId < this.enemyHealths.length) {
      this.enemyHealths[enemyId] = Math.max(
        0,
        this.enemyHealths[enemyId] - damage,
      );
      console.log(
        `Enemy ${enemyId} takes ${damage} damage! Health: ${this.enemyHealths[enemyId]}`,
      );
    }
  }

  getDamageForAttack(): number {
    switch (this.currentAttackType) {
      case ATTACK_TYPES.NORMAL:
        return DAMAGE_CONFIG.NORMAL_ATTACK;
      case ATTACK_TYPES.HEAVY:
        return DAMAGE_CONFIG.HEAVY_ATTACK;
      default:
        return 0;
    }
  }

  reset(): void {
    this.awaitingAction = false;
    this.currentAttackType = null;
    this.currentEnemyId = null;
    this.attackStartTime = 0;
  }

  getRandomAttack(): keyof typeof ATTACK_TYPES {
    const attacks = Object.keys(ATTACK_TYPES) as (keyof typeof ATTACK_TYPES)[];
    return attacks[Math.floor(Math.random() * attacks.length)];
  }

  getEnemyHealth(enemyId: number): number {
    return this.enemyHealths[enemyId];
  }

  areAllEnemiesDefeated(): boolean {
    return this.enemyHealths.every((health: number) => health <= 0);
  }
}
