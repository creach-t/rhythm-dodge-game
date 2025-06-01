import * as THREE from 'three';
import { GAME_CONFIG } from '../utils/Constants';

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

export const createEnemy = (index, totalEnemies, radius) => {
  let geometry;
  
  switch (index) {
    case 0:
      geometry = new THREE.SphereGeometry(1.5, 12, 8);;
      break;
    case 1:
      geometry = new THREE.SphereGeometry(1.5, 12, 8);
      break;
    case 2:
      geometry = new THREE.SphereGeometry(1.5, 12, 8);;
      break;
    default:
      geometry = new THREE.SphereGeometry(1.5, 12, 8);;
  }

  const material = new THREE.MeshPhongMaterial({ 
    color: GAME_CONFIG.ENEMIES.COLORS[index],
    emissive: GAME_CONFIG.ENEMIES.COLORS[index],
    emissiveIntensity: 0.2,
    shininess: 100
  });

  const enemy = new THREE.Mesh(geometry, material);

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
    originalColor: GAME_CONFIG.ENEMIES.COLORS[index],
    originalPosition: enemy.position.clone()
  };

  return enemy;
};

export const animateEnemies = (enemies, time) => {
  enemies.forEach((enemy, i) => {
    if (!enemy) return;

    enemy.rotation.y = time * 0.5 + i;
    enemy.position.y = 1.2 + Math.sin(time * 2 + i) * 0.3;

    const originalPos = enemy.userData.originalPosition;

    if (enemy.userData.isAttacking) {
      const direction = new THREE.Vector3(0, 0, 0).sub(originalPos).normalize();
      const offset = direction.multiplyScalar(0.5);
      const attackOffset = Math.sin(time * 8) * 0.5;

      enemy.position.x = originalPos.x + offset.x * attackOffset;
      enemy.position.z = originalPos.z + offset.z * attackOffset;

      const scale = 1 + Math.sin(time * 8) * 0.1;
      enemy.scale.set(scale, scale, scale);
    } else {
      enemy.position.x = originalPos.x;
      enemy.position.z = originalPos.z;
      enemy.scale.set(1, 1, 1);
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
