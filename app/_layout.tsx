import { Stack } from 'expo-router';
import React from 'react';
import { StatusBar } from 'expo-status-bar';

export default function RootLayout() {
  return (
    <>
      <StatusBar style="light" hidden={true} />
      <Stack>
        <Stack.Screen 
          name="index" 
          options={{ 
            headerShown: false,
            orientation: 'landscape'
          }} 
        />
      </Stack>
    </>
  );
}