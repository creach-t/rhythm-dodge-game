import { 
  PLAYER_CONFIG, 
  COLORS,
  DEBUG_CONFIG 
} from '../utils/Constants';

/**
 * Service d'animation du joueur
 * Responsabilité unique : Animations et effets visuels du joueur
 */
class PlayerAnimationService {
  constructor() {
    this.currentAnimation = null;
    this.animationStartTime = 0;
    this.animationDuration = 0;
    this.player = null;
    this.originalPlayerData = null;
  }

  /**
   * Initialiser le service avec l'objet joueur
   * @param {Object} playerObject - Objet 3D du joueur
   */
  initialize(playerObject) {
    if (!playerObject) {
      console.error('Player object is required for PlayerAnimationService');
      return false;
    }

    this.player = playerObject;
    
    // Sauvegarder les données originales
    this.originalPlayerData = {
      position: playerObject.position.clone(),
      scale: playerObject.scale.clone(),
      rotation: playerObject.rotation.clone(),
      color: playerObject.material ? playerObject.material.color.getHex() : COLORS.PLAYER,
      emissiveIntensity: playerObject.material ? playerObject.material.emissiveIntensity : 0.2
    };

    // Stocker dans userData pour référence
    playerObject.userData.originalPosition = this.originalPlayerData.position.clone();
    playerObject.userData.originalColor = this.originalPlayerData.color;

    if (DEBUG_CONFIG.LOG_ATTACK_PHASES) {
      console.log('🎭 PlayerAnimationService initialized');
    }

    return true;
  }

  /**
   * Démarrer l'animation d'esquive
   * @param {string} direction - Direction de l'esquive ('left', 'right', 'back')
   * @param {number} duration - Durée de l'animation en ms
   */
  startDodgeAnimation(direction = 'right', duration = 800) {
    if (!this.player) {
      console.warn('Player not initialized');
      return false;
    }

    this.currentAnimation = 'dodge';
    this.animationStartTime = performance.now();
    this.animationDuration = duration;

    if (DEBUG_CONFIG.LOG_ATTACK_PHASES) {
      console.log(`🏃 Starting dodge animation: ${direction} for ${duration}ms`);
    }

    // Appliquer les effets visuels d'esquive
    this._applyDodgeVisuals();

    // Programmer la fin de l'animation
    setTimeout(() => {
      this._endAnimation();
    }, duration);

    return true;
  }

  /**
   * Démarrer l'animation de parade
   * @param {number} duration - Durée de l'animation en ms
   */
  startParryAnimation(duration = 600) {
    if (!this.player) {
      console.warn('Player not initialized');
      return false;
    }

    this.currentAnimation = 'parry';
    this.animationStartTime = performance.now();
    this.animationDuration = duration;

    if (DEBUG_CONFIG.LOG_ATTACK_PHASES) {
      console.log(`🛡️  Starting parry animation for ${duration}ms`);
    }

    // Appliquer les effets visuels de parade
    this._applyParryVisuals();

    // Programmer la fin de l'animation
    setTimeout(() => {
      this._endAnimation();
    }, duration);

    return true;
  }

  /**
   * Démarrer l'animation de soin
   * @param {number} duration - Durée de l'animation en ms
   */
  startHealAnimation(duration = 1000) {
    if (!this.player) {
      console.warn('Player not initialized');
      return false;
    }

    this.currentAnimation = 'heal';
    this.animationStartTime = performance.now();
    this.animationDuration = duration;

    if (DEBUG_CONFIG.LOG_ATTACK_PHASES) {
      console.log(`💚 Starting heal animation for ${duration}ms`);
    }

    // Appliquer les effets visuels de soin
    this._applyHealVisuals();

    // Programmer la fin de l'animation
    setTimeout(() => {
      this._endAnimation();
    }, duration);

    return true;
  }

  /**
   * Démarrer l'animation d'attaque
   * @param {number} duration - Durée de l'animation en ms
   */
  startAttackAnimation(duration = 700) {
    if (!this.player) {
      console.warn('Player not initialized');
      return false;
    }

    this.currentAnimation = 'attack';
    this.animationStartTime = performance.now();
    this.animationDuration = duration;

    if (DEBUG_CONFIG.LOG_ATTACK_PHASES) {
      console.log(`⚔️  Starting attack animation for ${duration}ms`);
    }

    // Appliquer les effets visuels d'attaque
    this._applyAttackVisuals();

    // Programmer la fin de l'animation
    setTimeout(() => {
      this._endAnimation();
    }, duration);

    return true;
  }

  /**
   * Appliquer les effets visuels d'esquive
   */
  _applyDodgeVisuals() {
    if (!this.player || !this.player.material) return;

    try {
      // Couleur jaune vif pour l'esquive
      this.player.material.color.setHex(COLORS.ATTACK_NORMAL);
      this.player.material.emissive.setHex(COLORS.ATTACK_NORMAL);
      this.player.material.emissiveIntensity = 0.6;

    } catch (error) {
      console.error('Error applying dodge visuals:', error);
    }
  }

  /**
   * Appliquer les effets visuels de parade
   */
  _applyParryVisuals() {
    if (!this.player || !this.player.material) return;

    try {
      // Couleur bleue pour la parade
      this.player.material.color.setHex(COLORS.ATTACK_HEAVY);
      this.player.material.emissive.setHex(COLORS.ATTACK_HEAVY);
      this.player.material.emissiveIntensity = 0.8;

    } catch (error) {
      console.error('Error applying parry visuals:', error);
    }
  }

  /**
   * Appliquer les effets visuels de soin
   */
  _applyHealVisuals() {
    if (!this.player || !this.player.material) return;

    try {
      // Couleur verte pour le soin
      this.player.material.color.setHex(COLORS.PLAYER_HEAL);
      this.player.material.emissive.setHex(COLORS.PLAYER_HEAL);
      this.player.material.emissiveIntensity = 0.7;

    } catch (error) {
      console.error('Error applying heal visuals:', error);
    }
  }

  /**
   * Appliquer les effets visuels d'attaque
   */
  _applyAttackVisuals() {
    if (!this.player || !this.player.material) return;

    try {
      // Couleur rouge pour l'attaque
      this.player.material.color.setHex(COLORS.PLAYER_ATTACK);
      this.player.material.emissive.setHex(COLORS.PLAYER_ATTACK);
      this.player.material.emissiveIntensity = 0.9;

    } catch (error) {
      console.error('Error applying attack visuals:', error);
    }
  }

  /**
   * Animer le joueur selon l'animation en cours
   * @param {number} time - Temps de l'animation globale
   */
  animatePlayer(time) {
    if (!this.player || !this.currentAnimation) return;

    const elapsed = performance.now() - this.animationStartTime;
    const progress = Math.min(1, elapsed / this.animationDuration);

    switch (this.currentAnimation) {
      case 'dodge':
        this._animateDodge(time, progress);
        break;
      case 'parry':
        this._animateParry(time, progress);
        break;
      case 'heal':
        this._animateHeal(time, progress);
        break;
      case 'attack':
        this._animateAttack(time, progress);
        break;
    }
  }

  /**
   * Animation d'esquive - Mouvement latéral rapide
   */
  _animateDodge(time, progress) {
    const originalPos = this.originalPlayerData.position;
    
    // Mouvement en arc vers la droite puis retour
    const moveDistance = 2.0;
    const height = 0.5;
    
    // Courbe en cloche pour le mouvement
    const movementCurve = Math.sin(progress * Math.PI);
    const sidestep = movementCurve * moveDistance;
    const jump = movementCurve * height;
    
    // Rotation pour montrer l'esquive
    const rotation = movementCurve * 0.3;
    
    this.player.position.x = originalPos.x + sidestep;
    this.player.position.y = originalPos.y + jump;
    this.player.rotation.z = rotation;
    
    // Léger effet de vitesse (échelle)
    const speedScale = 1 + movementCurve * 0.1;
    this.player.scale.set(speedScale, speedScale, speedScale);
  }

  /**
   * Animation de parade - Position défensive
   */
  _animateParry(time, progress) {
    const originalPos = this.originalPlayerData.position;
    
    // Mouvement vers l'avant et légère réduction de taille
    const forwardMove = Math.sin(progress * Math.PI) * 0.5;
    const defensiveScale = 1 - Math.sin(progress * Math.PI) * 0.15;
    
    this.player.position.z = originalPos.z - forwardMove;
    this.player.scale.set(defensiveScale, 1, defensiveScale);
    
    // Rotation légère pour la posture défensive
    this.player.rotation.x = Math.sin(progress * Math.PI) * -0.2;
  }

  /**
   * Animation de soin - Pulsation douce
   */
  _animateHeal(time, progress) {
    // Pulsation douce et élévation
    const pulse = Math.sin(time * 6) * 0.05 + 1;
    const elevation = Math.sin(progress * Math.PI) * 0.3;
    
    this.player.scale.set(pulse, pulse, pulse);
    this.player.position.y = this.originalPlayerData.position.y + elevation;
    
    // Rotation lente pour l'effet magique
    this.player.rotation.y = time * 2;
  }

  /**
   * Animation d'attaque - Mouvement vers l'avant
   */
  _animateAttack(time, progress) {
    const originalPos = this.originalPlayerData.position;
    
    // Mouvement rapide vers l'avant puis retour
    const attackDistance = 1.5;
    const attackCurve = Math.sin(progress * Math.PI);
    
    this.player.position.z = originalPos.z - attackCurve * attackDistance;
    
    // Agrandissement pour montrer la force
    const powerScale = 1 + attackCurve * 0.2;
    this.player.scale.set(powerScale, powerScale, powerScale);
    
    // Rotation pour l'élan
    this.player.rotation.x = attackCurve * -0.3;
  }

  /**
   * Terminer l'animation et restaurer l'état original
   */
  _endAnimation() {
    if (!this.player) return;

    if (DEBUG_CONFIG.LOG_ATTACK_PHASES) {
      console.log(`🎭 Ending ${this.currentAnimation} animation`);
    }

    // Restaurer l'apparence originale
    this._resetPlayerVisuals();

    // Réinitialiser l'animation
    this.currentAnimation = null;
    this.animationStartTime = 0;
    this.animationDuration = 0;
  }

  /**
   * Réinitialiser les visuels du joueur
   */
  _resetPlayerVisuals() {
    if (!this.player || !this.originalPlayerData) return;

    try {
      // Restaurer la position
      this.player.position.copy(this.originalPlayerData.position);
      
      // Restaurer l'échelle
      this.player.scale.copy(this.originalPlayerData.scale);
      
      // Restaurer la rotation
      this.player.rotation.copy(this.originalPlayerData.rotation);

      // Restaurer les matériaux
      if (this.player.material) {
        this.player.material.color.setHex(this.originalPlayerData.color);
        this.player.material.emissive.setHex(this.originalPlayerData.color);
        this.player.material.emissiveIntensity = this.originalPlayerData.emissiveIntensity;
      }

    } catch (error) {
      console.error('Error resetting player visuals:', error);
    }
  }

  /**
   * Animation d'attente (idle) - Petite oscillation
   */
  animateIdle(time) {
    if (!this.player || this.currentAnimation) return;

    const originalPos = this.originalPlayerData.position;
    const hoverAmplitude = PLAYER_CONFIG.ANIMATION.HOVER_AMPLITUDE;
    const hoverSpeed = PLAYER_CONFIG.ANIMATION.IDLE_SPEED;
    
    // Oscillation verticale douce
    const hover = Math.sin(time * hoverSpeed) * hoverAmplitude;
    this.player.position.y = originalPos.y + hover;
    
    // Rotation très légère
    this.player.rotation.y = Math.sin(time * 0.5) * 0.1;
  }

  /**
   * Forcer l'arrêt de toute animation
   */
  stopAllAnimations() {
    if (this.currentAnimation) {
      this._endAnimation();
    }
  }

  /**
   * Obtenir l'état actuel de l'animation
   */
  getAnimationState() {
    return {
      currentAnimation: this.currentAnimation,
      isAnimating: this.currentAnimation !== null,
      progress: this.currentAnimation ? 
        Math.min(1, (performance.now() - this.animationStartTime) / this.animationDuration) : 0
    };
  }

  /**
   * Nettoyer les ressources
   */
  dispose() {
    this.stopAllAnimations();
    this.player = null;
    this.originalPlayerData = null;
  }
}

// Export d'une instance singleton
export const playerAnimationService = new PlayerAnimationService();

// Export de la classe pour les tests
export { PlayerAnimationService };