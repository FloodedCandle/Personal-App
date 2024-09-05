import React from 'react';
import { View, Image, Dimensions, StyleSheet } from 'react-native';
import CustomButton from '../components/CustomButton';
import CustomText from '../components/CustomText';

const logo = require('../assets/logo.png');

const GetStartedScreen = ({ navigation }) => {
  return (
    <View style={styles.container}>
      <Image source={logo} style={styles.logo} resizeMode="contain" />
      <CustomText style={styles.title}>Get Started</CustomText>
      <CustomButton
        title="Go to Dashboard"
        onPress={() => navigation.navigate('Drawer')}
        buttonStyle={styles.button}
        textStyle={styles.buttonText}
      />
    </View>
  );
};

const { width } = Dimensions.get('window');

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#ECF0F1',
    padding: 20, 
  },
  logo: {
    width: width * 0.8, 
    height: undefined, 
    aspectRatio: 1,
    marginBottom: 10, 
    backgroundColor: '#2C3E50',
    borderRadius: 12,
  },
  title: {
    fontSize: 48,
    fontWeight: 'bold',
    color: '#2C3E50', 
    marginBottom: 20, 
  },
  button: {
    backgroundColor: '#2ECC71',
  },
  buttonText: {
    fontSize: 16,
  },
});

export default GetStartedScreen;
