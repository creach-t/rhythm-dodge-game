import { Enemy } from '../entities/Enemy';
import { GAME_CONFIG } from '../utils/Constants';

/**
 * Gère les ennemis du jeu
 */
export class EnemyManager {
  constructor(sceneManager) {
    this.sceneManager = sceneManager;
    this.enemies = [];
    this.activeEnemyId = null;
  }

  /**
   * Initialise les ennemis
   */
  initialize() {
    // Créer les ennemis
    for (let i = 0; i < GAME_CONFIG.ENEMIES.MAX_COUNT; i++) {
      const enemy = new Enemy(i, GAME_CONFIG.ENEMIES.MAX_COUNT);
      this.enemies.push(enemy);
      this.sceneManager.addObject(enemy.mesh);
    }
    
    console.log(`EnemyManager: Created ${this.enemies.length} enemies`);
  }

  /**
   * Met à jour l'animation des ennemis
   */
  update(time) {
    this.enemies.forEach(enemy => {
      enemy.update(time);
    });
  }

  /**
   * Active une attaque pour un ennemi
   */
  activateAttack(enemyId, attackType) {
    if (enemyId < 0 || enemyId >= this.enemies.length) {
      console.error(`Invalid enemy ID: ${enemyId}`);
      return false;
    }
    
    const enemy = this.enemies[enemyId];
    enemy.startAttack(attackType);
    this.activeEnemyId = enemyId;
    
    return true;
  }

  /**
   * Réinitialise tous les ennemis
   */
  resetAll() {
    this.enemies.forEach(enemy => {
      enemy.reset();
    });
    this.activeEnemyId = null;
  }

  /**
   * Obtient un ennemi aléatoire
   */
  getRandomEnemyId() {
    return Math.floor(Math.random() * this.enemies.length);
  }

  /**
   * Obtient l'ennemi actif
   */
  getActiveEnemy() {
    if (this.activeEnemyId !== null) {
      return this.enemies[this.activeEnemyId];
    }
    return null;
  }

  /**
   * Nettoie les ressources
   */
  dispose() {
    this.enemies.forEach(enemy => {
      this.sceneManager.removeObject(enemy.mesh);
    });
    this.enemies = [];
  }
}