import { 
  ATTACK_SEQUENCES, 
  ROUND_SEQUENCES, 
  TIMING_CONFIG,
  DEBUG_CONFIG 
} from '../utils/Constants';

/**
 * Service de gestion des séquences d'attaque prédéfinies
 * Responsabilité unique : Orchestration des séquences d'attaques prédéfinies
 */
class AttackSequenceService {
  constructor() {
    this.currentSequence = null;
    this.sequenceIndex = 0;
    this.sequenceTimeouts = [];
    this.isSequenceActive = false;
    this.sequenceStartTime = 0;
  }

  /**
   * Démarrer une séquence d'attaque
   * @param {string} sequenceName - Nom de la séquence à jouer
   * @param {Function} onAttackStart - Callback appelé pour chaque attaque
   * @param {Function} onSequenceComplete - Callback appelé à la fin de la séquence
   */
  startSequence(sequenceName, { onAttackStart, onSequenceComplete } = {}) {
    if (this.isSequenceActive) {
      console.warn('Sequence already active');
      return false;
    }

    const sequence = ATTACK_SEQUENCES[sequenceName];
    if (!sequence) {
      console.error(`Sequence not found: ${sequenceName}`);
      return false;
    }

    this.currentSequence = { ...sequence };
    this.sequenceIndex = 0;
    this.isSequenceActive = true;
    this.sequenceStartTime = performance.now();

    if (DEBUG_CONFIG.LOG_ATTACK_PHASES) {
      console.log(`Starting sequence: ${sequenceName} with ${sequence.attacks.length} attacks`);
    }

    // Programmer toutes les attaques de la séquence
    this._scheduleAttacks(onAttackStart, onSequenceComplete);

    return true;
  }

  /**
   * Programmer toutes les attaques de la séquence
   */
  _scheduleAttacks(onAttackStart, onSequenceComplete) {
    const attacks = this.currentSequence.attacks;
    let totalAttacks = attacks.length;
    let completedAttacks = 0;

    attacks.forEach((attack, index) => {
      const timeout = setTimeout(() => {
        if (!this.isSequenceActive) return;

        if (DEBUG_CONFIG.LOG_ATTACK_PHASES) {
          console.log(`Executing attack ${index + 1}/${attacks.length}:`, attack);
        }

        // Déclencher l'attaque
        if (onAttackStart) {
          onAttackStart(attack, index, attacks.length);
        }

        completedAttacks++;

        // Vérifier si c'est la dernière attaque
        if (completedAttacks >= totalAttacks) {
          // Attendre la fin de la dernière attaque avant de terminer la séquence
          setTimeout(() => {
            this._completeSequence(onSequenceComplete);
          }, TIMING_CONFIG.ATTACK_PREPARATION_DURATION + 
              TIMING_CONFIG.ATTACK_EXECUTION_DURATION + 
              TIMING_CONFIG.ATTACK_RECOVERY_DURATION);
        }

      }, attack.delay);

      this.sequenceTimeouts.push(timeout);
    });
  }

  /**
   * Terminer la séquence actuelle
   */
  _completeSequence(onSequenceComplete) {
    if (DEBUG_CONFIG.LOG_ATTACK_PHASES) {
      console.log(`Sequence completed: ${this.currentSequence.name}`);
    }

    this.isSequenceActive = false;
    this.currentSequence = null;
    this.sequenceIndex = 0;

    // Nettoyer les timeouts
    this.sequenceTimeouts.forEach(timeout => clearTimeout(timeout));
    this.sequenceTimeouts = [];

    if (onSequenceComplete) {
      onSequenceComplete();
    }
  }

  /**
   * Obtenir la séquence pour un round donné
   * @param {number} round - Numéro du round
   */
  getSequenceForRound(round) {
    // Rounds prédéfinis
    if (ROUND_SEQUENCES[round]) {
      return ROUND_SEQUENCES[round];
    }

    // Pour les rounds supérieurs, sélection aléatoire
    const sequenceNames = Object.keys(ATTACK_SEQUENCES);
    const randomIndex = Math.floor(Math.random() * sequenceNames.length);
    return sequenceNames[randomIndex];
  }

  /**
   * Créer une séquence personnalisée
   * @param {string} name - Nom de la séquence
   * @param {Array} attacks - Liste des attaques
   */
  createCustomSequence(name, attacks) {
    if (!name || !Array.isArray(attacks)) {
      console.error('Invalid sequence parameters');
      return false;
    }

    // Valider les attaques
    const validAttacks = attacks.every(attack => 
      typeof attack.enemyId === 'number' &&
      typeof attack.type === 'string' &&
      typeof attack.delay === 'number'
    );

    if (!validAttacks) {
      console.error('Invalid attack format in sequence');
      return false;
    }

    // Ajouter la séquence au pool
    ATTACK_SEQUENCES[name] = {
      name,
      attacks: [...attacks]
    };

    console.log(`Custom sequence created: ${name}`);
    return true;
  }

  /**
   * Générer une séquence aléatoire
   * @param {number} attackCount - Nombre d'attaques
   * @param {number} maxEnemies - Nombre maximum d'ennemis
   * @param {number} maxDelay - Délai maximum entre attaques
   */
  generateRandomSequence(attackCount = 3, maxEnemies = 3, maxDelay = 1000) {
    const attacks = [];
    const attackTypes = ['normal', 'heavy', 'feint'];

    for (let i = 0; i < attackCount; i++) {
      const attack = {
        enemyId: Math.floor(Math.random() * maxEnemies),
        type: attackTypes[Math.floor(Math.random() * attackTypes.length)],
        delay: i === 0 ? 0 : Math.floor(Math.random() * maxDelay)
      };
      attacks.push(attack);
    }

    return {
      name: `Random_${Date.now()}`,
      attacks
    };
  }

  /**
   * Modifier la vitesse d'une séquence
   * @param {string} sequenceName - Nom de la séquence
   * @param {number} speedMultiplier - Multiplicateur de vitesse (1.0 = normal)
   */
  adjustSequenceSpeed(sequenceName, speedMultiplier = 1.0) {
    const sequence = ATTACK_SEQUENCES[sequenceName];
    if (!sequence) return null;

    const adjustedSequence = {
      ...sequence,
      name: `${sequence.name}_Speed${speedMultiplier}`,
      attacks: sequence.attacks.map(attack => ({
        ...attack,
        delay: Math.round(attack.delay / speedMultiplier)
      }))
    };

    return adjustedSequence;
  }

  /**
   * Obtenir les informations sur la séquence actuelle
   */
  getCurrentSequenceInfo() {
    if (!this.isSequenceActive || !this.currentSequence) {
      return null;
    }

    return {
      name: this.currentSequence.name,
      totalAttacks: this.currentSequence.attacks.length,
      currentIndex: this.sequenceIndex,
      elapsedTime: performance.now() - this.sequenceStartTime,
      isActive: this.isSequenceActive
    };
  }

  /**
   * Obtenir la liste de toutes les séquences disponibles
   */
  getAvailableSequences() {
    return Object.keys(ATTACK_SEQUENCES).map(key => ({
      name: key,
      displayName: ATTACK_SEQUENCES[key].name,
      attackCount: ATTACK_SEQUENCES[key].attacks.length,
      preview: ATTACK_SEQUENCES[key].attacks.slice(0, 3) // Aperçu des 3 premières attaques
    }));
  }

  /**
   * Prévisualiser une séquence sans l'exécuter
   * @param {string} sequenceName - Nom de la séquence
   */
  previewSequence(sequenceName) {
    const sequence = ATTACK_SEQUENCES[sequenceName];
    if (!sequence) return null;

    // Calculer la durée totale
    const totalDuration = sequence.attacks.reduce((max, attack) => {
      const attackEnd = attack.delay + 
        TIMING_CONFIG.ATTACK_PREPARATION_DURATION + 
        TIMING_CONFIG.ATTACK_EXECUTION_DURATION + 
        TIMING_CONFIG.ATTACK_RECOVERY_DURATION;
      return Math.max(max, attackEnd);
    }, 0);

    return {
      name: sequence.name,
      attackCount: sequence.attacks.length,
      totalDuration,
      attacks: sequence.attacks.map((attack, index) => ({
        ...attack,
        index,
        startTime: attack.delay,
        endTime: attack.delay + 
          TIMING_CONFIG.ATTACK_PREPARATION_DURATION + 
          TIMING_CONFIG.ATTACK_EXECUTION_DURATION + 
          TIMING_CONFIG.ATTACK_RECOVERY_DURATION
      }))
    };
  }

  /**
   * Annuler la séquence en cours
   */
  cancelCurrentSequence() {
    if (!this.isSequenceActive) return;

    if (DEBUG_CONFIG.LOG_ATTACK_PHASES) {
      console.log('Cancelling current sequence');
    }

    // Annuler tous les timeouts
    this.sequenceTimeouts.forEach(timeout => clearTimeout(timeout));
    this.sequenceTimeouts = [];

    this.isSequenceActive = false;
    this.currentSequence = null;
    this.sequenceIndex = 0;
  }

  /**
   * Vérifier si une séquence est en cours
   */
  isActive() {
    return this.isSequenceActive;
  }

  /**
   * Obtenir le progrès de la séquence actuelle (0-1)
   */
  getSequenceProgress() {
    if (!this.isSequenceActive || !this.currentSequence) return 0;

    const totalAttacks = this.currentSequence.attacks.length;
    return Math.min(1, this.sequenceIndex / totalAttacks);
  }

  /**
   * Mettre en pause la séquence (ne fonctionne que pour les attaques futures)
   */
  pauseSequence() {
    if (!this.isSequenceActive) return false;

    // Note: Les attaques déjà programmées ne peuvent pas être mises en pause
    // Cette méthode est là pour la compatibilité future
    console.warn('Sequence pausing not fully implemented - attacks already scheduled will continue');
    return false;
  }

  /**
   * Nettoyer toutes les ressources
   */
  dispose() {
    this.cancelCurrentSequence();
    this.currentSequence = null;
    this.sequenceIndex = 0;
    this.sequenceStartTime = 0;
  }
}

// Export d'une instance singleton
export const attackSequenceService = new AttackSequenceService();

// Export de la classe pour les tests
export { AttackSequenceService };