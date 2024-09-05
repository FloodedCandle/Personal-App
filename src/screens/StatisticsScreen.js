import React from 'react';
import { View, StyleSheet } from 'react-native';
import CustomText from '../components/CustomText';

const StatisticsScreen = ({}) => {
  return (
    <View style={styles.container}>
      <CustomText style={styles.title}>Statistics Screen</CustomText>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#ECF0F1',
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#2C3E50',
    marginBottom: 20,
  },
});

export default StatisticsScreen;
