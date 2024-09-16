import React from 'react';
import { View, Image, StyleSheet, SafeAreaView, Dimensions } from 'react-native';
import CustomButton from '../components/CustomButton';
import CustomText from '../components/CustomText';
import { LinearGradient } from 'expo-linear-gradient'; // Change this line

const { width, height } = Dimensions.get('window');
const logo = require('../assets/logo.png');

const GetStartedScreen = ({ navigation }) => {
  return (
    <LinearGradient
      colors={['#2C3E50', '#3498DB']}
      style={styles.backgroundGradient}
    >
      <SafeAreaView style={styles.container}>
        <View style={styles.content}>
          <View style={styles.logoContainer}>
            <Image source={logo} style={styles.logo} resizeMode="contain" />
          </View>
          <View style={styles.textContainer}>
            <CustomText style={styles.title}>BudgetWaves</CustomText>
            <CustomText style={styles.subtitle}>Start managing your finances today</CustomText>
          </View>
        </View>
        <View style={styles.buttonContainer}>
          <CustomButton
            title="Get Started"
            onPress={() => navigation.navigate('OfflineOption')}
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
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  backgroundGradient: {
    flex: 1,
  },
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  logoContainer: {
    width: width * 0.4,
    height: width * 0.4,
    backgroundColor: '#ECF0F1',
    borderRadius: width * 0.2,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 30,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 4.65,
    elevation: 8,
  },
  logo: {
    width: '80%',
    height: '80%',
  },
  textContainer: {
    alignItems: 'center',
  },
  title: {
    fontSize: 36,
    fontWeight: 'bold',
    color: '#ECF0F1',
    marginBottom: 10,
    textShadowColor: 'rgba(0, 0, 0, 0.75)',
    textShadowOffset: { width: -1, height: 1 },
    textShadowRadius: 10
  },
  subtitle: {
    fontSize: 18,
    color: '#ECF0F1',
    textAlign: 'center',
    marginBottom: 30,
    textShadowColor: 'rgba(0, 0, 0, 0.75)',
    textShadowOffset: { width: -1, height: 1 },
    textShadowRadius: 10
  },
  buttonContainer: {
    padding: 20,
  },
  button: {
    backgroundColor: '#2ECC71',
    marginBottom: 15,
    borderRadius: 25,
    paddingVertical: 15,
  },
  buttonText: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  secondaryButton: {
    backgroundColor: 'transparent',
    borderWidth: 2,
    borderColor: '#ECF0F1',
    borderRadius: 25,
    paddingVertical: 15,
  },
  secondaryButtonText: {
    fontSize: 16,
    color: '#ECF0F1',
  },
});

export default GetStartedScreen;
