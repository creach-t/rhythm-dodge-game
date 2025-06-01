import { useState, useCallback } from 'react';
import { GAME_STATES, PLAYER_CONFIG, HEALTH_CONFIG } from '../utils/Constants';

/**
 * Hook personnalisé pour gérer l'état global du jeu
 * Responsabilité unique : État du jeu (score, santé, combo, etc.)
 */
export const useGameState = () => {
  const [gameState, setGameState] = useState({
    state: GAME_STATES.PLAYING,
    score: 0,
    health: PLAYER_CONFIG.HEALTH,
    combo: 0,
    currentRound: 1,
    expectedAction: null,
    resultMessage: ''
  });

  // Mettre à jour le score et le combo
  const updateScore = useCallback((points) => {
    setGameState(prev => {
      const newScore = Math.max(0, prev.score + points);
      const newCombo = points > 0 ? prev.combo + 1 : 0;
      
      return {
        ...prev,
        score: newScore,
        combo: newCombo
      };
    });
  }, []);

  // Infliger des dégâts au joueur
  const takeDamage = useCallback((damage = HEALTH_CONFIG.DAMAGE_ON_MISS) => {
    setGameState(prev => ({
      ...prev,
      health: Math.max(0, prev.health - damage),
      combo: 0 // Reset combo on damage
    }));
  }, []);

  // Soigner le joueur
  const heal = useCallback((amount) => {
    setGameState(prev => ({
      ...prev,
      health: Math.min(HEALTH_CONFIG.MAX_HEALTH, prev.health + amount)
    }));
  }, []);

  // Définir l'action attendue
  const setExpectedAction = useCallback((action) => {
    setGameState(prev => ({
      ...prev,
      expectedAction: action
    }));
  }, []);

  // Afficher un message de résultat
  const setResultMessage = useCallback((message) => {
    setGameState(prev => ({
      ...prev,
      resultMessage: message
    }));
  }, []);

  // Effacer le message de résultat
  const clearResultMessage = useCallback(() => {
    setGameState(prev => ({
      ...prev,
      resultMessage: ''
    }));
  }, []);

  // Passer au round suivant
  const nextRound = useCallback(() => {
    setGameState(prev => ({
      ...prev,
      currentRound: prev.currentRound + 1,
      expectedAction: null
    }));
  }, []);

  // Game Over
  const gameOver = useCallback(() => {
    setGameState(prev => ({
      ...prev,
      state: GAME_STATES.GAME_OVER,
      expectedAction: null
    }));
  }, []);

  // Redémarrer le jeu
  const resetGame = useCallback(() => {
    setGameState({
      state: GAME_STATES.PLAYING,
      score: 0,
      health: PLAYER_CONFIG.HEALTH,
      combo: 0,
      currentRound: 1,
      expectedAction: null,
      resultMessage: ''
    });
  }, []);

  // Mettre en pause / reprendre
  const togglePause = useCallback(() => {
    setGameState(prev => ({
      ...prev,
      state: prev.state === GAME_STATES.PLAYING 
        ? GAME_STATES.PAUSED 
        : GAME_STATES.PLAYING
    }));
  }, []);

  // Getters utiles
  const isPlaying = gameState.state === GAME_STATES.PLAYING;
  const isGameOver = gameState.state === GAME_STATES.GAME_OVER;
  const isPaused = gameState.state === GAME_STATES.PAUSED;
  const isHealthCritical = gameState.health <= HEALTH_CONFIG.CRITICAL_HEALTH_THRESHOLD;
  const isDead = gameState.health <= 0;

  return {
    // État
    gameState,
    
    // Actions
    updateScore,
    takeDamage,
    heal,
    setExpectedAction,
    setResultMessage,
    clearResultMessage,
    nextRound,
    gameOver,
    resetGame,
    togglePause,
    
    // Getters
    isPlaying,
    isGameOver,
    isPaused,
    isHealthCritical,
    isDead
  };
};