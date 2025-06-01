import { useRef, useCallback } from 'react';
import { Dimensions } from 'react-native';
import { GameRenderer } from '../engine/GameRenderer';
import { 
  setupScene, 
  setupCamera, 
  setupLighting, 
  createGround, 
  createGrid, 
  createPlayer 
} from '../engine/SceneSetup';
import { createEnemy, animateEnemies } from '../systems/EnemySystem';
import { ENEMY_CONFIG } from '../utils/Constants';

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

/**
 * Hook personnalisé pour gérer la scène 3D et le rendu
 * Responsabilité unique : Three.js (scène, caméra, renderer, objets 3D)
 */
export const useThreeJS = () => {
  const sceneRef = useRef(null);
  const rendererRef = useRef(null);
  const cameraRef = useRef(null);
  const enemiesRef = useRef([]);

  // Initialiser la scène 3D
  const initializeScene = useCallback(async (gl) => {
    try {
      console.log('Initializing 3D scene...');
      
      // Créer le renderer
      const gameRenderer = new GameRenderer(gl, screenWidth, screenHeight);
      rendererRef.current = gameRenderer;

      // Créer la scène et la caméra
      const scene = setupScene();
      const camera = setupCamera(screenWidth, screenHeight);
      
      sceneRef.current = scene;
      cameraRef.current = camera;

      // Ajouter l'éclairage
      setupLighting(scene);

      // Créer les objets de la scène
      scene.add(createGround());
      scene.add(createGrid());
      scene.add(createPlayer());

      // Créer les ennemis
      const enemies = [];
      for (let i = 0; i < ENEMY_CONFIG.MAX_COUNT; i++) {
        const enemy = createEnemy(i, ENEMY_CONFIG.MAX_COUNT, ENEMY_CONFIG.SPAWN_RADIUS);
        scene.add(enemy);
        enemies.push(enemy);
      }
      enemiesRef.current = enemies;

      console.log('Scene initialized with', scene.children.length, 'objects');
      
      return { scene, camera, renderer: gameRenderer, enemies };
      
    } catch (error) {
      console.error('Error initializing scene:', error);
      throw error;
    }
  }, []);

  // Effectuer le rendu d'une frame
  const renderFrame = useCallback((time) => {
    try {
      // Animer les ennemis
      if (enemiesRef.current.length > 0) {
        animateEnemies(enemiesRef.current, time);
      }
      
      // Rendu de la scène
      if (rendererRef.current && sceneRef.current && cameraRef.current) {
        rendererRef.current.render(sceneRef.current, cameraRef.current);
      }
    } catch (error) {
      console.error('Error in render frame:', error);
    }
  }, []);

  // Obtenir un ennemi par son ID
  const getEnemy = useCallback((enemyId) => {
    return enemiesRef.current[enemyId] || null;
  }, []);

  // Obtenir tous les ennemis
  const getAllEnemies = useCallback(() => {
    return enemiesRef.current;
  }, []);

  // Obtenir un objet de la scène par son nom
  const getSceneObject = useCallback((name) => {
    return sceneRef.current?.getObjectByName(name) || null;
  }, []);

  // Nettoyer les ressources
  const dispose = useCallback(() => {
    try {
      if (rendererRef.current) {
        rendererRef.current.dispose();
        rendererRef.current = null;
      }
      
      // Nettoyer la scène
      if (sceneRef.current) {
        sceneRef.current.traverse((object) => {
          if (object.geometry) {
            object.geometry.dispose();
          }
          if (object.material) {
            if (Array.isArray(object.material)) {
              object.material.forEach(material => material.dispose());
            } else {
              object.material.dispose();
            }
          }
        });
        sceneRef.current = null;
      }
      
      cameraRef.current = null;
      enemiesRef.current = [];
      
      console.log('Three.js resources disposed');
    } catch (error) {
      console.error('Error disposing Three.js resources:', error);
    }
  }, []);

  // Getters pour accès aux refs
  const getScene = useCallback(() => sceneRef.current, []);
  const getCamera = useCallback(() => cameraRef.current, []);
  const getRenderer = useCallback(() => rendererRef.current, []);

  return {
    // Actions
    initializeScene,
    renderFrame,
    dispose,
    
    // Accesseurs
    getEnemy,
    getAllEnemies,
    getSceneObject,
    getScene,
    getCamera,
    getRenderer,
    
    // Refs (pour usage avancé si nécessaire)
    sceneRef,
    rendererRef,
    cameraRef,
    enemiesRef
  };
};