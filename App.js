import React from 'react';
import { Text, View, Button } from 'react-native';

export default function App() {
  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
      <Text>Welcome to My App!</Text>
      <Button title="Get Started" onPress={() => alert('Starting!')} />
    </View>
  );
}
