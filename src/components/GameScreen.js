import React, { useState, useRef, useEffect } from 'react';
import { View, StyleSheet, Dimensions, Animated } from 'react-native';
import { GLView } from 'expo-gl';
import * as THREE from 'three';
import GameUI from './GameUI';
import { GAME_CONFIG, GAME_STATES } from '../utils/Constants';
import { GameRenderer } from '../engine/GameRenderer';
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
    health: GAME_CONFIG.PLAYER.HEALTH,
    combo: 0,
    expectedAction: null,
    resultMessage: ''
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
      console.log('GL context:', gl);
      
      // Créer le renderer avec le module GameRenderer
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
      for (let i = 0; i < GAME_CONFIG.ENEMIES.MAX_COUNT; i++) {
        const enemy = createEnemy(i, GAME_CONFIG.ENEMIES.MAX_COUNT, GAME_CONFIG.ENEMIES.SPAWN_RADIUS);
        scene.add(enemy);
        enemies.push(enemy);
      }
      enemiesRef.current = enemies;

      console.log('Scene initialized with', scene.children.length, 'objects');
      console.log('Camera FOV:', camera.fov, 'Aspect:', camera.aspect);

      // Démarrer la boucle de rendu
      startRenderLoop();

      // Démarrer le gameplay
      setTimeout(() => startGameplay(), 2000);
      
    } catch (error) {
      console.error('Error initializing scene:', error);
      console.error(error.stack);
    }
  };

  const startRenderLoop = () => {
    let frameCount = 0;
    
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
        
        // Log toutes les 60 frames
        frameCount++;
        if (frameCount % 60 === 0) {
          console.log('Rendering frame', frameCount);
        }
      } catch (error) {
        console.error('Error in render loop:', error);
      }
    };
    
    animate();
  };

const fadeAnim = useRef(new Animated.Value(0)).current; // initial opacity = 0

const showResultMessage = (message) => {
  setGameState(prev => ({ ...prev, resultMessage: message }));

  // Reset opacity to 1
  fadeAnim.setValue(1);

  // Lance une animation qui fait disparaitre le message en 3 secondes
  Animated.timing(fadeAnim, {
    toValue: 0,
    duration: 3000,
    useNativeDriver: true,
  }).start(() => {
    // Utiliser un délai pour sortir du cycle de rendu actuel
    setTimeout(() => {
      setGameState(prev => ({ ...prev, resultMessage: '' }));
    }, 0);
  });
};

  const startGameplay = () => {
    console.log('Starting gameplay...');
    setTimeout(() => triggerRandomAttack(), 1000);
  };

  const triggerRandomAttack = () => {
    if (gameLogic.current.awaitingAction) return;
    if (gameState.state !== GAME_STATES.PLAYING) return;
    
    setGameState(prev => ({ ...prev, resultMessage: '' }));

    try {
      const enemyId = Math.floor(Math.random() * GAME_CONFIG.ENEMIES.MAX_COUNT);
      const attackType = gameLogic.current.getRandomAttack();
      
      console.log(`Enemy ${enemyId} attacks with ${attackType}`);
      
      const enemy = enemiesRef.current[enemyId];
      if (enemy && gameLogic.current.triggerAttack(enemyId, attackType)) {
        highlightEnemyAttack(enemy, attackType);
        
        // Mettre à jour l'action attendue dans l'UI
        setGameState(prev => ({
          ...prev,
          expectedAction: gameLogic.current.expectedAction
        }));
        
        // Timeout après 4 secondes
        setTimeout(() => {
          if (gameLogic.current.awaitingAction) {
            handleMissedAction();
          }
        }, 4000);
      }
    } catch (error) {
      console.error('Error triggering attack:', error);
    }
  };

  const handleMissedAction = () => {
    console.log('Player missed the action!');
    resetAllEnemies();
    
    // Perdre de la santé et mettre à jour le score
    setGameState(prev => ({
      ...prev,
      health: Math.max(0, prev.health - 10),
      combo: 0,
      expectedAction: null
    }));
    
    gameLogic.current.reset();
    
    // Vérifier si game over
    if (gameState.health <= 0) {
      handleGameOver();
    } else {
      setTimeout(() => triggerRandomAttack(), 3000);
    }
  };

  const resetAllEnemies = () => {
    enemiesRef.current.forEach(enemy => resetEnemyAppearance(enemy));
  };

  const updateGameState = (points) => {
    setGameState(prev => {
      const newHealth = prev.health
      const newScore = Math.max(0, prev.score + points);
      const newCombo = points > 0 ? prev.combo + 1 : 0;
      
      return {
        ...prev,
        score: newScore,
        health: newHealth,
        combo: newCombo,
        expectedAction: null
      };
    });
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
    updateGameState(result.points);

  showResultMessage(result.message);
    
    // Vérifier si game over
    if (gameState.health <= 0) {
      handleGameOver();
    } else {
      setTimeout(() => triggerRandomAttack(), 1500);
    }
  };

  const handleGameOver = () => {
    console.log('Game Over!');
    setGameState(prev => ({
      ...prev,
      state: GAME_STATES.GAME_OVER,
      expectedAction: null
    }));
    
    // Arrêter les animations
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
    }
  };

  // Nettoyage
  useEffect(() => {
    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
      if (rendererRef.current) {
        rendererRef.current.dispose();
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
        expectedAction={gameState.expectedAction}
        resultMessage={gameState.resultMessage}
        fadeAnim={fadeAnim}
        onDodge={handleDodge}
        onParry={handleParry}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1a1a1a',
  },
  glView: {
    flex: 1,
    borderWidth: 2,
    borderColor: 'red'
  },
});

export default GameScreen;