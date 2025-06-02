import { GAME_CONFIG } from '../utils/Constants';
import { GameLogic } from '../systems/GameLogic';
import { createGround, createGrid, createPlayer } from '../engine/SceneSetup';

/**
 * Gestionnaire principal du jeu
 */
export class GameManager {
  constructor(stateManager, sceneManager, enemyManager) {
    this.stateManager = stateManager;
    this.sceneManager = sceneManager;
    this.enemyManager = enemyManager;
    this.gameLogic = new GameLogic();
    this.attackTimeoutId = null;
  }

  /**
   * Initialise le jeu
   */
  initialize() {
    console.log('Initializing GameManager...');
    
    // Ajouter les éléments de base à la scène
    this.sceneManager.addObject(createGround());
    this.sceneManager.addObject(createGrid());
    this.sceneManager.addObject(createPlayer());
    
    // Initialiser les ennemis
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
    if (this.gameLogic.awaitingAction) return;
    if (!this.stateManager.isPlaying()) return;
    
    this.stateManager.setResultMessage('');

    try {
      const enemyId = this.enemyManager.getRandomEnemyId();
      const attackType = this.gameLogic.getRandomAttack();
      
      console.log(`Enemy ${enemyId} attacks with ${attackType}`);
      
      if (this.gameLogic.triggerAttack(enemyId, attackType)) {
        this.enemyManager.activateAttack(enemyId, attackType);
        this.stateManager.setExpectedAction(this.gameLogic.expectedAction);
        
        // Timeout après 4 secondes
        this.attackTimeoutId = setTimeout(() => {
          if (this.gameLogic.awaitingAction) {
            this.handleMissedAction();
          }
        }, 4000);
      }
    } catch (error) {
      console.error('Error triggering attack:', error);
    }
  }

  /**
   * Gère une action manquée
   */
  handleMissedAction() {
    console.log('Player missed the action!');
    this.enemyManager.resetAll();
    
    // Appliquer les dégâts
    this.stateManager.takeDamage(10);
    this.stateManager.setExpectedAction(null);
    
    this.gameLogic.reset();
    
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
    const result = this.gameLogic.checkPlayerAction(action);
    if (!result) return;
    
    console.log(`Action result: ${result.message} (${result.points} points)`);
    
    // Annuler le timeout d'attaque
    if (this.attackTimeoutId) {
      clearTimeout(this.attackTimeoutId);
      this.attackTimeoutId = null;
    }
    
    this.enemyManager.resetAll();
    this.stateManager.updateScore(result.points);
    this.stateManager.setExpectedAction(null);
    this.stateManager.setResultMessage(result.message);
    
    // Continuer le jeu si le joueur est encore en vie
    if (this.stateManager.isPlaying()) {
      setTimeout(() => this.triggerRandomAttack(), 1500);
    } else {
      this.handleGameOver();
    }
  }

  /**
   * Gère la fin du jeu
   */
  handleGameOver() {
    console.log('Game Over!');
    this.sceneManager.stopRenderLoop();
  }

  /**
   * Nettoie les ressources
   */
  dispose() {
    if (this.attackTimeoutId) {
      clearTimeout(this.attackTimeoutId);
    }
    this.enemyManager.dispose();
    this.sceneManager.dispose();
  }
}