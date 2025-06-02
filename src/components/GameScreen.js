import React, { useState, useRef, useEffect } from 'react';
import { View, StyleSheet, Dimensions, Animated } from 'react-native';
import { GLView } from 'expo-gl';
import GameUI from './GameUI';
import { GAME_STATES } from '../utils/Constants';
import { StateManager } from '../managers/StateManager';
import { SceneManager } from '../managers/SceneManager';
import { EnemyManager } from '../managers/EnemyManager';
import { PlayerManager } from '../managers/PlayerManager';
import { GameManager } from '../managers/GameManager';

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

/**
 * Écran principal du jeu - Orchestrateur simplifié
 */
const GameScreen = () => {
  const [gameState, setGameState] = useState({
    state: GAME_STATES.PLAYING,
    score: 0,
    health: 100,
    combo: 0,
    expectedAction: null,
    resultMessage: ''
  });

  // Références aux managers
  const stateManagerRef = useRef(null);
  const sceneManagerRef = useRef(null);
  const enemyManagerRef = useRef(null);
  const playerManagerRef = useRef(null);
  const gameManagerRef = useRef(null);
  
  // Animation pour les messages
  const fadeAnim = useRef(new Animated.Value(0)).current;

  /**
   * Initialisation du jeu
   */
  const initializeGame = async (gl) => {
    try {
      console.log('Initializing game...');
      
      // Créer les managers
      const stateManager = new StateManager();
      const sceneManager = new SceneManager(gl, screenWidth, screenHeight);
      const enemyManager = new EnemyManager(sceneManager);
      const playerManager = new PlayerManager(sceneManager);
      const gameManager = new GameManager(stateManager, sceneManager, enemyManager, playerManager);
      
      // Stocker les références
      stateManagerRef.current = stateManager;
      sceneManagerRef.current = sceneManager;
      enemyManagerRef.current = enemyManager;
      playerManagerRef.current = playerManager;
      gameManagerRef.current = gameManager;
      
      // Écouter les changements d'état
      stateManager.addListener((newState) => {
        setGameState(newState);
        
        // Animer le message de résultat
        if (newState.resultMessage) {
          showResultMessage();
        }
      });
      
      // Initialiser le jeu
      gameManager.initialize();
      
    } catch (error) {
      console.error('Error initializing game:', error);
    }
  };

  /**
   * Affiche le message de résultat avec animation
   */
  const showResultMessage = () => {
    fadeAnim.setValue(1);
    
    Animated.timing(fadeAnim, {
      toValue: 0,
      duration: 3000,
      useNativeDriver: true,
    }).start(() => {
      setTimeout(() => {
        if (stateManagerRef.current) {
          stateManagerRef.current.setResultMessage('');
        }
      }, 0);
    });
  };

  /**
   * Gère l'action d'esquive
   */
  const handleDodge = () => {
    if (gameManagerRef.current) {
      gameManagerRef.current.handlePlayerAction('dodge');
    }
  };

  /**
   * Gère l'action de parade
   */
  const handleParry = () => {
    if (gameManagerRef.current) {
      gameManagerRef.current.handlePlayerAction('parry');
    }
  };

  /**
   * Nettoyage à la destruction du composant
   */
  useEffect(() => {
    return () => {
      if (gameManagerRef.current) {
        gameManagerRef.current.dispose();
      }
    };
  }, []);

  return (
    <View style={styles.container}>
      <GLView
        style={styles.glView}
        onContextCreate={initializeGame}
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
  },
});

export default GameScreen;