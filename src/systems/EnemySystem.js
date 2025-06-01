import * as THREE from 'three';

export const DEFENSE_ACTIONS = {
  NONE: 'none',
  DODGE: 'dodge',
  PARRY: 'parry'
};

export const ATTACK_COLORS = {
  normal: 0xffd93d,  // Jaune pour esquive
  heavy: 0x45b7d1,   // Bleu pour parade
  feint: 0xff6b6b    // Rouge pour ne rien faire
};

export const ENEMY_COLORS = [0xff6b6b, 0x96ceb4, 0x45b7d1];

export const createEnemy = (index, totalEnemies, radius) => {
  let geometry;
  
  // Créer différentes géométries pour chaque ennemi
  switch (index) {
    case 0:
      geometry = new THREE.ConeGeometry(1.2, 3.0, 8);
      break;
    case 1:
      geometry = new THREE.SphereGeometry(1.5, 12, 8);
      break;
    case 2:
      geometry = new THREE.CylinderGeometry(1.2, 1.2, 2.5, 12);
      break;
    default:
      geometry = new THREE.BoxGeometry(2, 2, 2);
  }
  
  const material = new THREE.MeshPhongMaterial({ 
    color: ENEMY_COLORS[index],
    emissive: ENEMY_COLORS[index],
    emissiveIntensity: 0.2,
    shininess: 100
  });
  
  const enemy = new THREE.Mesh(geometry, material);
  
  // Positionner en arc de cercle
  const angleStep = (Math.PI * 2) / totalEnemies;
  const angle = angleStep * index - Math.PI / 2;
  
  enemy.position.set(
    Math.cos(angle) * radius,
    1.2,
    Math.sin(angle) * radius
  );
  
  enemy.castShadow = true;
  enemy.name = `enemy_${index}`;
  enemy.userData = { 
    id: index, 
    isAttacking: false, 
    attackType: null,
    originalColor: ENEMY_COLORS[index]
  };
  
  return enemy;
};

export const animateEnemies = (enemies, time) => {
  enemies.forEach((enemy, i) => {
    if (enemy) {
      // Rotation lente
      enemy.rotation.y = time * 0.5 + i;
      
      // Mouvement vertical subtil
      enemy.position.y = 1.2 + Math.sin(time * 2 + i) * 0.3;
      
      // Scale pulsation pour les ennemis attaquants
      if (enemy.userData.isAttacking) {
        const scale = 1 + Math.sin(time * 8) * 0.1;
        enemy.scale.set(scale, scale, scale);
      } else {
        enemy.scale.set(1, 1, 1);
      }
    }
  });
};

export const highlightEnemyAttack = (enemy, attackType) => {
  const color = ATTACK_COLORS[attackType] || enemy.userData.originalColor;
  enemy.material.color.setHex(color);
  enemy.material.emissive.setHex(color);
  enemy.material.emissiveIntensity = 0.5;
  enemy.userData.isAttacking = true;
  enemy.userData.attackType = attackType;
};

export const resetEnemyAppearance = (enemy) => {
  if (enemy && enemy.userData) {
    enemy.material.color.setHex(enemy.userData.originalColor);
    enemy.material.emissive.setHex(enemy.userData.originalColor);
    enemy.material.emissiveIntensity = 0.2;
    enemy.userData.isAttacking = false;
    enemy.userData.attackType = null;
  }
};