import { useState, useCallback, useRef, useEffect } from 'react';
import { TURN_STATES, PLAYER_ACTIONS } from '../utils/Constants';
import { turnManagerService } from '../services/TurnManagerService';
import { playerTurnService } from '../services/PlayerTurnService';

/**
 * Hook personnalisé pour gérer l'état des tours
 * Responsabilité unique : Interface React pour le système de tours
 */
export const useTurnBasedGame = ({ gameState, enemies }) => {
  const [turnState, setTurnState] = useState({
    currentTurn: TURN_STATES.PLAYER_TURN,
    turnNumber: 1,
    roundNumber: 1,
    isTransitioning: false,
    selectedAction: null,
    selectedTarget: null,
    remainingTime: 0,
    turnProgress: 0,
    currentAttack: null,
    expectedDefense: null
  });

  const [turnResults, setTurnResults] = useState([]);
  const callbacksRef = useRef({});

  // Définir les callbacks pour le TurnManagerService
  const setupCallbacks = useCallback(() => {
    callbacksRef.current = {
      onTurnTransition: (newTurnState, turnNumber, roundNumber) => {
        setTurnState(prev => ({
          ...prev,
          currentTurn: TURN_STATES.TRANSITION,
          isTransitioning: true,
          turnNumber,
          roundNumber
        }));
      },

      onPlayerTurnStart: (turnNumber, roundNumber) => {
        setTurnState(prev => ({
          ...prev,
          currentTurn: TURN_STATES.PLAYER_TURN,
          isTransitioning: false,
          turnNumber,
          roundNumber,
          selectedAction: null,
          selectedTarget: null,
          remainingTime: 5000 // TIMING_CONFIG.PLAYER_TURN_DURATION
        }));
      },

      onPlayerTurnEnd: (actionResult, turnNumber) => {
        if (actionResult) {
          setTurnResults(prev => [...prev, actionResult]);
        }
        
        setTurnState(prev => ({
          ...prev,
          selectedAction: null,
          selectedTarget: null,
          remainingTime: 0
        }));
      },

      onEnemyTurnStart: (turnNumber, roundNumber) => {
        setTurnState(prev => ({
          ...prev,
          currentTurn: TURN_STATES.ENEMY_TURN,
          isTransitioning: false,
          turnNumber,
          roundNumber,
          currentAttack: null,
          expectedDefense: null
        }));
      },

      onEnemyTurnEnd: (turnNumber) => {
        setTurnState(prev => ({
          ...prev,
          currentAttack: null,
          expectedDefense: null
        }));
      },

      onAttackPhaseChange: (phase, attackType, enemy, attack) => {
        // Mise à jour de l'état pendant les phases d'attaque
        console.log(`Attack phase: ${phase}, Type: ${attackType}`);
      },

      onAttackExecution: (attackType, enemy, attack) => {
        // Moment critique où le joueur doit réagir
        const expectedDefense = turnManagerService._getExpectedDefense(attackType);
        
        setTurnState(prev => ({
          ...prev,
          currentAttack: attack,
          expectedDefense
        }));
      },

      onAttackComplete: (attack, enemy) => {
        setTurnState(prev => ({
          ...prev,
          currentAttack: null,
          expectedDefense: null
        }));
      },

      onDefenseResult: (defenseResult, attack) => {
        setTurnResults(prev => [...prev, defenseResult]);
      },

      onRoundEnd: (roundNumber, gameState) => {
        console.log(`Round ${roundNumber} ended`);
      },

      onRoundStart: (roundNumber) => {
        console.log(`Round ${roundNumber} started`);
        setTurnResults([]); // Clear previous round results
      }
    };
  }, []);

  // Initialiser les callbacks
  useEffect(() => {
    setupCallbacks();
  }, [setupCallbacks]);

  // Timer pour le tour du joueur
  useEffect(() => {
    let interval;
    
    if (turnState.currentTurn === TURN_STATES.PLAYER_TURN && !turnState.isTransitioning) {
      interval = setInterval(() => {
        const remaining = playerTurnService.getRemainingTime();
        const progress = playerTurnService.getTurnProgress();
        
        setTurnState(prev => ({
          ...prev,
          remainingTime: remaining,
          turnProgress: progress
        }));
        
        if (remaining <= 0) {
          clearInterval(interval);
        }
      }, 100);
    }
    
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [turnState.currentTurn, turnState.isTransitioning]);

  // Actions du joueur
  const selectPlayerAction = useCallback((action, targetId = null) => {
    if (turnState.currentTurn !== TURN_STATES.PLAYER_TURN || turnState.isTransitioning) {
      console.warn('Cannot select action: not player turn');
      return false;
    }

    const success = playerTurnService.selectAction(action, targetId);
    
    if (success) {
      setTurnState(prev => ({
        ...prev,
        selectedAction: action,
        selectedTarget: targetId
      }));
    }
    
    return success;
  }, [turnState.currentTurn, turnState.isTransitioning]);

  const confirmPlayerAction = useCallback(() => {
    if (!turnState.selectedAction) {
      console.warn('No action selected');
      return false;
    }

    return turnManagerService.confirmPlayerAction(
      gameState, 
      enemies, 
      callbacksRef.current
    );
  }, [turnState.selectedAction, gameState, enemies]);

  // Actions de défense pendant les attaques ennemies
  const defendAgainstAttack = useCallback((defenseAction) => {
    if (turnState.currentTurn !== TURN_STATES.ENEMY_TURN || !turnState.currentAttack) {
      console.warn('Cannot defend: no active attack');
      return false;
    }

    return turnManagerService.handlePlayerDefense(
      defenseAction,
      turnState.currentAttack,
      callbacksRef.current
    );
  }, [turnState.currentTurn, turnState.currentAttack]);

  // Démarrer un nouveau round
  const startNewRound = useCallback(() => {
    return turnManagerService.startNewRound(
      gameState,
      enemies,
      callbacksRef.current
    );
  }, [gameState, enemies]);

  // Actions rapides pour l'interface
  const selectHeal = useCallback(() => {
    return selectPlayerAction(PLAYER_ACTIONS.HEAL);
  }, [selectPlayerAction]);

  const selectAttack = useCallback((targetId) => {
    return selectPlayerAction(PLAYER_ACTIONS.ATTACK, targetId);
  }, [selectPlayerAction]);

  const selectDefend = useCallback(() => {
    return selectPlayerAction(PLAYER_ACTIONS.DEFEND);
  }, [selectPlayerAction]);

  // Défenses rapides
  const dodge = useCallback(() => {
    return defendAgainstAttack('dodge');
  }, [defendAgainstAttack]);

  const parry = useCallback(() => {
    return defendAgainstAttack('parry');
  }, [defendAgainstAttack]);

  const waitForFeint = useCallback(() => {
    return defendAgainstAttack('none');
  }, [defendAgainstAttack]);

  // Vérifications d'état
  const canSelectAction = useCallback((action) => {
    if (turnState.currentTurn !== TURN_STATES.PLAYER_TURN || turnState.isTransitioning) {
      return false;
    }
    
    return playerTurnService.isActionAvailable(action, gameState);
  }, [turnState.currentTurn, turnState.isTransitioning, gameState]);

  const canConfirmAction = useCallback(() => {
    return turnState.selectedAction !== null && 
           turnState.currentTurn === TURN_STATES.PLAYER_TURN &&
           !turnState.isTransitioning;
  }, [turnState.selectedAction, turnState.currentTurn, turnState.isTransitioning]);

  // Informations utiles pour l'UI
  const getAvailableTargets = useCallback(() => {
    return enemies
      .map((enemy, index) => ({
        id: index,
        health: enemy?.userData?.health || 100,
        isAlive: (enemy?.userData?.health || 100) > 0,
        isAttacking: enemy?.userData?.isAttacking || false
      }))
      .filter(target => target.isAlive);
  }, [enemies]);

  const getTurnTimeRemaining = useCallback(() => {
    return Math.max(0, turnState.remainingTime);
  }, [turnState.remainingTime]);

  const getTurnProgress = useCallback(() => {
    return turnState.turnProgress;
  }, [turnState.turnProgress]);

  // Nettoyage
  useEffect(() => {
    return () => {
      turnManagerService.dispose();
    };
  }, []);

  return {
    // État
    turnState,
    turnResults,
    
    // Actions du joueur
    selectPlayerAction,
    confirmPlayerAction,
    selectHeal,
    selectAttack,
    selectDefend,
    
    // Actions de défense
    defendAgainstAttack,
    dodge,
    parry,
    waitForFeint,
    
    // Contrôle de jeu
    startNewRound,
    
    // Vérifications
    canSelectAction,
    canConfirmAction,
    
    // Informations utiles
    getAvailableTargets,
    getTurnTimeRemaining,
    getTurnProgress,
    
    // Getters d'état
    isPlayerTurn: turnState.currentTurn === TURN_STATES.PLAYER_TURN,
    isEnemyTurn: turnState.currentTurn === TURN_STATES.ENEMY_TURN,
    isTransitioning: turnState.isTransitioning,
    hasSelectedAction: turnState.selectedAction !== null,
    currentAttack: turnState.currentAttack,
    expectedDefense: turnState.expectedDefense,
    currentRound: turnState.roundNumber,
    currentTurnNumber: turnState.turnNumber
  };
};