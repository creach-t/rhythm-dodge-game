import React, { useState } from 'react';
import { View, TouchableOpacity, Text, StyleSheet, Animated } from 'react-native';
import { COLORS, BUTTON_CONFIG } from '../utils/Constants';

const GameButton = ({ 
  onPress, 
  title, 
  type = 'primary', 
  disabled = false,
  style = {},
  testID,
  color = null,
  highlighted = false
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
      friction: 8
    }).start();
  };

  const handlePressOut = () => {
    if (disabled) return;
    
    setIsPressed(false);
    Animated.spring(scaleAnim, {
      toValue: 1,
      useNativeDriver: true,
      tension: 300,
      friction: 8
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
      borderWidth = 5;
    }

    return {
      backgroundColor,
      borderColor,
      opacity: disabled ? 0.5 : 1,
      borderWidth: highlighted ? 5 : 3
    };
  };

  const getTextStyle = () => {
    return {
      color: disabled ? COLORS.TEXT_SECONDARY : COLORS.TEXT,
      fontWeight: isPressed ? 'bold' : '600',
      fontSize: highlighted ? 24 : 20
    };
  };

  return (
    <Animated.View
      style={[
        styles.container,
        { transform: [{ scale: scaleAnim }] },
        highlighted && styles.highlightedContainer,
        style
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
        <Text style={[styles.buttonText, getTextStyle()]}>
          {title}
        </Text>
      </TouchableOpacity>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 4.65,
    elevation: 8,
  },
  highlightedContainer: {
    shadowColor: '#fff',
    shadowOpacity: 0.5,
    shadowRadius: 8,
    elevation: 12,
  },
  button: {
    width: BUTTON_CONFIG.SIZE,
    height: BUTTON_CONFIG.SIZE,
    borderRadius: BUTTON_CONFIG.BORDER_RADIUS,
    justifyContent: 'center',
    alignItems: 'center',
  },
  buttonText: {
    textAlign: 'center',
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
});

export default GameButton;