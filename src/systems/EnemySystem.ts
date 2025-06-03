import * as THREE from 'three';
import { COLORS, ENEMY_CONFIG } from '../utils/Constants';

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
    color: ENEMY_CONFIG.COLORS[index],
    emissive: ENEMY_CONFIG.COLORS[index],
    emissiveIntensity: 0.2,
    shininess: 100
  });

  const enemy = new THREE.Mesh(geometry, material);

  const angleStep = (Math.PI * 2) / totalEnemies;
  const angle = angleStep * index - Math.PI / 2;

  enemy.position.set(
    Math.cos(angle) * radius,
    1.5,
    Math.sin(angle) * radius
  );

  enemy.castShadow = true;
  enemy.name = `enemy_${index}`;
  enemy.userData = { 
    id: index, 
    isAttacking: false, 
    attackType: null,
    originalColor: ENEMY_CONFIG.COLORS[index],
    originalPosition: enemy.position.clone()
  };

  return enemy;
};

export const animateEnemies = (enemies, time) => {
  const now = performance.now() / 1000; // temps en secondes

  enemies.forEach((enemy, i) => {
    if (!enemy) return;

    enemy.rotation.y = time * 0.5 + i;
    enemy.position.y = 1.2 + Math.sin(time * 2 + i) * 0.3;

    const originalPos = enemy.userData.originalPosition;

    if (enemy.userData.isAttacking) {
      const attackDuration = 1.2; // durée totale de l'attaque en secondes
      if (!enemy.userData.attackStartTime) {
        enemy.userData.attackStartTime = now; // init start time
      }
      const elapsed = now - enemy.userData.attackStartTime;

      if (elapsed <= attackDuration) {
        const t = elapsed / attackDuration;
        const lungeFactor = Math.sin(Math.PI * t); // va de 0 à 1 puis redescend à 0

        const direction = new THREE.Vector3(0, 0, 0).sub(originalPos).normalize();
        const offset = direction.multiplyScalar(3 * lungeFactor);

        enemy.position.x = originalPos.x + offset.x;
        enemy.position.z = originalPos.z + offset.z;

        const scale = 1 + 0.15 * lungeFactor;
        enemy.scale.set(scale, scale, scale);
      } else {
        // Fin de l'attaque : reset
        enemy.position.x = originalPos.x;
        enemy.position.z = originalPos.z;
        enemy.scale.set(1, 1, 1);
        enemy.userData.isAttacking = false;
        enemy.userData.attackStartTime = null;

        // Optionnel : reset couleurs, etc. selon ta logique
      }
    } else {
      enemy.position.x = originalPos.x;
      enemy.position.z = originalPos.z;
      enemy.scale.set(1, 1, 1);
    }
  });
};


export const highlightEnemyAttack = (enemy, attackType) => {
  const color = COLORS.ATTACK[attackType];
  console.log(attackType, color);
  enemy.material.color.setHex(color);
  enemy.material.emissive.setHex(color);
  enemy.material.emissiveIntensity = 0.5;
  enemy.userData.isAttacking = true;
  enemy.userData.attackType = attackType;
};


export const resetAllEnemies = (enemies) => {
    enemies.forEach(enemy => resetEnemyAppearance(enemy));
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
