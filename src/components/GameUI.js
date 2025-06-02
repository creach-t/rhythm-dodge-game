import React from 'react';
import { View, Text, StyleSheet, SafeAreaView, Animated } from 'react-native';
import { COLORS, BUTTON_CONFIG } from '../utils/Constants';
import GameButton from './GameButton';

const GameUI = ({ 
  score = 0, 
  health = 100, 
  combo = 0,
  gameState = 'playing',
  expectedAction = null,
  onDodge,
  onParry,
  resultMessage,
  fadeAnim,
}) => {
  // Déterminer les couleurs des boutons selon l'action attendue
  const getButtonColor = (buttonType) => {
    if (gameState !== 'playing' || !expectedAction) return COLORS.UI_BORDER;
    
    if (buttonType === 'dodge' && expectedAction === 'dodge') {
      return COLORS.WARNING; // Jaune pour esquive
    } else if (buttonType === 'parry' && expectedAction === 'parry') {
      return COLORS.SECONDARY; // Bleu pour parade
    } else if (expectedAction === 'none') {
      return COLORS.DANGER; // Rouge pour ne rien faire
    }
    
    return COLORS.UI_BORDER;
  };

  // Calculer la couleur de la barre de santé
  const getHealthColor = () => {
    if (health > 60) return COLORS.SUCCESS;
    if (health > 30) return COLORS.WARNING;
    return COLORS.DANGER;
  };

  return (
    <>
      {/* Interface supérieure - Stats */}
      <View style={styles.topUI}>
        <SafeAreaView>
          <View style={styles.statsContainer}>
            <View style={styles.statItem}>
              <Text style={styles.statLabel}>Score</Text>
              <Text style={styles.statValue}>{score.toLocaleString()}</Text>
            </View>
            
            <View style={styles.statItem}>
              <Text style={styles.statLabel}>Santé</Text>
              <View style={styles.healthBar}>
                <View 
                  style={[
                    styles.healthFill, 
                    { 
                      width: `${health}%`,
                      backgroundColor: getHealthColor()
                    }
                  ]} 
                />
              </View>
              <Text style={styles.statValue}>{health}%</Text>
            </View>
            
            {combo > 0 && (
              <View style={styles.statItem}>
                <Text style={styles.statLabel}>Combo</Text>
                <Text style={[styles.statValue, styles.comboText]}>x{combo}</Text>
              </View>
            )}
          </View>
                {resultMessage ? (
        <Animated.View style={[styles.resultMessageContainer, { opacity: fadeAnim }]}>
          <Text style={styles.resultMessageText}>{resultMessage}</Text>
        </Animated.View>
      ) : null}
        </SafeAreaView>
      </View>

      {/* Interface inférieure - Contrôles */}
      <View style={styles.bottomUI}>
        <View style={styles.controlsContainer}>
          {/* Indicateur d'action */}
          {expectedAction && (
            <View style={styles.actionIndicator}>
              <Text style={styles.actionText}>
                {expectedAction === 'dodge' ? '⚡ ESQUIVE!' : 
                 expectedAction === 'parry' ? '🛡️ PARADE!' :
                 expectedAction === 'none' ? '⏸️ ATTENDRE!' : ''}
              </Text>
            </View>
          )}

          {/* Boutons de contrôle */}
          <View style={styles.buttonsContainer}>
            <View style={styles.buttonWrapper}>
              <Text style={styles.buttonLabel}>PARADE</Text>
              <GameButton
                title="🛡️"
                type="parry"
                onPress={onParry}
                disabled={gameState !== 'playing'}
                testID="parry-button"
                color={getButtonColor('parry')}
                highlighted={expectedAction === 'parry'}
              />
            </View>

            <View style={styles.centerSpace}>
              {gameState !== 'playing' && (
                <Text style={styles.gameStateText}>
                  {gameState === 'paused' ? 'PAUSE' : 
                   gameState === 'game_over' ? 'GAME OVER' : 
                   'EN ATTENTE...'}
                </Text>
              )}
            </View>

            <View style={styles.buttonWrapper}>
              <Text style={styles.buttonLabel}>ESQUIVE</Text>
              <GameButton
                title="⚡"
                type="dodge"
                onPress={onDodge}
                disabled={gameState !== 'playing'}
                testID="dodge-button"
                color={getButtonColor('dodge')}
                highlighted={expectedAction === 'dodge'}
              />
            </View>
          </View>
        </View>
      </View>
    </>
  );
};

const styles = StyleSheet.create({
  topUI: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    paddingHorizontal: 20,
    paddingVertical: 10,
    backgroundColor: COLORS.UI_BACKGROUND + 'F0',
    borderBottomWidth: 2,
    borderBottomColor: COLORS.UI_BORDER,
    zIndex: 10,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 10,
  },
  statItem: {
    alignItems: 'center',
    minWidth: 80,
  },
  statLabel: {
    fontSize: 12,
    color: COLORS.TEXT_SECONDARY,
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: 4,
  },
  statValue: {
    fontSize: 18,
    color: COLORS.TEXT,
    fontWeight: 'bold',
  },
  comboText: {
    color: COLORS.WARNING,
    fontSize: 20,
  },
  container: {
    flex: 1,
  },
  resultMessageContainer: {
    position: 'absolute',
    top: '500%',
    left: '50%',
    transform: [{ translateX: -150 }, { translateY: -20 }], // centre approx. selon largeur/hauteur du texte
    width: 300,
    paddingVertical: 10,
    paddingHorizontal: 20,
    backgroundColor: 'rgba(0,0,0,0.7)',
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1000,
  },
  resultMessageText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  healthBar: {
    width: 100,
    height: 8,
    backgroundColor: COLORS.UI_BORDER,
    borderRadius: 4,
    marginVertical: 4,
    overflow: 'hidden',
  },
  healthFill: {
    height: '100%',
    borderRadius: 4,
    transition: 'width 0.3s ease-out',
  },
  bottomUI: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    paddingHorizontal: 20,
    paddingVertical: 15,
    backgroundColor: COLORS.UI_BACKGROUND + 'F0',
    borderTopWidth: 2,
    borderTopColor: COLORS.UI_BORDER,
    zIndex: 10,
  },
  controlsContainer: {
    alignItems: 'center',
  },
  actionIndicator: {
    marginBottom: 10,
    paddingHorizontal: 20,
    paddingVertical: 8,
    backgroundColor: COLORS.UI_BACKGROUND,
    borderRadius: 20,
    borderWidth: 2,
    borderColor: COLORS.PRIMARY,
  },
  actionText: {
    fontSize: 16,
    color: COLORS.TEXT,
    fontWeight: 'bold',
    letterSpacing: 1,
  },
  buttonsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '100%',
    maxWidth: 400,
  },
  buttonWrapper: {
    alignItems: 'center',
  },
  buttonLabel: {
    fontSize: 12,
    color: COLORS.TEXT_SECONDARY,
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: 8,
    fontWeight: '600',
  },
  centerSpace: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: 20,
  },
  gameStateText: {
    fontSize: 16,
    color: COLORS.PRIMARY,
    fontWeight: 'bold',
    textTransform: 'uppercase',
    letterSpacing: 2,
  },
});

export default GameUI;