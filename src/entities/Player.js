import * as THREE from 'three';

/**
 * Classe représentant le joueur
 */
export class Player {
  constructor() {
    this.mesh = this.createMesh();
    this.position = { x: 0, y: 0.5, z: 0 };
    this.health = 100;
    this.isDefending = false;
    this.defenseType = null;
  }

  /**
   * Crée le mesh 3D du joueur
   */
  createMesh() {
    const geometry = new THREE.BoxGeometry(1, 1, 1);
    const material = new THREE.MeshPhongMaterial({
      color: 0x00ff00,
      emissive: 0x002200,
      shininess: 100
    });
    
    const player = new THREE.Mesh(geometry, material);
    player.position.set(0, 0.5, 0);
    player.castShadow = true;
    player.receiveShadow = true;
    player.userData = { type: 'player' };
    
    return player;
  }

  /**
   * Met à jour l'animation du joueur
   */
  update(time) {
    // Animation de respiration
    const breathingScale = 1 + Math.sin(time * 2) * 0.05;
    this.mesh.scale.set(breathingScale, breathingScale, breathingScale);
    
    // Animation de défense
    if (this.isDefending) {
      this.mesh.rotation.y += 0.1;
    } else {
      this.mesh.rotation.y = 0;
    }
  }

  /**
   * Active une action de défense
   */
  defend(defenseType) {
    this.isDefending = true;
    this.defenseType = defenseType;
    
    // Effet visuel selon le type de défense
    if (defenseType === 'dodge') {
      this.mesh.material.emissive.setHex(0x0000ff);
    } else if (defenseType === 'parry') {
      this.mesh.material.emissive.setHex(0xffff00);
    }
    
    // Réinitialiser après l'animation
    setTimeout(() => this.resetDefense(), 500);
  }

  /**
   * Réinitialise l'état de défense
   */
  resetDefense() {
    this.isDefending = false;
    this.defenseType = null;
    this.mesh.material.emissive.setHex(0x002200);
  }

  /**
   * Applique des dégâts au joueur
   */
  takeDamage(amount) {
    this.health = Math.max(0, this.health - amount);
    
    // Effet visuel de dégâts
    this.mesh.material.color.setHex(0xff0000);
    setTimeout(() => {
      this.mesh.material.color.setHex(0x00ff00);
    }, 200);
  }

  /**
   * Obtient la position du joueur
   */
  getPosition() {
    return this.mesh.position;
  }

  /**
   * Vérifie si le joueur est en vie
   */
  isAlive() {
    return this.health > 0;
  }
}