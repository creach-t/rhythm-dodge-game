import {StyleSheet} from 'react-native';
import {BUTTON_CONFIG} from '../../utils/Constants';

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

export default styles;
