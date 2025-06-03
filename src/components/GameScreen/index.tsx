import { GLView } from 'expo-gl';
import React, { useEffect, useRef, useState } from 'react';
import { Animated, Dimensions, View } from 'react-native';
import { GameRenderer } from '../../engine/GameRenderer';
import {
  createGround,
  setupCamera,
  setupLighting,
  setupScene,
} from '../../engine/SceneSetup';
import {
  animateEnemies,
  createEnemy,
  highlightEnemyAttack,
  resetAllEnemies,
} from '../../systems/EnemySystem';
import { GameLogic } from '../../systems/GameLogic';
import {
  animateDodge,
  createPlayer,
  highlightPlayerDefense,
} from '../../systems/PlayerSystem';
import {
  ATTACK_TYPES,
  DEFENSE_ACTIONS,
  ENEMY_CONFIG,
  GAME_STATES,
  PLAYER_CONFIG,
  TIMING_CONFIG,
} from '../../utils/Constants';
import GameUI from '../GameUI';
import styles from './GameScreen.styles';

const {width: screenWidth, height: screenHeight} = Dimensions.get('window');

const GameScreen = () => {
  const [gameState, setGameState] = useState({
    state: GAME_STATES.PLAYING,
    score: 0,
    health: PLAYER_CONFIG.HEALTH,
    combo: 0,
    currentAttackType: null,
    resultMessage: '',
    enemyHealths: Array(ENEMY_CONFIG.MAX_COUNT).fill(ENEMY_CONFIG.HEALTH),
  });

  const sceneRef = useRef(null);
  const rendererRef = useRef(null);
  const cameraRef = useRef(null);
  const animationFrameRef = useRef(null);
  const enemiesRef = useRef([]);
  const gameLogic = useRef(new GameLogic());
  const actionTimeoutRef = useRef(null);
  const playerRef = useRef(null);
  const dodgeAnimationRef = useRef(null);

  // Initialisation de la scène 3D
  const initializeScene = async (gl) => {
    try {
      console.log('Initializing 3D scene...');

      const gameRenderer = new GameRenderer(gl);
      rendererRef.current = gameRenderer;

      const scene = setupScene();
      const camera = setupCamera(screenWidth, screenHeight);

      sceneRef.current = scene;
      cameraRef.current = camera;

      setupLighting(scene);

      scene.add(createGround());

      const player = createPlayer();
      scene.add(player);
      playerRef.current = player;

      const enemies = [];
      for (let i = 0; i < ENEMY_CONFIG.MAX_COUNT; i++) {
        const enemy = createEnemy(
          i,
          ENEMY_CONFIG.MAX_COUNT,
          ENEMY_CONFIG.SPAWN_RADIUS,
        );
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

  const animate = () => {
    animationFrameRef.current = requestAnimationFrame(animate);

    try {
      const time = Date.now() * 0.001;

      if (enemiesRef.current.length > 0) {
        animateEnemies(enemiesRef.current, time);
      }

      if (rendererRef.current && sceneRef.current && cameraRef.current) {
        rendererRef.current.render(sceneRef.current, cameraRef.current);
      }
    } catch (error) {
      console.error('Error in render loop:', error);
    }
  };

  const startRenderLoop = () => {
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
    }
    animate();
  };

  const fadeAnim = useRef(new Animated.Value(0)).current;

  const showResultMessage = (message) => {
    setGameState((prev) => ({...prev, resultMessage: message}));

    fadeAnim.setValue(1);

    Animated.timing(fadeAnim, {
      toValue: 0,
      duration: TIMING_CONFIG.ACTION_RESULT_DISPLAY,
      useNativeDriver: true,
    }).start(() => {
      setTimeout(() => {
        setGameState((prev) => ({...prev, resultMessage: ''}));
      }, 0);
    });
  };

  const startGameplay = () => {
    console.log('Starting gameplay...');
    setTimeout(() => triggerRandomAttack(), 1000);
  };

  const triggerRandomAttack = () => {
    console.log('triggerRandomAttack called', {
      awaitingAction: gameLogic.current.awaitingAction,
      gameState: gameState.state,
    });
    if (gameLogic.current.awaitingAction) return;
    if (gameState.state !== GAME_STATES.PLAYING) return;

    setGameState((prev) => ({...prev, resultMessage: ''}));

    try {
      const aliveEnemyIndices = gameState.enemyHealths
        .map((health, index) => (health > 0 ? index : -1))
        .filter((index) => index !== -1);

      if (aliveEnemyIndices.length === 0) {
        // Tous morts, on pourrait gérer la victoire ici
        return;
      }

      const randomIndex = Math.floor(Math.random() * aliveEnemyIndices.length);
      const enemyId = aliveEnemyIndices[randomIndex];
      const attackType = gameLogic.current.getRandomAttack();

      console.log(`Enemy ${enemyId} attacks with ${attackType}`);

      const enemy = enemiesRef.current[enemyId];
      if (enemy && gameLogic.current.triggerAttack(enemyId, attackType)) {
        highlightEnemyAttack(enemy, attackType);

        // Mettre à jour l'état avec le type d'attaque actuel
        setGameState((prev) => ({
          ...prev,
          currentAttackType: attackType,
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

  const handleRestart = () => {
    gameLogic.current.resetAll();

    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
    }

    // Supprimer les anciens ennemis de la scène
    enemiesRef.current.forEach((enemy) => {
      if (sceneRef.current) {
        sceneRef.current.remove(enemy);
        enemy.geometry.dispose();
        enemy.material.dispose();
      }
    });

    // Recréer les ennemis
    const newEnemies = [];
    for (let i = 0; i < ENEMY_CONFIG.MAX_COUNT; i++) {
      const enemy = createEnemy(
        i,
        ENEMY_CONFIG.MAX_COUNT,
        ENEMY_CONFIG.SPAWN_RADIUS,
      );
      sceneRef.current.add(enemy);
      newEnemies.push(enemy);
    }
    enemiesRef.current = newEnemies;

    startRenderLoop();

    setGameState({
      score: 0,
      health: PLAYER_CONFIG.HEALTH,
      combo: 0,
      currentAttackType: null,
      enemyHealths: Array(ENEMY_CONFIG.MAX_COUNT).fill(ENEMY_CONFIG.HEALTH),
      resultMessage: '',
      state: GAME_STATES.PLAYING,
    });

    setTimeout(() => startGameplay(), 500);
  };

  const handleMissedAction = () => {
    console.log('Player missed the action!');

    const damage = gameLogic.current.getDamageForAttack();

    showResultMessage('Trop lent !');
    gameLogic.current.reset();

    // Mettre à jour l'état et gérer la suite dans le même callback
    setGameState((prev) => {
      const newHealth = Math.max(0, prev.health - damage);
      const isGameOver = newHealth <= 0;

      setTimeout(() => {
        if (isGameOver) {
          handleGameOver();
        } else {
          triggerRandomAttack();
        }
      }, TIMING_CONFIG.ATTACK_COOLDOWN);

      return {
        ...prev,
        health: newHealth,
        combo: 0,
        currentAttackType: null,
      };
    });
  };

  const handleDodge = () => {
    if (gameState.currentAttackType === ATTACK_TYPES.FEINT) {
      // Le joueur a appuyé sur un bouton pendant une feinte
      handlePlayerAction(DEFENSE_ACTIONS.DODGE);
    } else {
      handlePlayerAction(DEFENSE_ACTIONS.DODGE);
    }
    highlightPlayerDefense(playerRef.current, 'dodge');
    animateDodge(playerRef.current, dodgeAnimationRef);
  };

  const handleParry = () => {
    if (gameState.currentAttackType === ATTACK_TYPES.FEINT) {
      // Le joueur a appuyé sur un bouton pendant une feinte
      handlePlayerAction(DEFENSE_ACTIONS.PARRY);
    } else {
      handlePlayerAction(DEFENSE_ACTIONS.PARRY);
    }
    highlightPlayerDefense(playerRef.current, 'dodge');
    animateDodge(playerRef.current, dodgeAnimationRef);
  };

  const handlePlayerAction = (action) => {
    if (!gameLogic.current.awaitingAction) return;

    // Annuler le timeout
    if (actionTimeoutRef.current) {
      clearTimeout(actionTimeoutRef.current);
    }

    const result = gameLogic.current.checkPlayerAction(action);
    if (!result) return;

    console.log(
      `Action result: ${result.message} (${result.points} points, ${result.damage} damage)`,
    );

    resetAllEnemies(enemiesRef.current);

    setGameState((prev) => {
      const newHealth = Math.max(0, prev.health - result.damage);
      const newScore = Math.max(0, prev.score + result.points);
      const newCombo = result.success ? prev.combo + 1 : 0;

      // Mise à jour et nettoyage des ennemis morts dans Three.js
    enemiesRef.current.forEach((enemy, index) => {
      const health = gameLogic.current.getEnemyHealth(index);
      if (health <= 0 && enemy) {
        // Rendre invisible au lieu de supprimer
        enemy.visible = false;
        // Optionnel : déplacer hors de vue
        enemy.position.y = -1000;
      }
    });

// 🔧 Garder la structure originale des enemyHealths
    const updatedEnemyHealths = Array(ENEMY_CONFIG.MAX_COUNT)
      .fill(0)
      .map((_, index) => gameLogic.current.getEnemyHealth(index));

    return {
      ...prev,
      score: newScore,
      health: newHealth,
      combo: newCombo,
      currentAttackType: null,
      enemyHealths: updatedEnemyHealths,
    };
  });

    showResultMessage(result.message);

    // Vérifier si game over
    setTimeout(() => {
      if (gameState.health - result.damage <= 0) {
        handleGameOver();
      } else if (gameLogic.current.areAllEnemiesDefeated()) {
        showResultMessage('Victoire ! Tous les ennemis sont vaincus !');
        setTimeout(() => handleGameOver(), 2000);
      } else {
        setTimeout(() => triggerRandomAttack(), TIMING_CONFIG.ATTACK_COOLDOWN);
      }
    }, 0);
  };

  const handleGameOver = () => {
    console.log('Game Over!');
    setGameState((prev) => ({
      ...prev,
      state: GAME_STATES.GAME_OVER,
      currentAttackType: null,
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

  useEffect(() => {
    if (gameState.state === GAME_STATES.PLAYING) {
      const timeoutId = setTimeout(() => {
        triggerRandomAttack();
      }, 1000);

      return () => clearTimeout(timeoutId);
    }
  }, [gameState.state]);

  return (
    <View style={styles.container}>
      <GLView style={styles.glView} onContextCreate={initializeScene} />

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
        onRestart={handleRestart}
        enemyHealths={gameState.enemyHealths}
      />
    </View>
  );
};

export default GameScreen;
