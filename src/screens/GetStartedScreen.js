import React from 'react';
import { View, Image, StyleSheet, SafeAreaView } from 'react-native';
import CustomButton from '../components/CustomButton';
import CustomText from '../components/CustomText';

const logo = require('../assets/logo.png');

const GetStartedScreen = ({ navigation }) => {
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <Image source={logo} style={styles.logo} resizeMode="contain" />
        <CustomText style={styles.title}>BudgetWaves</CustomText>
        <CustomText style={styles.subtitle}>Start managing your finances today</CustomText>
      </View>
      <View style={styles.buttonContainer}>
        <CustomButton
          title="Get Started"
          onPress={() => navigation.navigate('Signup')}
          buttonStyle={styles.button}
          textStyle={styles.buttonText}
        />
        <CustomButton
          title="I already have an account"
          onPress={() => navigation.navigate('Login')}
          buttonStyle={styles.secondaryButton}
          textStyle={styles.secondaryButtonText}
        />
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ECF0F1',
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  logo: {
    width: '80%',
    height: undefined,
    aspectRatio: 1,
    marginBottom: 20,
    backgroundColor: '#2C3E50',
    borderRadius: 20,
  },
  title: {
    fontSize: 36,
    fontWeight: 'bold',
    color: '#2C3E50',
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 18,
    color: '#34495E',
    textAlign: 'center',
    marginBottom: 30,
  },
  buttonContainer: {
    padding: 20,
  },
  button: {
    backgroundColor: '#2ECC71',
    marginBottom: 15,
  },
  buttonText: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  secondaryButton: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: '#2C3E50',
  },
  secondaryButtonText: {
    fontSize: 16,
    color: '#2C3E50',
  },
});

export default GetStartedScreen;
