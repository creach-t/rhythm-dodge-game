import { GAME_CONFIG } from '../utils/Constants';
import { CombatSystem } from '../systems/CombatSystem';
import { createGround, createGrid } from '../engine/SceneSetup';

/**
 * Gestionnaire principal du jeu
 */
export class GameManager {
  constructor(stateManager, sceneManager, enemyManager, playerManager) {
    this.stateManager = stateManager;
    this.sceneManager = sceneManager;
    this.enemyManager = enemyManager;
    this.playerManager = playerManager;
    this.combatSystem = new CombatSystem();
    this.attackTimeoutId = null;
    this.currentAttackType = null;
  }

  /**
   * Initialise le jeu
   */
  initialize() {
    console.log('Initializing GameManager...');
    
    // Ajouter les éléments de base à la scène
    this.sceneManager.addObject(createGround());
    this.sceneManager.addObject(createGrid());
    
    // Initialiser le joueur et les ennemis
    this.playerManager.initialize();
    this.enemyManager.initialize();
    
    // Démarrer la boucle de rendu
    this.sceneManager.startRenderLoop(() => {
      this.update();
    });
    
    // Démarrer le gameplay après un délai
    setTimeout(() => this.startGameplay(), 2000);
  }

  /**
   * Met à jour le jeu
   */
  update() {
    const time = Date.now() * 0.001;
    this.enemyManager.update(time);
    this.playerManager.update(time);
  }

  /**
   * Démarre le gameplay
   */
  startGameplay() {
    console.log('Starting gameplay...');
    setTimeout(() => this.triggerRandomAttack(), 1000);
  }

  /**
   * Déclenche une attaque aléatoire
   */
  triggerRandomAttack() {
    if (this.currentAttackType !== null) return;
    if (!this.stateManager.isPlaying()) return;
    
    this.stateManager.setResultMessage('');

    try {
      const enemyId = this.enemyManager.getRandomEnemyId();
      const attackType = this.combatSystem.getRandomAttackType();
      this.currentAttackType = attackType;
      
      console.log(`Enemy ${enemyId} attacks with ${attackType}`);
      
      // Activer l'attaque visuelle
      this.enemyManager.activateAttack(enemyId, attackType);
      
      // Définir l'action attendue
      const expectedAction = this.combatSystem.getExpectedAction(attackType);
      this.stateManager.setExpectedAction(expectedAction);
      
      // Timeout après 4 secondes
      this.attackTimeoutId = setTimeout(() => {
        if (this.currentAttackType !== null) {
          this.handleMissedAction();
        }
      }, 4000);
      
    } catch (error) {
      console.error('Error triggering attack:', error);
    }
  }

  /**
   * Gère une action manquée
   */
  handleMissedAction() {
    console.log('Player missed the action!');
    this.resetAttack();
    
    // Appliquer les dégâts
    this.stateManager.takeDamage(10);
    this.stateManager.setResultMessage("Trop tard !");
    
    // Continuer le jeu si le joueur est encore en vie
    if (this.stateManager.isPlaying()) {
      setTimeout(() => this.triggerRandomAttack(), 3000);
    } else {
      this.handleGameOver();
    }
  }

  /**
   * Gère l'action du joueur
   */
  handlePlayerAction(action) {
    if (this.currentAttackType === null) return;
    
    // Vérifier l'action
    const result = this.combatSystem.checkPlayerAction(this.currentAttackType, action);
    const points = this.combatSystem.calculatePoints(result.isCorrect, this.stateManager.getState().combo);
    const message = this.combatSystem.getResultMessage(result.isCorrect, this.currentAttackType, action);
    
    console.log(`Action result: ${message} (${points} points)`);
    
    // Animer le joueur
    this.playerManager.performDefense(action);
    
    // Réinitialiser l'attaque
    this.resetAttack();
    
    // Mettre à jour l'état
    this.stateManager.updateScore(points);
    this.stateManager.setResultMessage(message);
    
    // Appliquer des dégâts si mauvaise action
    if (!result.isCorrect) {
      this.stateManager.takeDamage(5);
    }
    
    // Continuer le jeu si le joueur est encore en vie
    if (this.stateManager.isPlaying()) {
      setTimeout(() => this.triggerRandomAttack(), 1500);
    } else {
      this.handleGameOver();
    }
  }

  /**
   * Réinitialise l'attaque en cours
   */
  resetAttack() {
    if (this.attackTimeoutId) {
      clearTimeout(this.attackTimeoutId);
      this.attackTimeoutId = null;
    }
    
    this.currentAttackType = null;
    this.enemyManager.resetAll();
    this.stateManager.setExpectedAction(null);
  }

  /**
   * Gère la fin du jeu
   */
  handleGameOver() {
    console.log('Game Over!');
    this.resetAttack();
    this.sceneManager.stopRenderLoop();
  }

  /**
   * Nettoie les ressources
   */
  dispose() {
    this.resetAttack();
    this.playerManager.dispose();
    this.enemyManager.dispose();
    this.sceneManager.dispose();
  }
}