import React, { useState, useRef, useEffect } from 'react';
import { View, StyleSheet, Dimensions } from 'react-native';
import { GLView } from 'expo-gl';
import { Renderer } from 'expo-three';
import * as THREE from 'three';
import GameUI from './GameUI';
import { GAME_CONFIG, DEFENSE_ACTIONS, GAME_STATES } from '../utils/Constants';

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

const GameScreen = () => {
  const [gameState, setGameState] = useState({
    state: GAME_STATES.PLAYING,
    score: 0,
    health: 100,
    combo: 0
  });

  const sceneRef = useRef(null);
  const rendererRef = useRef(null);
  const cameraRef = useRef(null);
  const animationFrameRef = useRef(null);
  const enemiesRef = useRef([]);

  // État du jeu simplifié
  const gameLogicRef = useRef({
    currentRound: 1,
    awaitingAction: false,
    expectedAction: null,
    attackStartTime: 0
  });

  // Initialisation de la scène 3D
  const initializeScene = async (gl) => {
    try {
      console.log('Initializing 3D scene...');
      console.log('Screen dimensions:', screenWidth, 'x', screenHeight);
      
      const renderer = new Renderer({ gl });
      renderer.setSize(screenWidth, screenHeight);
      renderer.setClearColor(0x1a1a1a, 1.0);
      rendererRef.current = renderer;

      // Créer la scène
      const scene = new THREE.Scene();
      sceneRef.current = scene;

      // Créer la caméra avec aspect ratio portrait
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
      console.log('Camera position:', camera.position);
      console.log('Camera aspect:', camera.aspect);

      // Ajouter l'éclairage
      setupLighting(scene);

      // Créer les objets de base
      createGameObjects(scene);

      // Debug: Afficher le nombre d'objets dans la scène
      console.log('Scene children count:', scene.children.length);
      scene.children.forEach((child, index) => {
        console.log(`Child ${index}:`, child.type, child.name || 'unnamed', child.position);
      });

      // Démarrer la boucle de rendu
      startRenderLoop();

      // Démarrer le gameplay simple après 2 secondes
      setTimeout(() => {
        startSimpleGameplay();
      }, 2000);
      
      console.log('Scene initialized successfully');
    } catch (error) {
      console.error('Error initializing scene:', error);
    }
  };

  const setupLighting = (scene) => {
    try {
      // Lumière ambiante plus forte pour voir les objets
      const ambientLight = new THREE.AmbientLight(0x404040, 1.0);
      scene.add(ambientLight);

      // Lumière directionnelle principale
      const directionalLight = new THREE.DirectionalLight(0xffffff, 1.0);
      directionalLight.position.set(5, 10, 5);
      scene.add(directionalLight);

      // Lumière d'appoint
      const fillLight = new THREE.DirectionalLight(0x4ecdc4, 0.5);
      fillLight.position.set(-5, 5, -5);
      scene.add(fillLight);
      
      console.log('Lighting setup complete');
    } catch (error) {
      console.error('Error setting up lighting:', error);
    }
  };

  const createGameObjects = (scene) => {
    try {
      // Sol/Arène plus grand
      const groundGeometry = new THREE.CircleGeometry(10, 32);
      const groundMaterial = new THREE.MeshBasicMaterial({ 
        color: 0x333333,
        transparent: true,
        opacity: 0.8
      });
      const ground = new THREE.Mesh(groundGeometry, groundMaterial);
      ground.rotation.x = -Math.PI / 2;
      ground.position.y = -0.1;
      ground.name = 'ground';
      scene.add(ground);

      // Grille de référence plus visible
      const gridSize = 20;
      const gridDivisions = 20;
      const gridMaterial = new THREE.LineBasicMaterial({ color: 0x666666 });
      const gridGeometry = new THREE.BufferGeometry();
      
      const positions = [];
      const halfSize = gridSize / 2;
      const step = gridSize / gridDivisions;
      
      // Lignes horizontales
      for (let i = 0; i <= gridDivisions; i++) {
        const z = i * step - halfSize;
        positions.push(-halfSize, 0, z);
        positions.push(halfSize, 0, z);
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
      grid.name = 'grid';
      scene.add(grid);

      // Joueur (cube bleu au centre) - Plus grand et plus visible
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
      console.log('Player created at position:', player.position);

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
      const enemies = [];

      for (let i = 0; i < GAME_CONFIG.ENEMIES.MAX_COUNT; i++) {
        let geometry;
        
        // Créer différentes géométries pour chaque ennemi - Plus grosses
        switch (i) {
          case 0:
            geometry = new THREE.ConeGeometry(1.0, 2.5, 8);
            break;
          case 1:
            geometry = new THREE.SphereGeometry(1.2, 12, 8);
            break;
          case 2:
            geometry = new THREE.CylinderGeometry(1.0, 1.0, 2.2, 12);
            break;
          default:
            geometry = new THREE.BoxGeometry(1.5, 1.5, 1.5);
        }
        
        const material = new THREE.MeshBasicMaterial({ 
          color: enemyColors[i],
          transparent: false,
          opacity: 1.0
        });
        
        const enemy = new THREE.Mesh(geometry, material);
        
        // Positionner en arc de cercle face au joueur - Plus proches
        const angle = angleStep * i - Math.PI / 2;
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
        enemies.push(enemy);
        console.log(`Enemy ${i} created at position:`, enemy.position, 'color:', enemyColors[i].toString(16));
      }
      
      enemiesRef.current = enemies;
      console.log('All enemies created successfully');
    } catch (error) {
      console.error('Error creating enemies:', error);
    }
  };

  const startSimpleGameplay = () => {
    console.log('Starting simple gameplay...');
    
    // Démarrer une attaque simple après 1 seconde
    setTimeout(() => {
      triggerRandomAttack();
    }, 1000);
  };

  const triggerRandomAttack = () => {
    if (gameLogicRef.current.awaitingAction) return;
    
    try {
      const enemyId = Math.floor(Math.random() * GAME_CONFIG.ENEMIES.MAX_COUNT);
      const attackTypes = ['normal', 'heavy', 'feint'];
      const attackType = attackTypes[Math.floor(Math.random() * attackTypes.length)];
      
      console.log(`Triggering ${attackType} attack from enemy ${enemyId}`);
      
      const enemy = enemiesRef.current[enemyId];
      if (enemy) {
        // Changer la couleur pour indiquer l'attaque
        let highlightColor;
        switch (attackType) {
          case 'normal':
            highlightColor = 0xffd93d; // Jaune pour esquive
            gameLogicRef.current.expectedAction = DEFENSE_ACTIONS.DODGE;
            break;
          case 'heavy':
            highlightColor = 0x45b7d1; // Bleu pour parade
            gameLogicRef.current.expectedAction = DEFENSE_ACTIONS.PARRY;
            break;
          case 'feint':
            highlightColor = 0xff6b6b; // Rouge pour ne rien faire
            gameLogicRef.current.expectedAction = DEFENSE_ACTIONS.NONE;
            break;
          default:
            highlightColor = enemy.userData.originalColor;
        }
        
        enemy.material.color.setHex(highlightColor);
        enemy.userData.isAttacking = true;
        enemy.userData.attackType = attackType;
        
        gameLogicRef.current.awaitingAction = true;
        gameLogicRef.current.attackStartTime = Date.now();
        
        console.log(`Attack highlighted! Expected action: ${gameLogicRef.current.expectedAction}`);
        
        // Timeout après 3 secondes
        setTimeout(() => {
          if (gameLogicRef.current.awaitingAction) {
            handleMissedAction();
          }
        }, 3000);
      }
    } catch (error) {
      console.error('Error triggering attack:', error);
    }
  };

  const handleMissedAction = () => {
    console.log('Player missed the action!');
    resetAttackState();
    updateScore(-25);
    
    // Programmer la prochaine attaque
    setTimeout(() => {
      triggerRandomAttack();
    }, 2000);
  };

  const resetAttackState = () => {
    try {
      // Remettre tous les ennemis à leur couleur originale
      enemiesRef.current.forEach(enemy => {
        if (enemy && enemy.userData) {
          enemy.material.color.setHex(enemy.userData.originalColor);
          enemy.userData.isAttacking = false;
          enemy.userData.attackType = null;
        }
      });
      
      gameLogicRef.current.awaitingAction = false;
      gameLogicRef.current.expectedAction = null;
    } catch (error) {
      console.error('Error resetting attack state:', error);
    }
  };

  const updateScore = (points) => {
    setGameState(prevState => ({
      ...prevState,
      score: Math.max(0, prevState.score + points),
      combo: points > 0 ? prevState.combo + 1 : 0
    }));
  };

  const startRenderLoop = () => {
    const animate = () => {
      animationFrameRef.current = requestAnimationFrame(animate);
      
      try {
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
    if (enemiesRef.current.length === 0) return;
    
    try {
      const time = Date.now() * 0.001;
      
      enemiesRef.current.forEach((enemy, i) => {
        if (enemy) {
          // Rotation lente
          enemy.rotation.y = time * 0.5 + i;
          
          // Mouvement vertical subtil
          enemy.position.y = GAME_CONFIG.ENEMIES.SIZE * 0.8 + 
                            Math.sin(time * 2 + i) * 0.3;
        }
      });
    } catch (error) {
      console.error('Error animating enemies:', error);
    }
  };

  const handleDodge = () => {
    console.log('Dodge button pressed');
    if (gameLogicRef.current.awaitingAction) {
      handlePlayerAction(DEFENSE_ACTIONS.DODGE);
    }
  };

  const handleParry = () => {
    console.log('Parry button pressed');
    if (gameLogicRef.current.awaitingAction) {
      handlePlayerAction(DEFENSE_ACTIONS.PARRY);
    }
  };

  const handlePlayerAction = (action) => {
    if (!gameLogicRef.current.awaitingAction) return;
    
    console.log(`Player action: ${action}, expected: ${gameLogicRef.current.expectedAction}`);
    
    const isCorrect = action === gameLogicRef.current.expectedAction;
    const timeTaken = Date.now() - gameLogicRef.current.attackStartTime;
    
    let points = 0;
    let message = '';
    
    if (isCorrect) {
      if (timeTaken < 1000) {
        points = 100;
        message = 'PARFAIT!';
      } else {
        points = 50;
        message = 'Bien!';
      }
    } else {
      points = -50;
      message = 'Mauvaise action!';
    }
    
    console.log(`Action result: ${message} (${points} points)`);
    
    resetAttackState();
    updateScore(points);
    
    // Programmer la prochaine attaque
    setTimeout(() => {
      triggerRandomAttack();
    }, 1500);
  };

  // Nettoyage à la destruction du composant
  useEffect(() => {
    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
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