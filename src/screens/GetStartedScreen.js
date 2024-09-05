import React from 'react';
import { View, Text, Button, StyleSheet } from 'react-native';

const GetStartedScreen = ({ navigation }) => {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Get Started</Text>
      <Button
        title="Go to Dashboard"
        onPress={() => navigation.navigate('Drawer')}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
  },
});

export default GetStartedScreen;
