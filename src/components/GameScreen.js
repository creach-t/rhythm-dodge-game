import React, { useRef, useCallback } from 'react';
import { View, Text, StyleSheet, Animated } from 'react-native';
import { GLView } from 'expo-gl';

// Hooks modulaires
import { useGameState } from '../hooks/useGameState';
import { useThreeJS } from '../hooks/useThreeJS';
import { useGameLoop } from '../hooks/useGameLoop';

// Services NOUVEAUX - CORRIGÉS POUR FEINTES
import { attackPhaseService } from '../services/AttackPhaseService';
import { playerActionService } from '../services/PlayerActionService';

// Composants NOUVEAUX
import TurnBasedUI from './TurnBasedUI';

// Constants
import { TIMING_CONFIG, COLORS, ATTACK_TYPES } from '../utils/Constants';

/**
 * Composant GameScreen refactorisé - UTILISE LES NOUVEAUX SERVICES
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
  // ÉTAT LOCAL POUR LE NOUVEAU SYSTÈME
  // ====================================================================
  
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const [currentAttack, setCurrentAttack] = React.useState(null);
  const [expectedDefense, setExpectedDefense] = React.useState(null);
  
  // Fonction de rendu appelée à chaque frame
  const handleRenderFrame = useCallback((time, deltaTime) => {
    renderFrame(time);
    
    // Animer les ennemis qui attaquent
    const enemies = getAllEnemies();
    if (enemies && enemies.length > 0) {
      attackPhaseService.animateAttackingEnemies(enemies, time);
    }
  }, [renderFrame, getAllEnemies]);

  // Hook de boucle de jeu
  useGameLoop({
    isPlaying,
    onRenderFrame: handleRenderFrame
  });

  // ====================================================================
  // LOGIQUE DE JEU - NOUVEAU SYSTÈME
  // ====================================================================

  // Démarrer le gameplay après initialisation
  const startGameplay = useCallback(() => {
    console.log('Starting gameplay...');
    setTimeout(() => {
      triggerNextAttack();
    }, TIMING_CONFIG.ROUND_START_DELAY);
  }, []);

  // Obtenir un type d'attaque aléatoire
  const getRandomAttackType = useCallback(() => {
    const types = Object.values(ATTACK_TYPES);
    return types[Math.floor(Math.random() * types.length)];
  }, []);

  // Obtenir un ennemi aléatoire
  const getRandomEnemyId = useCallback(() => {
    const enemies = getAllEnemies();
    if (!enemies || enemies.length === 0) return 0;
    return Math.floor(Math.random() * enemies.length);
  }, [getAllEnemies]);

  // Obtenir l'action de défense attendue
  const getExpectedDefenseAction = useCallback((attackType) => {
    switch (attackType) {
      case ATTACK_TYPES.NORMAL:
        return 'dodge';
      case ATTACK_TYPES.HEAVY:
        return 'parry';
      case ATTACK_TYPES.FEINT:
        return 'none'; // Ne rien faire pour les feintes
      default:
        return 'none';
    }
  }, []);

  // Déclencher une attaque avec le nouveau système
  const triggerNextAttack = useCallback(() => {
    if (!isPlaying) return;

    clearResultMessage();

    try {
      const enemies = getAllEnemies();
      if (!enemies || enemies.length === 0) {
        console.warn('No enemies available for attack');
        return;
      }

      const enemyId = getRandomEnemyId();
      const attackType = getRandomAttackType();
      const enemy = enemies[enemyId];
      
      if (!enemy) {
        console.warn('Selected enemy not found');
        return;
      }

      console.log(`🎯 Triggering attack: Enemy ${enemyId}, Type: ${attackType}`);

      // Mettre à jour l'état de l'attaque actuelle
      const attackInfo = {
        enemyId,
        type: attackType,
        enemy
      };
      
      setCurrentAttack(attackInfo);
      setExpectedDefense(getExpectedDefenseAction(attackType));

      // Démarrer l'attaque avec le nouveau service
      const success = attackPhaseService.startAttack(enemy, attackType, {
        onPhaseChange: (phase, type, enemy) => {
          console.log(`📍 Phase changed: ${phase} for ${type}`);
        },
        onExecutionPhase: (type, enemy) => {
          console.log(`⚡ Execution phase: ${type}`);
          // Pour les feintes, programmé la fin automatique
          if (type === ATTACK_TYPES.FEINT) {
            setTimeout(() => {
              handleFeintComplete();
            }, TIMING_CONFIG.ATTACK_EXECUTION_DURATION);
          }
        },
        onComplete: (enemy) => {
          console.log(`✅ Attack completed`);
          handleAttackComplete();
        }
      });

      if (!success) {
        console.warn('Failed to start attack');
        handleAttackComplete();
      }

    } catch (error) {
      console.error('Error triggering attack:', error);
      handleAttackComplete();
    }
  }, [isPlaying, getAllEnemies, getRandomEnemyId, getRandomAttackType, getExpectedDefenseAction, clearResultMessage]);

  // Gérer la fin automatique d'une feinte
  const handleFeintComplete = useCallback(() => {
    if (currentAttack?.type === ATTACK_TYPES.FEINT) {
      // Vérifier si le joueur a bougé pendant la feinte
      const feintResult = attackPhaseService.evaluateFeintSuccess();
      
      if (feintResult) {
        // Succès de feinte
        processActionResult({
          success: true,
          message: feintResult.message,
          scoreChange: 10, // Bonus pour avoir évité la feinte
          healthChange: 0
        });
      }
    }
  }, [currentAttack]);

  // Gérer la fin d'une attaque
  const handleAttackComplete = useCallback(() => {
    setCurrentAttack(null);
    setExpectedDefense(null);
    
    // Programmer la prochaine attaque
    setTimeout(() => {
      if (isPlaying && !isDead) {
        triggerNextAttack();
      }
    }, TIMING_CONFIG.ACTION_RESULT_DISPLAY);
  }, [isPlaying, isDead, triggerNextAttack]);

  // Traiter le résultat d'une action
  const processActionResult = useCallback((result) => {
    try {
      console.log('📊 Processing action result:', result);

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

    } catch (error) {
      console.error('Error processing action result:', error);
    }
  }, [updateScore, heal, takeDamage, isDead, gameOver]);

  // ====================================================================
  // GESTION DES ACTIONS DU JOUEUR - NOUVEAU SYSTÈME
  // ====================================================================

  const handlePlayerAction = useCallback((action) => {
    if (!currentAttack) {
      console.log('No attack in progress');
      return;
    }

    try {
      console.log(`🎮 Player action: ${action} during ${currentAttack.type}`);

      // Évaluer le timing avec le nouveau service
      const timingResult = attackPhaseService.evaluatePlayerTiming();
      
      if (!timingResult) {
        console.log('No valid timing evaluation');
        return;
      }

      // Traiter l'action avec le service existant
      const expectedAction = getExpectedDefenseAction(currentAttack.type);
      const result = playerActionService.processAction(
        action,
        expectedAction,
        timingResult
      );

      console.log(`📊 Action result:`, result);
      
      // Traiter le résultat
      processActionResult(result);

    } catch (error) {
      console.error('Error handling player action:', error);
    }
  }, [currentAttack, getExpectedDefenseAction, processActionResult]);

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
    Animated.timing(fadeAnim, TemplateString`
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
      attackPhaseService.cancelAllAttacks();
      playerActionService.resetHistory();
    };
  }, [dispose]);

  // ====================================================================
  // RENDU - NOUVEAU UI
  // ====================================================================

  return (
    <View style={styles.container}>
      <GLView
        style={styles.glView}
        onContextCreate={handleContextCreate}
      />
      
      {/* NOUVEAU UI SYSTÈME */}
      <TurnBasedUI
        turnState={{
          currentTurn: isPlaying ? 'ENEMY_TURN' : 'PREPARATION',
          turnNumber: 1,
          roundNumber: 1,
        }}
        gameState={{
          score: gameState.score,
          health: gameState.health,
          combo: gameState.combo,
          state: gameState.state
        }}
        availableTargets={[]} // Pas utilisé dans ce mode
        remainingTime={0} // Pas utilisé dans ce mode
        turnProgress={0} // Pas utilisé dans ce mode
        onSelectHeal={() => {}} // Pas utilisé dans ce mode
        onSelectAttack={() => {}} // Pas utilisé dans ce mode
        onSelectDefend={() => {}} // Pas utilisé dans ce mode
        onConfirmAction={() => {}} // Pas utilisé dans ce mode
        onDodge={handleDodge}
        onParry={handleParry}
        onWaitForFeint={() => {}} // Les feintes sont automatiques maintenant
        canSelectAction={() => false} // Mode défense uniquement
        canConfirmAction={false}
        hasSelectedAction={false}
        currentAttack={currentAttack}
        expectedDefense={expectedDefense}
      />

      {/* Message de résultat avec fade */}
      {gameState.resultMessage && (
        <Animated.View 
          style={[
            styles.resultMessage, 
            { opacity: fadeAnim }
          ]}
        >
          <Text style={styles.resultText}>
            {gameState.resultMessage}
          </Text>
        </Animated.View>
      )}

      {/* Informations de debug */}
      {__DEV__ && (
        <View style={styles.debugInfo}>
          <Text style={styles.debugText}>
            Attack: {currentAttack ? `${currentAttack.type} (${currentAttack.enemyId})` : 'None'}
          </Text>
          <Text style={styles.debugText}>
            Expected: {expectedDefense || 'None'}
          </Text>
          <Text style={styles.debugText}>
            Can React: {attackPhaseService.canPlayerReact() ? 'Yes' : 'No'}
          </Text>
          <Text style={styles.debugText}>
            Phase: {attackPhaseService.getDebugInfo().currentPhase || 'None'}
          </Text>
        </View>
      )}
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
  resultMessage: {
    position: 'absolute',
    top: '40%',
    left: 20,
    right: 20,
    alignItems: 'center',
    backgroundColor: COLORS.UI_BACKGROUND,
    padding: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: COLORS.PRIMARY,
  },
  resultText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: COLORS.TEXT,
    textAlign: 'center',
  },
  debugInfo: {
    position: 'absolute',
    top: 50,
    right: 10,
    backgroundColor: 'rgba(0,0,0,0.7)',
    padding: 10,
    borderRadius: 5,
  },
  debugText: {
    color: COLORS.TEXT,
    fontSize: 12,
    fontFamily: 'monospace',
  },
});

export default GameScreen;