import React from 'react';
import { StyleSheet, View } from 'react-native';
import GameScreen from '../src/components/GameScreen';

export default function Index() {
  return (
    <View style={styles.container}>
      <GameScreen />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1a1a1a',
  },
});