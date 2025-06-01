import React from 'react';
import { View, Text, StyleSheet, SafeAreaView } from 'react-native';
import { COLORS, BUTTON_CONFIG } from '../utils/Constants';
import GameButton from './GameButton';

const GameUI = ({ 
  score = 0, 
  health = 100, 
  combo = 0,
  gameState = 'playing',
  onDodge,
  onParry,
  children 
}) => {
  return (
    <SafeAreaView style={styles.container}>
      {/* Interface supérieure - Stats */}
      <View style={styles.topUI}>
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
                  { width: `${health}%` }
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
      </View>

      {/* Zone de jeu centrale */}
      <View style={styles.gameArea}>
        {children}
      </View>

      {/* Interface inférieure - Contrôles */}
      <View style={styles.bottomUI}>
        <View style={styles.controlsContainer}>
          {/* Instructions */}
          <View style={styles.instructionsContainer}>
            <Text style={styles.instructionText}>
              Esquive (Droite) • Parade (Gauche)
            </Text>
          </View>

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
              />
            </View>
          </View>
        </View>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.BACKGROUND,
  },
  topUI: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    backgroundColor: COLORS.UI_BACKGROUND,
    borderBottomWidth: 2,
    borderBottomColor: COLORS.UI_BORDER,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
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
    backgroundColor: COLORS.SUCCESS,
    borderRadius: 4,
  },
  gameArea: {
    flex: 1,
    backgroundColor: COLORS.BACKGROUND,
  },
  bottomUI: {
    paddingHorizontal: 20,
    paddingVertical: 15,
    backgroundColor: COLORS.UI_BACKGROUND,
    borderTopWidth: 2,
    borderTopColor: COLORS.UI_BORDER,
  },
  controlsContainer: {
    alignItems: 'center',
  },
  instructionsContainer: {
    marginBottom: 15,
  },
  instructionText: {
    fontSize: 14,
    color: COLORS.TEXT_SECONDARY,
    textAlign: 'center',
    letterSpacing: 0.5,
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