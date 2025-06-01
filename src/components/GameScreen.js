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
  const initializeScene = (gl) => {
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
      GAME_CONFIG.CAMERA.LOOK_AT.x,
      GAME_CONFIG.CAMERA.LOOK_AT.y,
      GAME_CONFIG.CAMERA.LOOK_AT.z
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
  };

  const setupLighting = (scene) => {
    // Lumière ambiante
    const ambientLight = new THREE.AmbientLight(0x404040, 0.6);
    scene.add(ambientLight);

    // Lumière directionnelle principale
    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
    directionalLight.position.set(5, 10, 5);
    directionalLight.castShadow = true;
    scene.add(directionalLight);

    // Lumière d'appoint
    const fillLight = new THREE.DirectionalLight(0x4ecdc4, 0.3);
    fillLight.position.set(-5, 5, -5);
    scene.add(fillLight);
  };

  const createGameObjects = (scene) => {
    // Sol/Arène
    const groundGeometry = new THREE.CircleGeometry(8, 32);
    const groundMaterial = new THREE.MeshLambertMaterial({ 
      color: 0x333333,
      transparent: true,
      opacity: 0.8
    });
    const ground = new THREE.Mesh(groundGeometry, groundMaterial);
    ground.rotation.x = -Math.PI / 2;
    ground.position.y = -0.1;
    scene.add(ground);

    // Grille de référence
    const gridHelper = new THREE.GridHelper(16, 16, 0x444444, 0x222222);
    gridHelper.position.y = -0.05;
    scene.add(gridHelper);

    // Joueur (cube bleu au centre)
    const playerGeometry = new THREE.BoxGeometry(
      GAME_CONFIG.PLAYER.SIZE,
      GAME_CONFIG.PLAYER.SIZE * 1.5,
      GAME_CONFIG.PLAYER.SIZE
    );
    const playerMaterial = new THREE.MeshLambertMaterial({ color: 0x4ecdc4 });
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
  };

  const createEnemies = (scene) => {
    const enemyShapes = [
      new THREE.ConeGeometry(0.6, 1.8, 6),      // Ennemi 1 - Cône rouge
      new THREE.SphereGeometry(0.8, 8, 6),      // Ennemi 2 - Sphère verte
      new THREE.CylinderGeometry(0.6, 0.6, 1.6, 8) // Ennemi 3 - Cylindre bleu
    ];

    const enemyColors = [0xff6b6b, 0x96ceb4, 0x45b7d1];
    const angleStep = (Math.PI * 2) / GAME_CONFIG.ENEMIES.MAX_COUNT;

    for (let i = 0; i < GAME_CONFIG.ENEMIES.MAX_COUNT; i++) {
      const geometry = enemyShapes[i];
      const material = new THREE.MeshLambertMaterial({ 
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
  };

  const startRenderLoop = () => {
    const animate = () => {
      animationFrameRef.current = requestAnimationFrame(animate);
      
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
      
      // Forcer le rendu GL
      rendererRef.current.getContext().endFrameEXP();
    };
    
    animate();
  };

  const animateEnemies = () => {
    if (!sceneRef.current) return;
    
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