import React, { useRef, useCallback } from 'react';
import { View, StyleSheet, Animated } from 'react-native';
import { GLView } from 'expo-gl';

// Hooks modulaires
import { useGameState } from '../hooks/useGameState';
import { useThreeJS } from '../hooks/useThreeJS';
import { useGameLoop } from '../hooks/useGameLoop';

// Services
import { attackService } from '../services/AttackService';
import { playerActionService } from '../services/PlayerActionService';

// Composants
import GameUI from './GameUI';

// Constants
import { TIMING_CONFIG, COLORS } from '../utils/Constants';

/**
 * Composant GameScreen refactorisé
 * Responsabilité unique : Orchestration des modules et rendu de l'interface
 */
const GameScreen = () => {
  // ====================================================================
  // HOOKS DE GESTION D'ÉTAT
  // ====================================================================
  
  const {
    gameState,
    updateScore,
    takeDamage,
    heal,
    setExpectedAction,
    setResultMessage,
    clearResultMessage,
    gameOver,
    isPlaying,
    isGameOver,
    isDead
  } = useGameState();

  const {
    initializeScene,
    renderFrame,
    dispose,
    getEnemy,
    getAllEnemies
  } = useThreeJS();

  // ====================================================================
  // ANIMATION ET TIMING
  // ====================================================================
  
  const fadeAnim = useRef(new Animated.Value(0)).current;
  
  // Fonction de rendu appelée à chaque frame
  const handleRenderFrame = useCallback((time, deltaTime) => {
    renderFrame(time);
  }, [renderFrame]);

  // Hook de boucle de jeu
  useGameLoop({
    isPlaying,
    onRenderFrame: handleRenderFrame
  });

  // ====================================================================
  // LOGIQUE DE JEU
  // ====================================================================

  // Démarrer le gameplay après initialisation
  const startGameplay = useCallback(() => {
    console.log('Starting gameplay...');
    setTimeout(() => {
      triggerNextAttack();
    }, TIMING_CONFIG.ROUND_START_DELAY);
  }, []);

  // Déclencher une attaque aléatoire
  const triggerNextAttack = useCallback(() => {
    if (!isPlaying || attackService.awaitingAction) return;

    clearResultMessage();

    try {
      const enemies = getAllEnemies();
      const attackInfo = attackService.triggerRandomAttack(enemies, handleAttackTimeout);

      if (attackInfo) {
        setExpectedAction(attackInfo.expectedAction);
        console.log(`Attack triggered: ${attackInfo.attackType} from enemy ${attackInfo.enemyId}`);
      }
    } catch (error) {
      console.error('Error triggering attack:', error);
    }
  }, [isPlaying, getAllEnemies, setExpectedAction, clearResultMessage]);

  // Gérer le timeout d'attaque
  const handleAttackTimeout = useCallback(() => {
    console.log('Attack timed out');
    
    const result = playerActionService.processTimeout();
    processActionResult(result);
  }, []);

  // Traiter le résultat d'une action
  const processActionResult = useCallback((result) => {
    try {
      // Réinitialiser l'attaque
      attackService.resetAttack();
      attackService.resetAllEnemies(getAllEnemies());
      setExpectedAction(null);

      // Appliquer les changements de score et santé
      if (result.scoreChange !== 0) {
        updateScore(result.scoreChange);
      }
      
      if (result.healthChange !== 0) {
        if (result.healthChange > 0) {
          heal(result.healthChange);
        } else {
          takeDamage(-result.healthChange);
        }
      }

      // Afficher le message de résultat
      showResultMessage(result.message);

      // Vérifier game over
      if (isDead) {
        gameOver();
        return;
      }

      // Programmer la prochaine attaque
      setTimeout(() => {
        if (isPlaying) {
          triggerNextAttack();
        }
      }, TIMING_CONFIG.ACTION_RESULT_DISPLAY);

    } catch (error) {
      console.error('Error processing action result:', error);
    }
  }, [getAllEnemies, setExpectedAction, updateScore, heal, takeDamage, isDead, gameOver, isPlaying, triggerNextAttack]);

  // ====================================================================
  // GESTION DES ACTIONS DU JOUEUR
  // ====================================================================

  const handlePlayerAction = useCallback((action) => {
    if (!attackService.awaitingAction) {
      console.log('No action expected at this time');
      return;
    }

    try {
      // Évaluer le timing
      const timingResult = attackService.evaluateTiming();
      
      // Traiter l'action avec le service
      const result = playerActionService.processAction(
        action,
        gameState.expectedAction,
        timingResult
      );

      console.log(`Player action: ${action}, Result:`, result);
      
      // Traiter le résultat
      processActionResult(result);

    } catch (error) {
      console.error('Error handling player action:', error);
    }
  }, [gameState.expectedAction, processActionResult]);

  const handleDodge = useCallback(() => {
    handlePlayerAction('dodge');
  }, [handlePlayerAction]);

  const handleParry = useCallback(() => {
    handlePlayerAction('parry');
  }, [handlePlayerAction]);

  // ====================================================================
  // GESTION DES MESSAGES VISUELS
  // ====================================================================

  const showResultMessage = useCallback((message) => {
    setResultMessage(message);

    // Animation de fade
    fadeAnim.setValue(1);
    Animated.timing(fadeAnim, {
      toValue: 0,
      duration: TIMING_CONFIG.ACTION_RESULT_DISPLAY,
      useNativeDriver: true,
    }).start(() => {
      setTimeout(() => {
        clearResultMessage();
      }, 0);
    });
  }, [setResultMessage, clearResultMessage, fadeAnim]);

  // ====================================================================
  // INITIALISATION DE LA SCÈNE 3D
  // ====================================================================

  const handleContextCreate = useCallback(async (gl) => {
    try {
      await initializeScene(gl);
      startGameplay();
    } catch (error) {
      console.error('Failed to initialize scene:', error);
    }
  }, [initializeScene, startGameplay]);

  // ====================================================================
  // NETTOYAGE
  // ====================================================================

  React.useEffect(() => {
    return () => {
      dispose();
      attackService.resetAttack();
      playerActionService.resetHistory();
    };
  }, [dispose]);

  // ====================================================================
  // RENDU
  // ====================================================================

  return (
    <View style={styles.container}>
      <GLView
        style={styles.glView}
        onContextCreate={handleContextCreate}
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

// ====================================================================
// STYLES
// ====================================================================

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.BACKGROUND,
  },
  glView: {
    flex: 1,
  },
});

export default GameScreen;