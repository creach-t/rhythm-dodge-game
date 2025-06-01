import { ATTACK_TYPES, GAME_CONFIG, TIMING } from '../utils/Constants';
import { randomInt, randomChoice } from '../utils/MathUtils';

/**
 * Générateur et gestionnaire de séquences d'attaques prédéfinies
 */
class AttackSequencer {
  constructor() {
    // Patterns de base pour les séquences
    this.basePatterns = {
      beginner: [
        { type: ATTACK_TYPES.NORMAL, weight: 70 },
        { type: ATTACK_TYPES.HEAVY, weight: 20 },
        { type: ATTACK_TYPES.FEINT, weight: 0 }
      ],
      intermediate: [
        { type: ATTACK_TYPES.NORMAL, weight: 50 },
        { type: ATTACK_TYPES.HEAVY, weight: 35 },
        { type: ATTACK_TYPES.FEINT, weight: 0 }
      ],
      advanced: [
        { type: ATTACK_TYPES.NORMAL, weight: 40 },
        { type: ATTACK_TYPES.HEAVY, weight: 40 },
        { type: ATTACK_TYPES.FEINT, weight: 0 }
      ]
    };

    // Patterns spéciaux pour certains rounds
    this.specialPatterns = {
      // Pattern de test pour les nouveaux joueurs
      tutorial: [
        { type: ATTACK_TYPES.NORMAL, enemyId: 0 },
        { type: ATTACK_TYPES.HEAVY, enemyId: 1 },
        { type: ATTACK_TYPES.FEINT, enemyId: 2 }
      ],
      
      // Pattern rapide
      rapid: [
        { type: ATTACK_TYPES.NORMAL, enemyId: 0 },
        { type: ATTACK_TYPES.NORMAL, enemyId: 1 },
        { type: ATTACK_TYPES.HEAVY, enemyId: 2 },
        { type: ATTACK_TYPES.NORMAL, enemyId: 0 },
        { type: ATTACK_TYPES.FEINT, enemyId: 1 }
      ],
      
      // Pattern défensif (beaucoup de parades)
      defensive: [
        { type: ATTACK_TYPES.HEAVY, enemyId: 0 },
        { type: ATTACK_TYPES.HEAVY, enemyId: 1 },
        { type: ATTACK_TYPES.NORMAL, enemyId: 2 },
        { type: ATTACK_TYPES.HEAVY, enemyId: 0 }
      ],
      
      // Pattern trompeur (beaucoup de feintes)
      deceptive: [
        { type: ATTACK_TYPES.FEINT, enemyId: 0 },
        { type: ATTACK_TYPES.NORMAL, enemyId: 1 },
        { type: ATTACK_TYPES.FEINT, enemyId: 2 },
        { type: ATTACK_TYPES.FEINT, enemyId: 1 },
        { type: ATTACK_TYPES.HEAVY, enemyId: 0 }
      ]
    };
  }

  /**
   * Génère une nouvelle séquence d'attaques basée sur le round
   */
  generateSequence(enemyCount, round) {
    console.log(`Generating sequence for round ${round} with ${enemyCount} enemies`);

    // Déterminer le type de pattern basé sur le round
    const patternType = this.getPatternType(round);
    
    // Générer la séquence
    let attacks;
    
    if (this.specialPatterns[patternType]) {
      // Utiliser un pattern spécial
      attacks = this.generateSpecialPattern(patternType, enemyCount);
    } else {
      // Générer un pattern aléatoire
      attacks = this.generateRandomPattern(patternType, enemyCount, round);
    }

    return {
      id: `sequence_round_${round}`,
      round,
      patternType,
      attacks: attacks.map((attack, index) => ({
        ...attack,
        index,
        timing: this.calculateAttackTiming(index, round)
      }))
    };
  }

  /**
   * Détermine le type de pattern basé sur le round
   */
  getPatternType(round) {
    // Round tutorial
    if (round === 1) return 'tutorial';
    
    // Rounds spéciaux
    if (round % 10 === 0) return 'deceptive';  // Rounds 10, 20, 30...
    if (round % 7 === 0) return 'defensive';   // Rounds 7, 14, 21...
    if (round % 5 === 0) return 'rapid';       // Rounds 5, 10, 15...
    
    // Progression normale
    if (round <= 3) return 'beginner';
    if (round <= 10) return 'intermediate';
    return 'advanced';
  }

  /**
   * Génère un pattern spécial prédéfini
   */
  generateSpecialPattern(patternType, enemyCount) {
    const basePattern = [...this.specialPatterns[patternType]];
    
    // Ajuster les IDs d'ennemis si nécessaire
    return basePattern.map(attack => ({
      ...attack,
      enemyId: attack.enemyId % enemyCount
    }));
  }

  /**
   * Génère un pattern aléatoire basé sur les probabilités
   */
  generateRandomPattern(difficulty, enemyCount, round) {
    const pattern = this.basePatterns[difficulty] || this.basePatterns.beginner;
    const sequenceLength = this.calculateSequenceLength(round);
    const attacks = [];

    // Éviter que le même ennemi attaque deux fois de suite
    let lastEnemyId = -1;

    for (let i = 0; i < sequenceLength; i++) {
      // Choisir le type d'attaque basé sur les probabilités
      const attackType = this.selectWeightedAttackType(pattern);
      
      // Choisir un ennemi différent du précédent
      let enemyId;
      do {
        enemyId = randomInt(0, enemyCount - 1);
      } while (enemyId === lastEnemyId && enemyCount > 1);
      
      lastEnemyId = enemyId;

      attacks.push({
        type: attackType,
        enemyId
      });
    }

    return attacks;
  }

  /**
   * Sélectionne un type d'attaque basé sur les poids
   */
  selectWeightedAttackType(pattern) {
    const totalWeight = pattern.reduce((sum, item) => sum + item.weight, 0);
    const random = Math.random() * totalWeight;
    
    let currentWeight = 0;
    for (const item of pattern) {
      currentWeight += item.weight;
      if (random <= currentWeight) {
        return item.type;
      }
    }
    
    // Fallback
    return ATTACK_TYPES.NORMAL;
  }

  /**
   * Calcule la longueur de la séquence basée sur le round
   */
  calculateSequenceLength(round) {
    // Commence avec 3 attaques, augmente progressivement
    const baseLength = 3;
    const increaseRate = Math.floor(round / 3); // +1 tous les 3 rounds
    const maxLength = 3; // Limite maximale
    
    return Math.min(baseLength + increaseRate, maxLength);
  }

  /**
   * Calcule le timing pour chaque attaque dans la séquence
   */
  calculateAttackTiming(attackIndex, round) {
    const baseTiming = TIMING.ATTACK_TELEGRAPH;
    const comboDelay = TIMING.COMBO_TIMEOUT;

    const speedMultiplier = Math.max(
      TIMING.MIN_SPEED_MULTIPLIER,
      1 - Math.log2(round + 1) * TIMING.SPEED_LOG_FACTOR
    );

    return {
      telegraph: baseTiming * speedMultiplier,
      delay: comboDelay * speedMultiplier,
      totalTime: (baseTiming + comboDelay) * speedMultiplier
    };
  }

  /**
   * Valide une séquence d'attaques
   */
  validateSequence(sequence) {
    if (!sequence || !sequence.attacks) {
      return { valid: false, error: 'Séquence invalide' };
    }

    if (sequence.attacks.length === 0) {
      return { valid: false, error: 'Séquence vide' };
    }

    // Vérifier que tous les types d'attaque sont valides
    for (const attack of sequence.attacks) {
      if (!Object.values(ATTACK_TYPES).includes(attack.type)) {
        return { valid: false, error: `Type d'attaque invalide: ${attack.type}` };
      }
      
      if (typeof attack.enemyId !== 'number' || attack.enemyId < 0) {
        return { valid: false, error: `ID d'ennemi invalide: ${attack.enemyId}` };
      }
    }

    return { valid: true };
  }

  /**
   * Obtient des statistiques sur une séquence
   */
  getSequenceStats(sequence) {
    if (!sequence || !sequence.attacks) return null;

    const stats = {
      totalAttacks: sequence.attacks.length,
      attackTypes: {},
      enemyDistribution: {},
      averageTiming: 0
    };

    // Compter les types d'attaques
    sequence.attacks.forEach(attack => {
      stats.attackTypes[attack.type] = (stats.attackTypes[attack.type] || 0) + 1;
      stats.enemyDistribution[attack.enemyId] = (stats.enemyDistribution[attack.enemyId] || 0) + 1;
    });

    // Calculer le timing moyen
    const totalTiming = sequence.attacks.reduce((sum, attack) => 
      sum + (attack.timing ? attack.timing.totalTime : 0), 0
    );
    stats.averageTiming = totalTiming / sequence.attacks.length;

    return stats;
  }

  /**
   * Génère une séquence personnalisée pour les tests
   */
  generateTestSequence(pattern) {
    return {
      id: 'test_sequence',
      round: 0,
      patternType: 'custom',
      attacks: pattern.map((attack, index) => ({
        ...attack,
        index,
        timing: this.calculateAttackTiming(index, 1)
      }))
    };
  }
}

export default AttackSequencer;