import * as THREE from 'three';
import { GAME_CONFIG } from '../utils/Constants';

/**
 * Classe représentant un ennemi
 */
export class Enemy {
  constructor(id, totalEnemies) {
    this.id = id;
    this.mesh = this.createMesh(id, totalEnemies);
    this.isAttacking = false;
    this.attackType = null;
    this.originalColor = this.mesh.material.color.clone();
    this.originalEmissive = this.mesh.material.emissive.clone();
  }

  /**
   * Crée le mesh 3D de l'ennemi
   */
  createMesh(id, totalEnemies) {
    const angle = (id / totalEnemies) * Math.PI * 2;
    const radius = GAME_CONFIG.ENEMIES.SPAWN_RADIUS;
    
    const geometry = new THREE.ConeGeometry(0.5, 1, 4);
    const material = new THREE.MeshPhongMaterial({
      color: 0xff0000,
      emissive: 0x220000,
      shininess: 100
    });
    
    const enemy = new THREE.Mesh(geometry, material);
    enemy.position.set(
      Math.cos(angle) * radius,
      0.5,
      Math.sin(angle) * radius
    );
    enemy.rotation.x = Math.PI;
    enemy.userData = { id, type: 'enemy' };
    
    return enemy;
  }

  /**
   * Met à jour l'animation de l'ennemi
   */
  update(time) {
    if (this.mesh) {
      // Animation de flottement
      this.mesh.position.y = 0.5 + Math.sin(time * 2 + this.id) * 0.1;
      this.mesh.rotation.y = time * 0.5;
      
      // Animation d'attaque
      if (this.isAttacking) {
        const pulse = Math.sin(time * 10) * 0.1;
        this.mesh.scale.set(1 + pulse, 1 + pulse, 1 + pulse);
      }
    }
  }

  /**
   * Démarre une attaque
   */
  startAttack(attackType) {
    this.isAttacking = true;
    this.attackType = attackType;
    
    // Changer la couleur selon le type d'attaque
    const attackColors = {
      'low': { color: 0xff0000, emissive: 0xff0000 },
      'high': { color: 0x0000ff, emissive: 0x0000ff },
      'special': { color: 0xffff00, emissive: 0xffff00 }
    };
    
    const colors = attackColors[attackType] || attackColors['low'];
    this.mesh.material.color.setHex(colors.color);
    this.mesh.material.emissive.setHex(colors.emissive);
    this.mesh.material.emissiveIntensity = 0.5;
  }

  /**
   * Réinitialise l'apparence de l'ennemi
   */
  reset() {
    this.isAttacking = false;
    this.attackType = null;
    
    // Restaurer les couleurs originales
    this.mesh.material.color.copy(this.originalColor);
    this.mesh.material.emissive.copy(this.originalEmissive);
    this.mesh.material.emissiveIntensity = 1;
    this.mesh.scale.set(1, 1, 1);
  }

  /**
   * Obtient la position de l'ennemi
   */
  getPosition() {
    return this.mesh.position;
  }

  /**
   * Définit la position de l'ennemi
   */
  setPosition(x, y, z) {
    this.mesh.position.set(x, y, z);
  }
}