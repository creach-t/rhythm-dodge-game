import PropTypes from 'prop-types';
import React, {useState} from 'react';
import {Animated, Text, TouchableOpacity} from 'react-native';
import {BUTTON_CONFIG, COLORS} from '../../utils/Constants';
import styles from './GameButton.styles';

const GameButton = ({
  onPress,
  title,
  type = 'primary',
  disabled = false,
  style = {},
  testID,
  color = null,
  highlighted = false,
}) => {
  const [scaleAnim] = useState(new Animated.Value(1));
  const [isPressed, setIsPressed] = useState(false);

  const handlePressIn = () => {
    if (disabled) return;

    setIsPressed(true);
    Animated.spring(scaleAnim, {
      toValue: BUTTON_CONFIG.ACTIVE_SCALE,
      useNativeDriver: true,
      tension: 300,
      friction: 8,
    }).start();
  };

  const handlePressOut = () => {
    if (disabled) return;

    setIsPressed(false);
    Animated.spring(scaleAnim, {
      toValue: 1,
      useNativeDriver: true,
      tension: 300,
      friction: 8,
    }).start();

    if (onPress) {
      onPress();
    }
  };

  const getButtonStyle = () => {
    let backgroundColor = COLORS.PRIMARY;
    let borderColor = COLORS.PRIMARY;

    // Si une couleur spécifique est fournie, l'utiliser
    if (color) {
      backgroundColor = color;
      borderColor = color;
    } else {
      // Sinon, utiliser les couleurs par défaut selon le type
      switch (type) {
        case 'dodge':
          backgroundColor = COLORS.WARNING;
          borderColor = COLORS.WARNING;
          break;
        case 'parry':
          backgroundColor = COLORS.SECONDARY;
          borderColor = COLORS.SECONDARY;
          break;
        case 'danger':
          backgroundColor = COLORS.DANGER;
          borderColor = COLORS.DANGER;
          break;
        case 'success':
          backgroundColor = COLORS.SUCCESS;
          borderColor = COLORS.SUCCESS;
          break;
        default:
          break;
      }
    }

    if (disabled) {
      backgroundColor = COLORS.UI_BACKGROUND;
      borderColor = COLORS.UI_BORDER;
    }

    // Si le bouton est mis en évidence, augmenter la luminosité
    if (highlighted && !disabled) {
      borderColor = backgroundColor;
    }

    return {
      backgroundColor,
      borderColor,
      opacity: disabled ? 0.5 : 1,
      borderWidth: highlighted ? 5 : 3,
    };
  };

  const getTextStyle = () => {
    return {
      color: disabled ? COLORS.TEXT_SECONDARY : COLORS.TEXT,
      fontWeight: isPressed ? 'bold' as const : '600' as const,
      fontSize: highlighted ? 24 : 20,
    };
  };

  return (
    <Animated.View
      style={[
        styles.container,
        {transform: [{scale: scaleAnim}]},
        highlighted && styles.highlightedContainer,
        style,
      ]}
    >
      <TouchableOpacity
        style={[styles.button, getButtonStyle()]}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        disabled={disabled}
        activeOpacity={1}
        testID={testID}
      >
        <Text style={[styles.buttonText, getTextStyle()]}>{title}</Text>
      </TouchableOpacity>
    </Animated.View>
  );
};

GameButton.propTypes = {
  onPress: PropTypes.func,
  title: PropTypes.string.isRequired,
  type: PropTypes.oneOf(['primary', 'dodge', 'parry', 'danger', 'success']),
  disabled: PropTypes.bool,
  style: PropTypes.object,
  testID: PropTypes.string,
  color: PropTypes.string,
  highlighted: PropTypes.bool,
};

export default GameButton;
