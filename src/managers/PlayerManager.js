import { Player } from '../entities/Player';

/**
 * Gère le joueur
 */
export class PlayerManager {
  constructor(sceneManager) {
    this.sceneManager = sceneManager;
    this.player = null;
  }

  /**
   * Initialise le joueur
   */
  initialize() {
    this.player = new Player();
    this.sceneManager.addObject(this.player.mesh);
    console.log('PlayerManager: Player initialized');
  }

  /**
   * Met à jour l'animation du joueur
   */
  update(time) {
    if (this.player) {
      this.player.update(time);
    }
  }

  /**
   * Déclenche une action de défense
   */
  performDefense(defenseType) {
    if (this.player) {
      this.player.defend(defenseType);
    }
  }

  /**
   * Applique des dégâts au joueur
   */
  takeDamage(amount) {
    if (this.player) {
      this.player.takeDamage(amount);
    }
  }

  /**
   * Obtient la santé du joueur
   */
  getHealth() {
    return this.player ? this.player.health : 0;
  }

  /**
   * Vérifie si le joueur est en vie
   */
  isAlive() {
    return this.player ? this.player.isAlive() : false;
  }

  /**
   * Nettoie les ressources
   */
  dispose() {
    if (this.player) {
      this.sceneManager.removeObject(this.player.mesh);
      this.player = null;
    }
  }
}