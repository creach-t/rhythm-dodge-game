import React, { useState, useRef, useEffect, useCallback } from 'react';
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

// Hook pour gérer l’état global du jeu
function useGameState(initialHealth) {
  const [state, setState] = useState({
    gameState: GAME_STATES.PLAYING,
    score: 0,
    health: initialHealth,
    combo: 0,
    expectedAction: null,
    resultMessage: '',
  });

  const updateState = useCallback((updates) => {
    setState(prev => ({ ...prev, ...updates }));
  }, []);

  return [state, updateState];
}

// Hook pour gérer la boucle de rendu et animation des ennemis
function useGameLoop(enemiesRef, rendererRef, sceneRef, cameraRef) {
  const animationFrameRef = useRef(null);

  useEffect(() => {
    let frameCount = 0;

    function animate() {
      animationFrameRef.current = requestAnimationFrame(animate);
      try {
        const time = Date.now() * 0.001;
        if (enemiesRef.current.length) {
          animateEnemies(enemiesRef.current, time);
        }
        if (rendererRef.current && sceneRef.current && cameraRef.current) {
          rendererRef.current.render(sceneRef.current, cameraRef.current);
        }
        frameCount++;
        if (frameCount % 60 === 0) {
          console.log('Rendering frame', frameCount);
        }
      } catch (error) {
        console.error('Error in render loop:', error);
      }
    }
    animate();

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [enemiesRef, rendererRef, sceneRef, cameraRef]);
}

// Hook pour gérer la séquence d’attaques et le timeout associé
function useAttackSequence(gameState, gameLogic, enemiesRef, updateGameState, showResultMessage, resetAllEnemies, handleGameOver) {
  const ATTACK_TIMEOUTS = useRef(new Map());

  // Nettoyage des timeouts
  useEffect(() => {
    return () => {
      ATTACK_TIMEOUTS.current.forEach(timeoutId => clearTimeout(timeoutId));
      ATTACK_TIMEOUTS.current.clear();
    };
  }, []);

  const clearExistingTimeout = useCallback((enemyId) => {
    if (ATTACK_TIMEOUTS.current.has(enemyId)) {
      clearTimeout(ATTACK_TIMEOUTS.current.get(enemyId));
      ATTACK_TIMEOUTS.current.delete(enemyId);
    }
  }, []);

  const getAttackDuration = (attackType) => {
    // Durée en ms par type d’attaque, à adapter selon ta config
    switch(attackType) {
      case 'heavy': return 3000;
      case 'light': return 1500;
      default: return 2000;
    }
  };

  const handleMissedAction = useCallback(() => {
    console.log('Player missed the action!');
    resetAllEnemies();
    updateGameState({
      health: Math.max(0, gameState.health - 10),
      combo: 0,
      expectedAction: null,
    });
    gameLogic.current.reset();

    if (gameState.health <= 0) {
      handleGameOver();
    } else {
      setTimeout(() => triggerSequencedAttackWithTimeout(), 3000);
    }
  }, [gameState.health, gameLogic, handleGameOver, resetAllEnemies, updateGameState]);

  const triggerSequencedAttackWithTimeout = useCallback((enemyId, attackType, elapsedTime = 0) => {
    if (gameLogic.current.awaitingAction) return;
    if (gameState.gameState !== GAME_STATES.PLAYING) return;

    updateGameState({ resultMessage: '' });

    try {
      console.log(`Enemy ${enemyId} attacks with ${attackType}`);

      const enemy = enemiesRef.current[enemyId];
      if (enemy && gameLogic.current.triggerAttack(enemyId, attackType)) {
        highlightEnemyAttack(enemy, attackType);

        updateGameState({
          expectedAction: gameLogic.current.expectedAction,
        });

        clearExistingTimeout(enemyId);

        const attackDuration = getAttackDuration(attackType);
        const timeoutDelay = Math.max(attackDuration - elapsedTime, 100);

        const timeoutId = setTimeout(() => {
          ATTACK_TIMEOUTS.current.delete(enemyId);

          if (gameLogic.current.awaitingAction) {
            handleMissedAction();
          }
        }, timeoutDelay);

        ATTACK_TIMEOUTS.current.set(enemyId, timeoutId);
      }
    } catch (error) {
      console.error('Error triggering attack:', error);
    }
  }, [clearExistingTimeout, gameLogic, gameState.gameState, handleMissedAction, enemiesRef, updateGameState]);

  // Jouer une séquence entière avec délais cumulés
  const playAttackSequence = useCallback((sequence) => {
    let accumulatedDelay = 0;
    sequence.forEach(({ enemyId, type, delay }) => {
      accumulatedDelay += delay;
      setTimeout(() => {
        triggerSequencedAttackWithTimeout(enemyId, type, accumulatedDelay);
      }, accumulatedDelay);
    });
  }, [triggerSequencedAttackWithTimeout]);

  return { triggerSequencedAttackWithTimeout, playAttackSequence };
}

const GameScreen = () => {
  const enemiesRef = useRef([]);
  const rendererRef = useRef(null);
  const sceneRef = useRef(null);
  const cameraRef = useRef(null);
  const gameLogic = useRef(new GameLogic());

  const [gameState, updateGameState] = useGameState(GAME_CONFIG.PLAYER.HEALTH);
  const fadeAnim = useRef(new Animated.Value(0)).current;

  // Initialisation de la scène
  const initializeScene = useCallback(async (gl) => {
    try {
      console.log('Initializing 3D scene...');
      const gameRenderer = new GameRenderer(gl, screenWidth, screenHeight);
      rendererRef.current = gameRenderer;

      const scene = setupScene();
      const camera = setupCamera(screenWidth, screenHeight);
      sceneRef.current = scene;
      cameraRef.current = camera;

      setupLighting(scene);
      scene.add(createGround());
      scene.add(createGrid());
      scene.add(createPlayer());

      const enemies = [];
      for (let i = 0; i < GAME_CONFIG.ENEMIES.MAX_COUNT; i++) {
        const enemy = createEnemy(i, GAME_CONFIG.ENEMIES.MAX_COUNT, GAME_CONFIG.ENEMIES.SPAWN_RADIUS);
        scene.add(enemy);
        enemies.push(enemy);
      }
      enemiesRef.current = enemies;

      console.log('Scene initialized with', scene.children.length, 'objects');
      console.log('Camera FOV:', camera.fov, 'Aspect:', camera.aspect);
    } catch (error) {
      console.error('Error initializing scene:', error);
    }
  }, []);

  // Boucle de rendu
  useGameLoop(enemiesRef, rendererRef, sceneRef, cameraRef);

  // Affichage des messages avec animation
  const showResultMessage = useCallback((message) => {
    updateGameState({ resultMessage: message });
    fadeAnim.setValue(1);
    Animated.timing(fadeAnim, {
      toValue: 0,
      duration: 3000,
      useNativeDriver: true,
    }).start(() => {
      setTimeout(() => updateGameState({ resultMessage: '' }), 0);
    });
  }, [fadeAnim, updateGameState]);

  // Reset visuel des ennemis
  const resetAllEnemies = useCallback(() => {
    enemiesRef.current.forEach(resetEnemyAppearance);
  }, []);

  // Gestion des séquences d'attaque
  const { triggerSequencedAttackWithTimeout, playAttackSequence } = useAttackSequence(
    gameState,
    gameLogic,
    enemiesRef,
    updateGameState,
    showResultMessage,
    resetAllEnemies,
    () => {
      console.log('Game Over!');
      updateGameState({ gameState: GAME_STATES.GAME_OVER, expectedAction: null });
      if (rendererRef.current) rendererRef.current.dispose();
    }
  );

  // Démarrage du gameplay (exemple avec séquence 1)
  useEffect(() => {
    if (rendererRef.current) {
      setTimeout(() => {
        playAttackSequence(GAME_CONFIG.ATTACK_SEQUENCE_1);
      }, 5000);
    }
  }, [playAttackSequence]);

  // Actions joueur
  const handlePlayerAction = useCallback((action) => {
    const result = gameLogic.current.checkPlayerAction(action);
    if (!result) return;

    console.log(`Action result: ${result.message} (${result.points} points)`);
    resetAllEnemies();
    updateGameState({
      score: Math.max(0, gameState.score + result.points),
      health: gameState.health,  // on pourrait ajouter modifs santé si besoin
      combo: result.points > 0 ? gameState.combo + 1 : 0,
      expectedAction: null,
    });
    showResultMessage(result.message);

    if (gameState.health <= 0) {
      updateGameState({ gameState: GAME_STATES.GAME_OVER });
    } else {
      setTimeout(() => triggerSequencedAttackWithTimeout(), 1500);
    }
  }, [gameState, resetAllEnemies, showResultMessage, triggerSequencedAttackWithTimeout, updateGameState]);

  const handleDodge = useCallback(() => handlePlayerAction(DEFENSE_ACTIONS.DODGE), [handlePlayerAction]);
  const handleParry = useCallback(() => handlePlayerAction(DEFENSE_ACTIONS.PARRY), [handlePlayerAction]);

  // Nettoyage à la sortie du composant
  useEffect(() => {
    return () => {
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
        gameState={gameState.gameState}
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
  container: { flex: 1, backgroundColor: '#1a1a1a' },
  glView: { flex: 1, borderWidth: 2, borderColor: 'red' },
});

export default GameScreen;
