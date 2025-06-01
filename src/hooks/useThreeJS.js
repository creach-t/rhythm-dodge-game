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
import { attackPhaseService } from '../services/AttackPhaseService';
import { playerAnimationService } from '../services/PlayerAnimationService';

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

/**
 * Hook personnalisé pour gérer la scène 3D et le rendu - AVEC ANIMATIONS JOUEUR
 * Responsabilité unique : Three.js (scène, caméra, renderer, objets 3D, animations)
 */
export const useThreeJS = () => {
  const sceneRef = useRef(null);
  const rendererRef = useRef(null);
  const cameraRef = useRef(null);
  const enemiesRef = useRef([]);
  const playerRef = useRef(null);

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
      
      // Créer et ajouter le joueur
      const player = createPlayer();
      scene.add(player);
      playerRef.current = player;
      
      // Initialiser le service d'animation du joueur
      playerAnimationService.initialize(player);

      // Créer les ennemis
      const enemies = [];
      for (let i = 0; i < ENEMY_CONFIG.MAX_COUNT; i++) {
        const enemy = createEnemy(i, ENEMY_CONFIG.MAX_COUNT, ENEMY_CONFIG.SPAWN_RADIUS);
        scene.add(enemy);
        enemies.push(enemy);
      }
      enemiesRef.current = enemies;

      console.log('Scene initialized with', scene.children.length, 'objects');
      
      return { scene, camera, renderer: gameRenderer, enemies, player };
      
    } catch (error) {
      console.error('Error initializing scene:', error);
      throw error;
    }
  }, []);

  // Effectuer le rendu d'une frame - AVEC ANIMATIONS JOUEUR
  const renderFrame = useCallback((time) => {
    try {
      // Animer les ennemis avec leurs phases d'attaque
      if (enemiesRef.current.length > 0) {
        animateEnemies(enemiesRef.current, time);
        attackPhaseService.animateAttackingEnemies(enemiesRef.current, time);
      }
      
      // Animer le joueur
      if (playerRef.current) {
        const animState = playerAnimationService.getAnimationState();
        
        if (animState.isAnimating) {
          // Animation d'action en cours
          playerAnimationService.animatePlayer(time);
        } else {
          // Animation d'attente par défaut
          playerAnimationService.animateIdle(time);
        }
      }
      
      // Rendu de la scène
      if (rendererRef.current && sceneRef.current && cameraRef.current) {
        rendererRef.current.render(sceneRef.current, cameraRef.current);
      }
    } catch (error) {
      console.error('Error in render frame:', error);
    }
  }, []);

  // Déclencher l'animation d'esquive
  const triggerDodgeAnimation = useCallback(() => {
    playerAnimationService.startDodgeAnimation('right', 800);
  }, []);

  // Déclencher l'animation de parade
  const triggerParryAnimation = useCallback(() => {
    playerAnimationService.startParryAnimation(600);
  }, []);

  // Déclencher l'animation de soin
  const triggerHealAnimation = useCallback(() => {
    playerAnimationService.startHealAnimation(1000);
  }, []);

  // Déclencher l'animation d'attaque
  const triggerAttackAnimation = useCallback(() => {
    playerAnimationService.startAttackAnimation(700);
  }, []);

  // Obtenir un ennemi par son ID
  const getEnemy = useCallback((enemyId) => {
    return enemiesRef.current[enemyId] || null;
  }, []);

  // Obtenir tous les ennemis
  const getAllEnemies = useCallback(() => {
    return enemiesRef.current;
  }, []);

  // Obtenir le joueur
  const getPlayer = useCallback(() => {
    return playerRef.current;
  }, []);

  // Obtenir un objet de la scène par son nom
  const getSceneObject = useCallback((name) => {
    return sceneRef.current?.getObjectByName(name) || null;
  }, []);

  // Nettoyer les ressources
  const dispose = useCallback(() => {
    try {
      // Nettoyer les services d'animation
      playerAnimationService.dispose();
      attackPhaseService.cancelAllAttacks();
      
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
      playerRef.current = null;
      
      console.log('Three.js resources disposed');
    } catch (error) {
      console.error('Error disposing Three.js resources:', error);
    }
  }, []);

  // Getters pour accès aux refs
  const getScene = useCallback(() => sceneRef.current, []);
  const getCamera = useCallback(() => cameraRef.current, []);
  const getRenderer = useCallback(() => rendererRef.current, []);

  // Obtenir l'état d'animation du joueur
  const getPlayerAnimationState = useCallback(() => {
    return playerAnimationService.getAnimationState();
  }, []);

  // Arrêter toutes les animations du joueur
  const stopPlayerAnimations = useCallback(() => {
    playerAnimationService.stopAllAnimations();
  }, []);

  return {
    // Actions
    initializeScene,
    renderFrame,
    dispose,
    
    // Animations du joueur
    triggerDodgeAnimation,
    triggerParryAnimation,
    triggerHealAnimation,
    triggerAttackAnimation,
    stopPlayerAnimations,
    
    // Accesseurs
    getEnemy,
    getAllEnemies,
    getPlayer,
    getSceneObject,
    getScene,
    getCamera,
    getRenderer,
    getPlayerAnimationState,
    
    // Refs (pour usage avancé si nécessaire)
    sceneRef,
    rendererRef,
    cameraRef,
    enemiesRef,
    playerRef
  };
};