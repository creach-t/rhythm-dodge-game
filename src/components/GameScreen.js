import React, { useState, useRef, useEffect } from 'react';
import { View, StyleSheet, Dimensions, Animated } from 'react-native';
import { GLView } from 'expo-gl';
import * as THREE from 'three';
import GameUI from './GameUI';
import { 
  GAME_STATES, 
  DEFENSE_ACTIONS, 
  PLAYER_CONFIG, 
  ENEMY_CONFIG,
  TIMING_CONFIG,
  ATTACK_TYPES
} from '../utils/Constants';
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
} from '../systems/EnemySystem';
import { GameLogic } from '../systems/GameLogic';

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

const GameScreen = () => {
  const [gameState, setGameState] = useState({
    state: GAME_STATES.PLAYING,
    score: 0,
    health: PLAYER_CONFIG.HEALTH,
    combo: 0,
    currentAttackType: null,
    resultMessage: '',
    enemyHealths: [100, 100, 100]
  });

  const sceneRef = useRef(null);
  const rendererRef = useRef(null);
  const cameraRef = useRef(null);
  const animationFrameRef = useRef(null);
  const enemiesRef = useRef([]);
  const gameLogic = useRef(new GameLogic());
  const actionTimeoutRef = useRef(null);

  // Initialisation de la scène 3D
  const initializeScene = async (gl) => {
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
      scene.add(createPlayer());

      const enemies = [];
      for (let i = 0; i < ENEMY_CONFIG.MAX_COUNT; i++) {
        const enemy = createEnemy(i, ENEMY_CONFIG.MAX_COUNT, ENEMY_CONFIG.SPAWN_RADIUS);
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
      } catch (error) {
        console.error('Error in render loop:', error);
      }
    };
    animate();
  };

  const fadeAnim = useRef(new Animated.Value(0)).current;

  const showResultMessage = (message) => {
    setGameState(prev => ({ ...prev, resultMessage: message }));

    fadeAnim.setValue(1);

    Animated.timing(fadeAnim, {
      toValue: 0,
      duration: TIMING_CONFIG.ACTION_RESULT_DISPLAY,
      useNativeDriver: true,
    }).start(() => {
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
      const enemyId = Math.floor(Math.random() * ENEMY_CONFIG.MAX_COUNT);
      const attackType = gameLogic.current.getRandomAttack();
      
      console.log(`Enemy ${enemyId} attacks with ${attackType}`);
      
      const enemy = enemiesRef.current[enemyId];
      if (enemy && gameLogic.current.triggerAttack(enemyId, attackType)) {
        highlightEnemyAttack(enemy, attackType);
        
        // Mettre à jour l'état avec le type d'attaque actuel
        setGameState(prev => ({
          ...prev,
          currentAttackType: attackType
        }));
        
        // Configurer le timeout pour l'action
        if (actionTimeoutRef.current) {
          clearTimeout(actionTimeoutRef.current);
        }
        
        actionTimeoutRef.current = setTimeout(() => {
          if (gameLogic.current.awaitingAction) {
            // Si c'était une feinte et que le joueur n'a rien fait, c'est bien !
            if (attackType === ATTACK_TYPES.FEINT) {
              handlePlayerAction(DEFENSE_ACTIONS.NONE);
            } else {
              // Sinon, le joueur a raté l'action
              handleMissedAction();
            }
          }
        }, TIMING_CONFIG.ACTION_WINDOW);
      }
    } catch (error) {
      console.error('Error triggering attack:', error);
    }
  };

  const handleMissedAction = () => {
    console.log('Player missed the action!');
    resetAllEnemies();
    
    const damage = gameLogic.current.getDamageForAttack();
    
    // Perdre de la santé
    setGameState(prev => ({
      ...prev,
      health: Math.max(0, prev.health - damage),
      combo: 0,
      currentAttackType: null
    }));
    
    showResultMessage('Trop lent !');
    gameLogic.current.reset();
    
    // Vérifier si game over
    if (gameState.health - damage <= 0) {
      handleGameOver();
    } else {
      setTimeout(() => triggerRandomAttack(), TIMING_CONFIG.ATTACK_COOLDOWN);
    }
  };

  const resetAllEnemies = () => {
    enemiesRef.current.forEach(enemy => resetEnemyAppearance(enemy));
  };

  const handleDodge = () => {
    if (gameState.currentAttackType === ATTACK_TYPES.FEINT) {
      // Le joueur a appuyé sur un bouton pendant une feinte
      handlePlayerAction(DEFENSE_ACTIONS.DODGE);
    } else {
      handlePlayerAction(DEFENSE_ACTIONS.DODGE);
    }
  };

  const handleParry = () => {
    if (gameState.currentAttackType === ATTACK_TYPES.FEINT) {
      // Le joueur a appuyé sur un bouton pendant une feinte
      handlePlayerAction(DEFENSE_ACTIONS.PARRY);
    } else {
      handlePlayerAction(DEFENSE_ACTIONS.PARRY);
    }
  };

  const handlePlayerAction = (action) => {
    if (!gameLogic.current.awaitingAction) return;
    
    // Annuler le timeout
    if (actionTimeoutRef.current) {
      clearTimeout(actionTimeoutRef.current);
    }
    
    const result = gameLogic.current.checkPlayerAction(action);
    if (!result) return;
    
    console.log(`Action result: ${result.message} (${result.points} points, ${result.damage} damage)`);
    
    resetAllEnemies();
    
    // Mettre à jour l'état du jeu
    setGameState(prev => {
      const newHealth = Math.max(0, prev.health - result.damage);
      const newScore = Math.max(0, prev.score + result.points);
      const newCombo = result.success ? prev.combo + 1 : 0;
      
      // Mettre à jour la santé des ennemis
      const newEnemyHealths = [...prev.enemyHealths];
      for (let i = 0; i < newEnemyHealths.length; i++) {
        newEnemyHealths[i] = gameLogic.current.getEnemyHealth(i);
      }
      
      return {
        ...prev,
        score: newScore,
        health: newHealth,
        combo: newCombo,
        currentAttackType: null,
        enemyHealths: newEnemyHealths
      };
    });

    showResultMessage(result.message);
    
    // Vérifier si game over
    if (gameState.health - result.damage <= 0) {
      handleGameOver();
    } else if (gameLogic.current.areAllEnemiesDefeated()) {
      // Tous les ennemis sont vaincus
      showResultMessage('Victoire ! Tous les ennemis sont vaincus !');
      setTimeout(() => handleGameOver(), 2000);
    } else {
      setTimeout(() => triggerRandomAttack(), TIMING_CONFIG.ATTACK_COOLDOWN);
    }
  };

  const handleGameOver = () => {
    console.log('Game Over!');
    setGameState(prev => ({
      ...prev,
      state: GAME_STATES.GAME_OVER,
      currentAttackType: null
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
      if (actionTimeoutRef.current) {
        clearTimeout(actionTimeoutRef.current);
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
        currentAttackType={gameState.currentAttackType}
        resultMessage={gameState.resultMessage}
        fadeAnim={fadeAnim}
        onDodge={handleDodge}
        onParry={handleParry}
        enemyHealths={gameState.enemyHealths}
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
  },
});

export default GameScreen;
