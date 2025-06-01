import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Animated } from 'react-native';
import { 
  TURN_STATES, 
  PLAYER_ACTIONS, 
  UI_CONFIG, 
  COLORS 
} from '../utils/Constants';

/**
 * Composant d'interface pour les tours
 * Responsabilité unique : Interface utilisateur pour les actions de tour
 */
const TurnBasedUI = ({
  turnState,
  gameState,
  availableTargets,
  remainingTime,
  turnProgress,
  onSelectHeal,
  onSelectAttack,
  onSelectDefend,
  onConfirmAction,
  onDodge,
  onParry,
  onWaitForFeint,
  canSelectAction,
  canConfirmAction,
  hasSelectedAction,
  currentAttack,
  expectedDefense
}) => {

  // Rendu de l'indicateur de tour
  const renderTurnIndicator = () => {
    let turnText = '';
    let turnColor = COLORS.TEXT;

    switch (turnState.currentTurn) {
      case TURN_STATES.PLAYER_TURN:
        turnText = `Tour ${turnState.turnNumber} - Votre Tour`;
        turnColor = COLORS.SUCCESS;
        break;
      case TURN_STATES.ENEMY_TURN:
        turnText = `Tour ${turnState.turnNumber} - Tour Ennemi`;
        turnColor = COLORS.DANGER;
        break;
      case TURN_STATES.TRANSITION:
        turnText = 'Transition...';
        turnColor = COLORS.WARNING;
        break;
      default:
        turnText = 'Chargement...';
    }

    return (
      <View style={styles.turnIndicator}>
        <Text style={[styles.turnText, { color: turnColor }]}>
          {turnText}
        </Text>
        <Text style={styles.roundText}>
          Round {turnState.roundNumber}
        </Text>
        {turnState.currentTurn === TURN_STATES.PLAYER_TURN && (
          <View style={styles.timerContainer}>
            <Text style={styles.timerText}>
              {Math.ceil(remainingTime / 1000)}s
            </Text>
            <View style={styles.progressBar}>
              <View 
                style={[
                  styles.progressFill, 
                  { width: `${turnProgress * 100}%` }
                ]} 
              />
            </View>
          </View>
        )}
      </View>
    );
  };

  // Rendu des boutons d'action du joueur
  const renderPlayerActions = () => {
    if (turnState.currentTurn !== TURN_STATES.PLAYER_TURN) return null;

    return (
      <View style={styles.playerActionsContainer}>
        <Text style={styles.actionTitle}>Choisissez une action :</Text>
        
        <View style={styles.actionButtonsRow}>
          {/* Bouton Soin */}
          <TouchableOpacity
            style={[
              styles.actionButton,
              styles.healButton,
              !canSelectAction(PLAYER_ACTIONS.HEAL) && styles.disabledButton,
              turnState.selectedAction === PLAYER_ACTIONS.HEAL && styles.selectedButton
            ]}
            onPress={onSelectHeal}
            disabled={!canSelectAction(PLAYER_ACTIONS.HEAL)}
          >
            <Text style={styles.actionButtonText}>Soin</Text>
            <Text style={styles.actionButtonSubtext}>+25 PV</Text>
          </TouchableOpacity>

          {/* Bouton Défense */}
          <TouchableOpacity
            style={[
              styles.actionButton,
              styles.defendButton,
              !canSelectAction(PLAYER_ACTIONS.DEFEND) && styles.disabledButton,
              turnState.selectedAction === PLAYER_ACTIONS.DEFEND && styles.selectedButton
            ]}
            onPress={onSelectDefend}
            disabled={!canSelectAction(PLAYER_ACTIONS.DEFEND)}
          >
            <Text style={styles.actionButtonText}>Défense</Text>
            <Text style={styles.actionButtonSubtext}>-50% dégâts</Text>
          </TouchableOpacity>
        </View>

        {/* Boutons d'attaque avec sélection de cible */}
        <View style={styles.attackSection}>
          <Text style={styles.attackTitle}>Attaquer :</Text>
          <View style={styles.targetButtonsRow}>
            {availableTargets.map((target, index) => (
              <TouchableOpacity
                key={target.id}
                style={[
                  styles.targetButton,
                  styles.attackButton,
                  !canSelectAction(PLAYER_ACTIONS.ATTACK) && styles.disabledButton,
                  turnState.selectedAction === PLAYER_ACTIONS.ATTACK && 
                  turnState.selectedTarget === target.id && styles.selectedButton,
                  target.isAttacking && styles.attackingTargetButton
                ]}
                onPress={() => onSelectAttack(target.id)}
                disabled={!canSelectAction(PLAYER_ACTIONS.ATTACK)}
              >
                <Text style={styles.targetButtonText}>Ennemi {target.id + 1}</Text>
                <Text style={styles.targetHealthText}>{target.health} PV</Text>
                {target.isAttacking && (
                  <Text style={styles.attackingIndicator}>⚡</Text>
                )}
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Bouton de confirmation */}
        {hasSelectedAction && (
          <TouchableOpacity
            style={[
              styles.confirmButton,
              !canConfirmAction && styles.disabledButton
            ]}
            onPress={onConfirmAction}
            disabled={!canConfirmAction}
          >
            <Text style={styles.confirmButtonText}>
              Confirmer l'action
            </Text>
          </TouchableOpacity>
        )}
      </View>
    );
  };

  // Rendu des boutons de défense (pendant les attaques ennemies)
  const renderDefenseActions = () => {
    if (turnState.currentTurn !== TURN_STATES.ENEMY_TURN || !currentAttack) return null;

    return (
      <View style={styles.defenseContainer}>
        <Text style={styles.defenseTitle}>
          Ennemi {currentAttack.enemyId + 1} attaque !
        </Text>
        
        {expectedDefense && (
          <Text style={styles.expectedActionText}>
            Action attendue : {getDefenseActionText(expectedDefense)}
          </Text>
        )}

        <View style={styles.defenseButtonsRow}>
          <TouchableOpacity
            style={[
              styles.defenseButton,
              styles.dodgeButton,
              expectedDefense === 'dodge' && styles.expectedButton
            ]}
            onPress={onDodge}
          >
            <Text style={styles.defenseButtonText}>Esquiver</Text>
            <Text style={styles.defenseButtonSubtext}>vs Normal</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.defenseButton,
              styles.parryButton,
              expectedDefense === 'parry' && styles.expectedButton
            ]}
            onPress={onParry}
          >
            <Text style={styles.defenseButtonText}>Parer</Text>
            <Text style={styles.defenseButtonSubtext}>vs Lourd</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.defenseButton,
              styles.waitButton,
              expectedDefense === 'none' && styles.expectedButton
            ]}
            onPress={onWaitForFeint}
          >
            <Text style={styles.defenseButtonText}>Attendre</Text>
            <Text style={styles.defenseButtonSubtext}>vs Feinte</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  // Fonction helper pour le texte des actions de défense
  const getDefenseActionText = (action) => {
    switch (action) {
      case 'dodge': return 'Esquiver';
      case 'parry': return 'Parer';
      case 'none': return 'Attendre';
      default: return 'Inconnue';
    }
  };

  // Rendu de l'action sélectionnée
  const renderSelectedAction = () => {
    if (!hasSelectedAction) return null;

    let actionText = '';
    let targetText = '';

    switch (turnState.selectedAction) {
      case PLAYER_ACTIONS.HEAL:
        actionText = 'Soin sélectionné';
        break;
      case PLAYER_ACTIONS.DEFEND:
        actionText = 'Défense sélectionnée';
        break;
      case PLAYER_ACTIONS.ATTACK:
        actionText = 'Attaque sélectionnée';
        targetText = turnState.selectedTarget !== null 
          ? `Cible: Ennemi ${turnState.selectedTarget + 1}` 
          : 'Sélectionnez une cible';
        break;
    }

    return (
      <View style={styles.selectedActionContainer}>
        <Text style={styles.selectedActionText}>{actionText}</Text>
        {targetText && (
          <Text style={styles.selectedTargetText}>{targetText}</Text>
        )}
      </View>
    );
  };

  return (
    <View style={styles.container}>
      {renderTurnIndicator()}
      {renderPlayerActions()}
      {renderDefenseActions()}
      {renderSelectedAction()}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    pointerEvents: 'box-none',
  },

  // Indicateur de tour
  turnIndicator: {
    position: 'absolute',
    top: UI_CONFIG.HUD.PADDING,
    left: UI_CONFIG.HUD.PADDING,
    right: UI_CONFIG.HUD.PADDING,
    backgroundColor: COLORS.UI_BACKGROUND,
    borderRadius: 10,
    padding: 15,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.UI_BORDER,
  },

  turnText: {
    fontSize: UI_CONFIG.TURN_INDICATOR.FONT_SIZE,
    fontWeight: 'bold',
    marginBottom: 5,
  },

  roundText: {
    fontSize: 16,
    color: COLORS.TEXT_SECONDARY,
    marginBottom: 10,
  },

  timerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },

  timerText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.WARNING,
    minWidth: 30,
  },

  progressBar: {
    flex: 1,
    height: 8,
    backgroundColor: COLORS.UI_BORDER,
    borderRadius: 4,
    overflow: 'hidden',
  },

  progressFill: {
    height: '100%',
    backgroundColor: COLORS.WARNING,
    borderRadius: 4,
  },

  // Actions du joueur
  playerActionsContainer: {
    position: 'absolute',
    bottom: UI_CONFIG.HUD.PADDING,
    left: UI_CONFIG.HUD.PADDING,
    right: UI_CONFIG.HUD.PADDING,
    backgroundColor: COLORS.UI_BACKGROUND,
    borderRadius: 15,
    padding: 20,
    borderWidth: 1,
    borderColor: COLORS.UI_BORDER,
  },

  actionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.TEXT,
    marginBottom: 15,
    textAlign: 'center',
  },

  actionButtonsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 15,
  },

  actionButton: {
    paddingVertical: 15,
    paddingHorizontal: 20,
    borderRadius: UI_CONFIG.ACTION_BUTTONS.SIZE / 6,
    alignItems: 'center',
    minWidth: UI_CONFIG.ACTION_BUTTONS.SIZE,
    borderWidth: 2,
  },

  healButton: {
    backgroundColor: UI_CONFIG.ACTION_BUTTONS.HEAL_COLOR,
    borderColor: UI_CONFIG.ACTION_BUTTONS.HEAL_COLOR,
  },

  defendButton: {
    backgroundColor: UI_CONFIG.ACTION_BUTTONS.DEFEND_COLOR,
    borderColor: UI_CONFIG.ACTION_BUTTONS.DEFEND_COLOR,
  },

  actionButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: COLORS.TEXT,
  },

  actionButtonSubtext: {
    fontSize: 12,
    color: COLORS.TEXT_SECONDARY,
    marginTop: 2,
  },

  // Section d'attaque
  attackSection: {
    marginBottom: 15,
  },

  attackTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: COLORS.TEXT,
    marginBottom: 10,
    textAlign: 'center',
  },

  targetButtonsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },

  targetButton: {
    paddingVertical: 12,
    paddingHorizontal: 15,
    borderRadius: 8,
    alignItems: 'center',
    minWidth: 80,
    borderWidth: 2,
  },

  attackButton: {
    backgroundColor: UI_CONFIG.ACTION_BUTTONS.ATTACK_COLOR,
    borderColor: UI_CONFIG.ACTION_BUTTONS.ATTACK_COLOR,
  },

  attackingTargetButton: {
    borderColor: COLORS.WARNING,
    borderWidth: 3,
  },

  targetButtonText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: COLORS.TEXT,
  },

  targetHealthText: {
    fontSize: 12,
    color: COLORS.TEXT_SECONDARY,
    marginTop: 2,
  },

  attackingIndicator: {
    fontSize: 16,
    marginTop: 2,
  },

  // Boutons d'état
  selectedButton: {
    borderColor: COLORS.PRIMARY,
    borderWidth: 3,
  },

  disabledButton: {
    opacity: 0.5,
  },

  confirmButton: {
    backgroundColor: COLORS.SUCCESS,
    paddingVertical: 15,
    borderRadius: 10,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: COLORS.SUCCESS,
  },

  confirmButtonText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.TEXT,
  },

  // Actions de défense
  defenseContainer: {
    position: 'absolute',
    bottom: UI_CONFIG.HUD.PADDING,
    left: UI_CONFIG.HUD.PADDING,
    right: UI_CONFIG.HUD.PADDING,
    backgroundColor: COLORS.UI_BACKGROUND,
    borderRadius: 15,
    padding: 20,
    borderWidth: 1,
    borderColor: COLORS.DANGER,
  },

  defenseTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: COLORS.DANGER,
    textAlign: 'center',
    marginBottom: 10,
  },

  expectedActionText: {
    fontSize: 16,
    color: COLORS.WARNING,
    textAlign: 'center',
    marginBottom: 15,
    fontStyle: 'italic',
  },

  defenseButtonsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },

  defenseButton: {
    paddingVertical: 15,
    paddingHorizontal: 15,
    borderRadius: 10,
    alignItems: 'center',
    minWidth: 80,
    borderWidth: 2,
  },

  dodgeButton: {
    backgroundColor: COLORS.WARNING,
    borderColor: COLORS.WARNING,
  },

  parryButton: {
    backgroundColor: COLORS.SECONDARY,
    borderColor: COLORS.SECONDARY,
  },

  waitButton: {
    backgroundColor: COLORS.DANGER,
    borderColor: COLORS.DANGER,
  },

  expectedButton: {
    borderColor: COLORS.TEXT,
    borderWidth: 3,
  },

  defenseButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: COLORS.TEXT,
  },

  defenseButtonSubtext: {
    fontSize: 12,
    color: COLORS.TEXT_SECONDARY,
    marginTop: 2,
  },

  // Action sélectionnée
  selectedActionContainer: {
    position: 'absolute',
    top: 120,
    left: UI_CONFIG.HUD.PADDING,
    right: UI_CONFIG.HUD.PADDING,
    backgroundColor: COLORS.PRIMARY,
    borderRadius: 10,
    padding: 10,
    alignItems: 'center',
  },

  selectedActionText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: COLORS.TEXT,
  },

  selectedTargetText: {
    fontSize: 14,
    color: COLORS.TEXT_SECONDARY,
    marginTop: 2,
  },
});

export default TurnBasedUI;