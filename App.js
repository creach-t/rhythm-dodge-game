import React from 'react';
import { StyleSheet, View } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import GameScreen from './src/components/GameScreen';

export default function App() {
  return (
    <View style={styles.container}>
      <StatusBar style="light" hidden={true} />
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