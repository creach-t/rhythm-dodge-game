import React, { useState, useRef, useEffect } from 'react';
import { View, StyleSheet, Dimensions } from 'react-native';
import { GLView } from 'expo-gl';
import { Renderer } from 'expo-three';
import * as THREE from 'three';
import GameUI from './GameUI';
import { GAME_CONFIG, GAME_STATES } from '../utils/Constants';
import { 
  setupScene, 
  setupCamera, 
  setupLighting, 
  createGround, 
  createGrid, 
  createPlayer 
} from '../engine/SceneSetup';
import { 
  createEnemy, 
  animateEnemies, 
  highlightEnemyAttack, 
  resetEnemyAppearance,
  DEFENSE_ACTIONS 
} from '../systems/EnemySystem';
import { GameLogic } from '../systems/GameLogic';

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
  const gameLogic = useRef(new GameLogic());

  // Initialisation de la scène 3D
  const initializeScene = async (gl) => {
    try {
      console.log('Initializing 3D scene...');
      
      // Créer le renderer
      const renderer = new Renderer({ gl });
      renderer.setSize(screenWidth, screenHeight);
      renderer.setClearColor(0x1a1a1a, 1.0);
      rendererRef.current = renderer;

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
      for (let i = 0; i < GAME_CONFIG.ENEMIES.MAX_COUNT; i++) {
        const enemy = createEnemy(i, GAME_CONFIG.ENEMIES.MAX_COUNT, GAME_CONFIG.ENEMIES.SPAWN_RADIUS);
        scene.add(enemy);
        enemies.push(enemy);
      }
      enemiesRef.current = enemies;

      console.log('Scene initialized with', scene.children.length, 'objects');

      // Démarrer la boucle de rendu
      startRenderLoop();

      // Démarrer le gameplay
      setTimeout(() => startGameplay(), 2000);
      
    } catch (error) {
      console.error('Error initializing scene:', error);
    }
  };

  const startRenderLoop = () => {
    const animate = () => {
      animationFrameRef.current = requestAnimationFrame(animate);
      
      try {
        const time = Date.now() * 0.001;
        
        // Animer les ennemis
        if (enemiesRef.current.length > 0) {
          animateEnemies(enemiesRef.current, time);
        }
        
        // Rendu de la scène
        if (rendererRef.current && sceneRef.current && cameraRef.current) {
          rendererRef.current.render(sceneRef.current, cameraRef.current);
        }
        
        // Forcer le rendu GL pour Expo
        const gl = rendererRef.current?.getContext();
        if (gl && gl.endFrameEXP) {
          gl.endFrameEXP();
        }
      } catch (error) {
        console.error('Error in render loop:', error);
      }
    };
    
    animate();
  };

  const startGameplay = () => {
    console.log('Starting gameplay...');
    setTimeout(() => triggerRandomAttack(), 1000);
  };

  const triggerRandomAttack = () => {
    if (gameLogic.current.awaitingAction) return;
    
    try {
      const enemyId = Math.floor(Math.random() * GAME_CONFIG.ENEMIES.MAX_COUNT);
      const attackType = gameLogic.current.getRandomAttack();
      
      console.log(`Enemy ${enemyId} attacks with ${attackType}`);
      
      const enemy = enemiesRef.current[enemyId];
      if (enemy && gameLogic.current.triggerAttack(enemyId, attackType)) {
        highlightEnemyAttack(enemy, attackType);
        
        // Timeout après 3 secondes
        setTimeout(() => {
          if (gameLogic.current.awaitingAction) {
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
    resetAllEnemies();
    updateScore(-25);
    gameLogic.current.reset();
    
    setTimeout(() => triggerRandomAttack(), 2000);
  };

  const resetAllEnemies = () => {
    enemiesRef.current.forEach(enemy => resetEnemyAppearance(enemy));
  };

  const updateScore = (points) => {
    setGameState(prevState => ({
      ...prevState,
      score: Math.max(0, prevState.score + points),
      combo: points > 0 ? prevState.combo + 1 : 0
    }));
  };

  const handleDodge = () => {
    handlePlayerAction(DEFENSE_ACTIONS.DODGE);
  };

  const handleParry = () => {
    handlePlayerAction(DEFENSE_ACTIONS.PARRY);
  };

  const handlePlayerAction = (action) => {
    const result = gameLogic.current.checkPlayerAction(action);
    if (!result) return;
    
    console.log(`Action result: ${result.message} (${result.points} points)`);
    
    resetAllEnemies();
    updateScore(result.points);
    
    setTimeout(() => triggerRandomAttack(), 1500);
  };

  // Nettoyage
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
  },
});

export default GameScreen;