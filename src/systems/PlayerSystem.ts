import * as THREE from 'three';
import { COLORS, PLAYER_CONFIG } from '../utils/Constants';

export const createPlayer = () => {
  // Par exemple une géométrie simple, tu peux changer la forme et détails
  const geometry = new THREE.BoxGeometry(2, 3, 1.5);

  const material = new THREE.MeshPhongMaterial({
    color: PLAYER_CONFIG.COLOR,
    emissive: PLAYER_CONFIG.COLOR,
    emissiveIntensity: 0.3,
    shininess: 120,
  });

  const player = new THREE.Mesh(geometry, material);

  player.position.set(0, 1.5, 0); // hauteur moitié box, au centre de la scène

  player.castShadow = true;
  player.name = 'player';

  player.userData = {
    isDefending: false,
    defenseType: null,
    originalColor: PLAYER_CONFIG.COLOR,
    originalPosition: player.position.clone(),
  };

  return player;
};

export const animatePlayer = (player, time) => {
  if (!player) return;

  // Rotation légère pour un effet vivant
  player.rotation.y = Math.sin(time) * 0.15;

  if (player.userData.isDefending) {
    // Effet visuel d’animation défense (pulsation couleur, scale)
    const colorPulse = Math.sin(time * 10) * 0.5 + 0.5;
    const defenseColor = COLORS.DEFENSE[player.userData.defenseType] || player.userData.originalColor;

    player.material.color.lerp(new THREE.Color(defenseColor), colorPulse);
    player.material.emissive.lerp(new THREE.Color(defenseColor), colorPulse);
    player.material.emissiveIntensity = 0.6;

    const scale = 1 + colorPulse * 0.15;
    player.scale.set(scale, scale, scale);
  } else {
    // Reset apparence normale
    player.material.color.setHex(player.userData.originalColor);
    player.material.emissive.setHex(player.userData.originalColor);
    player.material.emissiveIntensity = 0.3;
    player.scale.set(1, 1, 1);
  }
};

export const animateDodge = (player, dodgeAnimationRef) => {
  if (!player) return;
    

  // Annule l'animation précédente si elle existe
  if (dodgeAnimationRef.current) {
    cancelAnimationFrame(dodgeAnimationRef.current);
    // Remets à la position initiale pour éviter les décalages
    player.position.z = 0; // Ou la valeur initiale correcte si différente
  }

  const duration = 400; // durée en ms
  const dodgeDistance = 8; // négatif = arrière
  const initialZ = player.position.z; // ça sera 0 si reset juste avant
  const targetZ = initialZ + dodgeDistance;

  const startTime = performance.now();

  const animate = (now) => {
    const elapsed = now - startTime;
    const t = Math.min(elapsed / duration, 1);
    player.position.z = initialZ + (targetZ - initialZ) * Math.sin(t * Math.PI);

    if (t < 1) {
      dodgeAnimationRef.current = requestAnimationFrame(animate);
    } else {
      player.position.z = initialZ; // assure le retour précis
      dodgeAnimationRef.current = null;
    }
  };

  dodgeAnimationRef.current = requestAnimationFrame(animate);
};

export const highlightPlayerDefense = (player, defenseType) => {
  if (!player) return;
  
  const color = COLORS.DEFENSE[defenseType];
  if (!color) return;

  player.material.color.setHex(color);
  player.material.emissive.setHex(color);
  player.material.emissiveIntensity = 0.7;

  player.userData.isDefending = true;
  player.userData.defenseType = defenseType;
};

export const resetPlayerAppearance = (player) => {
  if (!player) return;

  player.material.color.setHex(player.userData.originalColor);
  player.material.emissive.setHex(player.userData.originalColor);
  player.material.emissiveIntensity = 0.3;

  player.userData.isDefending = false;
  player.userData.defenseType = null;
  player.scale.set(1, 1, 1);
  player.position.copy(player.userData.originalPosition);
};
