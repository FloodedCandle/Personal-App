import React from 'react';
import { View, TextInput, Image, StyleSheet, Dimensions, TouchableOpacity } from 'react-native';
import CustomButton from '../components/CustomButton';
import CustomText from '../components/CustomText'; // Make sure CustomText is a Text component

const logo = require('../assets/logo.png');

const LoginScreen = ({ navigation }) => {
  return (
    <View style={styles.container}>
      {/* Logo */}
      <Image source={logo} style={styles.logo} resizeMode="contain" />

      {/* Separator */}
      <View style={styles.separator} />

      {/* Email Input */}
      <TextInput
        style={styles.input}
        placeholder="Email"
        keyboardType="email-address"
        autoCapitalize="none"
        autoCorrect={false}
      />

      {/* Password Input */}
      <TextInput
        style={styles.input}
        placeholder="Password"
        secureTextEntry={true}
        autoCapitalize="none"
        autoCorrect={false}
      />

      {/* Forgot Password and Signup Text on the same line */}
      <View style={styles.textRow}>
        <TouchableOpacity>
          <CustomText style={styles.text}>Forgot Password?</CustomText>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => navigation.navigate('Signup')}>
          <CustomText style={[styles.text, styles.signUpText]}>
            Don't have an account?
          </CustomText>
        </TouchableOpacity>
      </View>

      {/* Login Button */}
      <CustomButton
        title="Login"
        onPress={() => {
          // Handle login logic here
        }}
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
    width: width * 0.6,
    height: undefined,
    aspectRatio: 1,
    marginBottom: 20,
    backgroundColor: '#2C3E50',
    borderRadius: 12,
  },
  separator: {
    width: '90%',
    borderBottomWidth: 1,
    borderBottomColor: '#2C3E50',
    marginVertical: 20,
  },
  input: {
    width: '90%',
    height: 50,
    borderColor: '#2C3E50',
    borderWidth: 1,
    borderRadius: 8,
    paddingLeft: 10,
    marginBottom: 15,
    backgroundColor: '#FFF',
  },
  textRow: {
    width: '90%',
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  text: {
    color: '#3498DB',
    fontSize: 14,
  },
  signUpText: {
    marginLeft: 10, // Optional space between the two texts
  },
  button: {
    backgroundColor: '#2ECC71',
    width: '90%',
    paddingVertical: 15,
    borderRadius: 8,
    alignItems: 'center',
  },
  buttonText: {
    fontSize: 16,
    color: '#FFF',
  },
});

export default LoginScreen;
