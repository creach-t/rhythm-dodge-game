import React from 'react';
import { Animated, SafeAreaView, Text, View } from 'react-native';
import {
  ATTACK_TYPES,
  COLORS,
  ENEMY_CONFIG,
  PLAYER_CONFIG,
} from '../../utils/Constants';
import GameButton from '../GameButton';
import styles from './GameUI.styles';

interface GameUIProps {
  score?: number;
  health?: number;
  combo?: number;
  gameState?: 'playing' | 'paused' | 'game_over' | string;
  currentAttackType?: string | null;
  onDodge: () => void;
  onParry: () => void;
  onRestart: () => void;
  resultMessage?: string;
  fadeAnim?: Animated.Value;
  enemyHealths: number[];
}

const GameUI: React.FC<GameUIProps> = ({
  score = 0,
  health = 100,
  combo = 0,
  gameState = 'playing',
  currentAttackType = null,
  onDodge,
  onParry,
  onRestart,
  resultMessage,
  fadeAnim,
  enemyHealths,
}) => {
  // Déterminer les messages d'attaque
  const getAttackMessage = () => {
    if (!currentAttackType) return null;

    switch (currentAttackType) {
      case ATTACK_TYPES.NORMAL:
        return '⚔️ ATTAQUE NORMALE!';
      case ATTACK_TYPES.HEAVY:
        return '💥 ATTAQUE LOURDE!';
      case ATTACK_TYPES.FEINT:
        return '🎭 FEINTE! Ne touchez rien!';
      default:
        return null;
    }
  };

  // Déterminer les couleurs des boutons selon l'attaque
  const getButtonColor = () => {
    if (gameState !== 'playing' || !currentAttackType) return COLORS.UI_BORDER;

    // Pendant une feinte, tous les boutons sont rouges (danger)
    if (currentAttackType === ATTACK_TYPES.FEINT) {
      return COLORS.DANGER;
    }

    // Sinon, boutons normaux
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
                      width: `${(health / PLAYER_CONFIG.HEALTH) * 100}%`,
                      backgroundColor: getHealthColor(),
                    },
                  ]}
                />
              </View>
              <Text style={styles.statValue}>
                {(health / PLAYER_CONFIG.HEALTH) * 100}%
              </Text>
            </View>

            {combo > 0 && (
              <View style={styles.statItem}>
                <Text style={styles.statLabel}>Combo</Text>
                <Text style={[styles.statValue, styles.comboText]}>
                  x{combo}
                </Text>
              </View>
            )}
          </View>

          {/* Santé des ennemis */}
          <View style={styles.enemyHealthContainer}>
            {enemyHealths.map((enemyHealth, index) => (
              <View key={index} style={styles.enemyHealthItem}>
                <Text style={styles.enemyLabel}>Ennemi {index + 1}</Text>
                <View style={styles.enemyHealthBar}>
                  <View
                    style={[
                      styles.enemyHealthFill,
                      {
                        width: `${(enemyHealth / ENEMY_CONFIG.HEALTH) * 100}%`,
                        backgroundColor:
                          enemyHealth > 0 ? COLORS.DANGER : COLORS.UI_BORDER,
                      },
                    ]}
                  />
                </View>
              </View>
            ))}
          </View>
        </SafeAreaView>
      </View>

      {/* Interface inférieure - Contrôles */}
      <View style={styles.bottomUI}>
        <View style={styles.controlsContainer}>
          {/* Indicateur d'attaque */}
          {currentAttackType && (
            <View
              style={[
                styles.actionIndicator,
                {
                  borderColor:
                    currentAttackType === ATTACK_TYPES.FEINT
                      ? COLORS.DANGER
                      : COLORS.PRIMARY,
                },
              ]}
            >
              <Text style={styles.actionText}>{getAttackMessage()}</Text>
            </View>
          )}

          {/* Message de résultat */}
          {resultMessage ? (
            <Animated.View
              style={[
                styles.actionIndicator,
                {
                  borderColor: COLORS.SUCCESS,
                  marginBottom: 10,
                  opacity: fadeAnim,
                },
              ]}
            >
              <Text style={[styles.actionText, {color: COLORS.SUCCESS}]}>
                {resultMessage}
              </Text>
            </Animated.View>
          ) : null}

          {/* Boutons de contrôle */}
          <View style={styles.buttonsContainer}>
            <View style={styles.buttonWrapper}>
              <Text style={styles.buttonLabel}>PARADE</Text>
              <Text style={styles.buttonDescription}>Haut risque</Text>
              <Text style={styles.buttonDescription}>Contre-attaque</Text>
              <GameButton
                title="🛡️"
                type="parry"
                onPress={onParry}
                disabled={gameState !== 'playing'}
                testID="parry-button"
                color={getButtonColor()}
              />
            </View>

            <View style={styles.centerSpace}>
              {gameState === 'paused' && (
                <Text style={styles.gameStateText}>PAUSE</Text>
              )}
              {gameState === 'game_over' && (
                <>
                  <Text style={styles.gameStateText}>GAME OVER</Text>
                  <Text style={{color: COLORS.TEXT_SECONDARY, marginBottom: 8}}>
                    Score final : {score.toLocaleString()}
                  </Text>
                  <GameButton
                    title="🔁 Rejouer"
                    onPress={onRestart}
                    type="restart"
                    color={COLORS.PRIMARY}
                    testID="restart-button"
                  />
                </>
              )}
              {gameState !== 'playing' &&
                gameState !== 'paused' &&
                gameState !== 'game_over' && (
                  <Text style={styles.gameStateText}>EN ATTENTE...</Text>
                )}
            </View>

            <View style={styles.buttonWrapper}>
              <Text style={styles.buttonLabel}>ESQUIVE</Text>
              <Text style={styles.buttonDescription}>Faible risque</Text>
              <Text style={styles.buttonDescription}>Évite dégâts</Text>
              <GameButton
                title="⚡"
                type="dodge"
                onPress={onDodge}
                disabled={gameState !== 'playing'}
                testID="dodge-button"
                color={getButtonColor()}
              />
            </View>
          </View>
        </View>
      </View>
    </>
  );
};

export default GameUI;
