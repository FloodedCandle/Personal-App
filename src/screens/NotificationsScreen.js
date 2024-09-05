import React from 'react';
import { View, Text, Button, StyleSheet } from 'react-native';

const NotificationScreen = ({}) => {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Notifications Screen</Text>
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

export default NotificationScreen;