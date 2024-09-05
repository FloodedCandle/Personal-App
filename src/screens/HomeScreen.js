import React from 'react';
import { View, Text, Button, StyleSheet } from 'react-native';

const HomeScreen = ({ navigation }) => {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Home Screen</Text>
      <Button
        style={styles.button}
        title="Go to Notifications"
        onPress={() => navigation.navigate('Notification')}
      />
      <Button 
        style={styles.button}
        title="Go to Budget"
        onPress={() => navigation.navigate('Budget')}
      />
      <Button 
        style={styles.button}
        title="Go to Profile"
        onPress={() => navigation.navigate('Profile')}
      />
      <Button 
        style={styles.button}
        title="Go to Transaction"
        onPress={() => navigation.navigate('Transaction')}
      />
      <Button 
        style={styles.button}
        title="Go to Statistic"
        onPress={() => navigation.navigate('Statistic')}
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
  button: {
    paddingTop:20,
    margin: 10,
  },
});

export default HomeScreen;