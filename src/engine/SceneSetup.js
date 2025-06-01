import * as THREE from 'three';
import { GAME_CONFIG } from '../utils/Constants';

export const setupScene = () => {
  const scene = new THREE.Scene();
  scene.fog = new THREE.Fog(0x1a1a1a, 20, 50);
  return scene;
};

export const setupCamera = (width, height) => {
  const camera = new THREE.PerspectiveCamera(
    GAME_CONFIG.CAMERA.FOV,
    width / height,
    GAME_CONFIG.CAMERA.NEAR,
    GAME_CONFIG.CAMERA.FAR
  );
  
  camera.position.set(
    GAME_CONFIG.CAMERA.POSITION.x,
    GAME_CONFIG.CAMERA.POSITION.y,
    GAME_CONFIG.CAMERA.POSITION.z
  );
  
  camera.lookAt(
    new THREE.Vector3(
      GAME_CONFIG.CAMERA.LOOK_AT.x,
      GAME_CONFIG.CAMERA.LOOK_AT.y,
      GAME_CONFIG.CAMERA.LOOK_AT.z
    )
  );
  
  return camera;
};

export const setupLighting = (scene) => {
  // Lumière ambiante
  const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
  scene.add(ambientLight);

  // Lumière directionnelle principale
  const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
  directionalLight.position.set(5, 10, 5);
  directionalLight.castShadow = true;
  scene.add(directionalLight);

  // Lumière d'appoint
  const fillLight = new THREE.DirectionalLight(0x4ecdc4, 0.4);
  fillLight.position.set(-5, 5, -5);
  scene.add(fillLight);
};

export const createGround = () => {
  const groundGeometry = new THREE.CircleGeometry(15, 32);
  const groundMaterial = new THREE.MeshPhongMaterial({ 
    color: 0x333333,
    emissive: 0x111111,
    shininess: 10
  });
  const ground = new THREE.Mesh(groundGeometry, groundMaterial);
  ground.rotation.x = -Math.PI / 2;
  ground.position.y = -0.1;
  ground.receiveShadow = true;
  ground.name = 'ground';
  return ground;
};

export const createGrid = () => {
  const gridSize = 20;
  const gridDivisions = 20;
  const gridHelper = new THREE.GridHelper(gridSize, gridDivisions, 0x666666, 0x444444);
  gridHelper.position.y = 0.01;
  return gridHelper;
};

export const createPlayer = () => {
  const playerGeometry = new THREE.BoxGeometry(
    GAME_CONFIG.PLAYER.SIZE,
    GAME_CONFIG.PLAYER.SIZE * 1.5,
    GAME_CONFIG.PLAYER.SIZE
  );
  const playerMaterial = new THREE.MeshPhongMaterial({ 
    color: 0x4ecdc4,
    emissive: 0x2a7a7a,
    shininess: 100
  });
  const player = new THREE.Mesh(playerGeometry, playerMaterial);
  player.position.set(
    GAME_CONFIG.PLAYER.POSITION.x,
    GAME_CONFIG.PLAYER.SIZE * 0.75,
    GAME_CONFIG.PLAYER.POSITION.z
  );
  player.castShadow = true;
  player.name = 'player';
  return player;
};