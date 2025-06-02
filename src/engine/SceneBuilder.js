import * as THREE from 'three';

/**
 * Module pour construire et configurer la scène 3D
 */
export class SceneBuilder {
  /**
   * Crée et configure une nouvelle scène
   */
  static createScene() {
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x1a1a1a);
    scene.fog = new THREE.Fog(0x1a1a1a, 5, 20);
    return scene;
  }

  /**
   * Crée et configure la caméra
   */
  static createCamera(width, height) {
    const camera = new THREE.PerspectiveCamera(75, width / height, 0.1, 1000);
    camera.position.set(0, 5, 8);
    camera.lookAt(0, 0, 0);
    return camera;
  }

  /**
   * Configure l'éclairage de la scène
   */
  static setupLighting(scene) {
    // Lumière ambiante
    const ambientLight = new THREE.AmbientLight(0x404040, 0.5);
    scene.add(ambientLight);

    // Lumière directionnelle principale
    const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
    directionalLight.position.set(5, 10, 5);
    directionalLight.castShadow = true;
    directionalLight.shadow.camera.near = 0.1;
    directionalLight.shadow.camera.far = 50;
    directionalLight.shadow.camera.left = -10;
    directionalLight.shadow.camera.right = 10;
    directionalLight.shadow.camera.top = 10;
    directionalLight.shadow.camera.bottom = -10;
    scene.add(directionalLight);

    // Lumière point pour l'ambiance
    const pointLight = new THREE.PointLight(0x00ffff, 0.5, 10);
    pointLight.position.set(0, 3, 0);
    scene.add(pointLight);
  }

  /**
   * Crée le sol
   */
  static createGround() {
    const geometry = new THREE.PlaneGeometry(20, 20);
    const material = new THREE.MeshPhongMaterial({
      color: 0x222222,
      emissive: 0x111111,
      shininess: 30
    });
    const ground = new THREE.Mesh(geometry, material);
    ground.rotation.x = -Math.PI / 2;
    ground.receiveShadow = true;
    return ground;
  }

  /**
   * Crée la grille
   */
  static createGrid() {
    const size = 20;
    const divisions = 20;
    const colorCenterLine = 0x444444;
    const colorGrid = 0x333333;
    const grid = new THREE.GridHelper(size, divisions, colorCenterLine, colorGrid);
    grid.position.y = 0.01;
    return grid;
  }

  /**
   * Crée des éléments décoratifs
   */
  static createDecorations() {
    const group = new THREE.Group();
    
    // Piliers aux coins
    const pillarGeometry = new THREE.CylinderGeometry(0.3, 0.3, 3);
    const pillarMaterial = new THREE.MeshPhongMaterial({
      color: 0x666666,
      emissive: 0x222222
    });
    
    const positions = [
      { x: -8, z: -8 },
      { x: 8, z: -8 },
      { x: -8, z: 8 },
      { x: 8, z: 8 }
    ];
    
    positions.forEach(pos => {
      const pillar = new THREE.Mesh(pillarGeometry, pillarMaterial);
      pillar.position.set(pos.x, 1.5, pos.z);
      pillar.castShadow = true;
      group.add(pillar);
    });
    
    return group;
  }

  /**
   * Crée des particules d'ambiance
   */
  static createParticles() {
    const particlesGeometry = new THREE.BufferGeometry();
    const particleCount = 100;
    const positions = new Float32Array(particleCount * 3);
    
    for (let i = 0; i < particleCount * 3; i += 3) {
      positions[i] = (Math.random() - 0.5) * 20;
      positions[i + 1] = Math.random() * 10;
      positions[i + 2] = (Math.random() - 0.5) * 20;
    }
    
    particlesGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    
    const particlesMaterial = new THREE.PointsMaterial({
      color: 0x00ffff,
      size: 0.05,
      transparent: true,
      opacity: 0.6
    });
    
    return new THREE.Points(particlesGeometry, particlesMaterial);
  }
}

// Exports pour compatibilité avec l'ancien code
export const setupScene = SceneBuilder.createScene;
export const setupCamera = SceneBuilder.createCamera;
export const setupLighting = SceneBuilder.setupLighting;
export const createGround = SceneBuilder.createGround;
export const createGrid = SceneBuilder.createGrid;