import React, { useState, useRef, useEffect } from 'react';
import { View, StyleSheet, Dimensions } from 'react-native';
import { GLView } from 'expo-gl';
import { Renderer } from 'expo-three';
import * as THREE from 'three';
import GameUI from './GameUI';
import { GAME_CONFIG, DEFENSE_ACTIONS, GAME_STATES } from '../utils/Constants';
import GameEngine from '../engine/GameEngine';

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

const GameScreen = () => {
  const [gameState, setGameState] = useState({
    state: GAME_STATES.PLAYING,
    score: 0,
    health: 100,
    combo: 0
  });

  const gameEngineRef = useRef(null);
  const sceneRef = useRef(null);
  const rendererRef = useRef(null);
  const cameraRef = useRef(null);
  const animationFrameRef = useRef(null);

  // Initialisation de la scène 3D
  const initializeScene = async (gl) => {
    try {
      const renderer = new Renderer({ gl });
      renderer.setSize(screenWidth, screenHeight);
      renderer.setClearColor(0x1a1a1a, 1.0);
      rendererRef.current = renderer;

      // Créer la scène
      const scene = new THREE.Scene();
      sceneRef.current = scene;

      // Créer la caméra
      const camera = new THREE.PerspectiveCamera(
        GAME_CONFIG.CAMERA.FOV,
        screenWidth / screenHeight,
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
      
      cameraRef.current = camera;

      // Ajouter l'éclairage
      setupLighting(scene);

      // Créer les objets de base
      createGameObjects(scene);

      // Initialiser le moteur de jeu
      gameEngineRef.current = new GameEngine({
        scene,
        camera,
        renderer,
        onGameStateChange: handleGameStateChange
      });

      // Démarrer la boucle de rendu
      startRenderLoop();
      
      console.log('Scene initialized successfully');
    } catch (error) {
      console.error('Error initializing scene:', error);
    }
  };

  const setupLighting = (scene) => {
    try {
      // Lumière ambiante
      const ambientLight = new THREE.AmbientLight(0x404040, 0.6);
      scene.add(ambientLight);

      // Lumière directionnelle principale
      const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
      directionalLight.position.set(5, 10, 5);
      scene.add(directionalLight);

      // Lumière d'appoint
      const fillLight = new THREE.DirectionalLight(0x4ecdc4, 0.3);
      fillLight.position.set(-5, 5, -5);
      scene.add(fillLight);
      
      console.log('Lighting setup complete');
    } catch (error) {
      console.error('Error setting up lighting:', error);
    }
  };

  const createGameObjects = (scene) => {
    try {
      // Sol/Arène
      const groundGeometry = new THREE.CircleGeometry(8, 32);
      const groundMaterial = new THREE.MeshBasicMaterial({ 
        color: 0x333333,
        transparent: true,
        opacity: 0.8
      });
      const ground = new THREE.Mesh(groundGeometry, groundMaterial);
      ground.rotation.x = -Math.PI / 2;
      ground.position.y = -0.1;
      scene.add(ground);

      // Grille de référence (simplifié pour éviter les erreurs)
      const gridSize = 16;
      const gridDivisions = 16;
      const gridMaterial = new THREE.LineBasicMaterial({ color: 0x444444 });
      const gridGeometry = new THREE.BufferGeometry();
      
      // Créer une grille simple
      const positions = [];
      const halfSize = gridSize / 2;
      const step = gridSize / gridDivisions;
      
      // Lignes horizontales
      for (let i = 0; i <= gridDivisions; i++) {
        const y = i * step - halfSize;
        positions.push(-halfSize, 0, y);
        positions.push(halfSize, 0, y);
      }
      
      // Lignes verticales
      for (let i = 0; i <= gridDivisions; i++) {
        const x = i * step - halfSize;
        positions.push(x, 0, -halfSize);
        positions.push(x, 0, halfSize);
      }
      
      gridGeometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
      const grid = new THREE.LineSegments(gridGeometry, gridMaterial);
      grid.position.y = -0.05;
      scene.add(grid);

      // Joueur (cube bleu au centre)
      const playerGeometry = new THREE.BoxGeometry(
        GAME_CONFIG.PLAYER.SIZE,
        GAME_CONFIG.PLAYER.SIZE * 1.5,
        GAME_CONFIG.PLAYER.SIZE
      );
      const playerMaterial = new THREE.MeshBasicMaterial({ color: 0x4ecdc4 });
      const player = new THREE.Mesh(playerGeometry, playerMaterial);
      player.position.set(
        GAME_CONFIG.PLAYER.POSITION.x,
        GAME_CONFIG.PLAYER.SIZE * 0.75,
        GAME_CONFIG.PLAYER.POSITION.z
      );
      player.name = 'player';
      scene.add(player);

      // Ennemis (formes géométriques temporaires)
      createEnemies(scene);
      
      console.log('Game objects created successfully');
    } catch (error) {
      console.error('Error creating game objects:', error);
    }
  };

  const createEnemies = (scene) => {
    try {
      const enemyColors = [0xff6b6b, 0x96ceb4, 0x45b7d1];
      const angleStep = (Math.PI * 2) / GAME_CONFIG.ENEMIES.MAX_COUNT;

      for (let i = 0; i < GAME_CONFIG.ENEMIES.MAX_COUNT; i++) {
        let geometry;
        
        // Créer différentes géométries pour chaque ennemi
        switch (i) {
          case 0:
            geometry = new THREE.ConeGeometry(0.6, 1.8, 6);
            break;
          case 1:
            geometry = new THREE.SphereGeometry(0.8, 8, 6);
            break;
          case 2:
            geometry = new THREE.CylinderGeometry(0.6, 0.6, 1.6, 8);
            break;
          default:
            geometry = new THREE.BoxGeometry(1, 1, 1);
        }
        
        const material = new THREE.MeshBasicMaterial({ 
          color: enemyColors[i],
          transparent: true,
          opacity: 0.9
        });
        
        const enemy = new THREE.Mesh(geometry, material);
        
        // Positionner en arc de cercle face au joueur
        const angle = angleStep * i - Math.PI / 2; // Centrer l'arc
        const radius = GAME_CONFIG.ENEMIES.SPAWN_RADIUS;
        
        enemy.position.set(
          Math.cos(angle) * radius,
          GAME_CONFIG.ENEMIES.SIZE * 0.8,
          Math.sin(angle) * radius
        );
        
        enemy.name = `enemy_${i}`;
        enemy.userData = { 
          id: i, 
          isAttacking: false, 
          attackType: null,
          originalColor: enemyColors[i]
        };
        
        scene.add(enemy);
      }
      
      console.log('Enemies created successfully');
    } catch (error) {
      console.error('Error creating enemies:', error);
    }
  };

  const startRenderLoop = () => {
    const animate = () => {
      animationFrameRef.current = requestAnimationFrame(animate);
      
      try {
        // Mettre à jour le moteur de jeu
        if (gameEngineRef.current) {
          gameEngineRef.current.update();
        }
        
        // Animation basique des ennemis
        animateEnemies();
        
        // Rendu de la scène
        if (rendererRef.current && sceneRef.current && cameraRef.current) {
          rendererRef.current.render(sceneRef.current, cameraRef.current);
        }
        
        // Forcer le rendu GL pour Expo
        if (rendererRef.current && rendererRef.current.getContext && rendererRef.current.getContext().endFrameEXP) {
          rendererRef.current.getContext().endFrameEXP();
        }
      } catch (error) {
        console.error('Error in render loop:', error);
      }
    };
    
    animate();
  };

  const animateEnemies = () => {
    if (!sceneRef.current) return;
    
    try {
      const time = Date.now() * 0.001;
      
      for (let i = 0; i < GAME_CONFIG.ENEMIES.MAX_COUNT; i++) {
        const enemy = sceneRef.current.getObjectByName(`enemy_${i}`);
        if (enemy) {
          // Rotation lente
          enemy.rotation.y = time * 0.5 + i;
          
          // Mouvement vertical subtil
          enemy.position.y = GAME_CONFIG.ENEMIES.SIZE * 0.8 + 
                            Math.sin(time * 2 + i) * 0.2;
        }
      }
    } catch (error) {
      console.error('Error animating enemies:', error);
    }
  };

  const handleGameStateChange = (newState) => {
    setGameState(newState);
  };

  const handleDodge = () => {
    if (gameEngineRef.current && gameState.state === GAME_STATES.PLAYING) {
      gameEngineRef.current.handlePlayerAction(DEFENSE_ACTIONS.DODGE);
    }
  };

  const handleParry = () => {
    if (gameEngineRef.current && gameState.state === GAME_STATES.PLAYING) {
      gameEngineRef.current.handlePlayerAction(DEFENSE_ACTIONS.PARRY);
    }
  };

  // Nettoyage à la destruction du composant
  useEffect(() => {
    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
      if (gameEngineRef.current) {
        gameEngineRef.current.destroy();
      }
    };
  }, []);

  return (
    <View style={styles.container}>
      <GLView
        style={styles.glView}
        onContextCreate={initializeScene}
      />
      
      <GameUI
        score={gameState.score}
        health={gameState.health}
        combo={gameState.combo}
        gameState={gameState.state}
        onDodge={handleDodge}
        onParry={handleParry}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  glView: {
    flex: 1,
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
});

export default GameScreen;