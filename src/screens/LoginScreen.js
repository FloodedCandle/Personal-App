import React, { useState } from 'react';
import { View, TextInput, Image, StyleSheet, Dimensions, TouchableOpacity, Alert } from 'react-native';
import CustomButton from '../components/CustomButton';
import CustomText from '../components/CustomText'; // Make sure CustomText is a Text component
import { auth } from '../config/firebaseConfig'; // Import your Firebase auth instance
import { signInWithEmailAndPassword } from 'firebase/auth';

const logo = require('../assets/logo.png');

const LoginScreen = ({ navigation }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleLogin = () => {
    signInWithEmailAndPassword(auth, email, password)
      .then((userCredential) => {
        // Signed in successfully
        const user = userCredential.user;
        console.log('User logged in:', user);
        // Navigate to Home screen
        navigation.navigate('Drawer');
      })
      .catch((error) => {
        console.error('Error logging in:', error.message);
        if (error.code === 'auth/user-not-found') {
          Alert.alert(
            'Account Not Found',
            'This email is not registered. Would you like to create a new account?',
            [
              {
                text: 'Cancel',
                style: 'cancel',
              },
              {
                text: 'Sign Up',
                onPress: () => navigation.navigate('Signup'),
              },
            ]
          );
        } else if (error.code === 'auth/wrong-password') {
          Alert.alert(
            'Incorrect Password',
            'The password you entered is incorrect. Please try again.',
            [{ text: 'OK' }]
          );
        } else if (error.code === 'auth/invalid-email') {
          Alert.alert(
            'Invalid Email',
            'Please enter a valid email address.',
            [{ text: 'OK' }]
          );
        } else {
          Alert.alert(
            'Login Error',
            'An unexpected error occurred. Please try again later.',
            [{ text: 'OK' }]
          );
        }
      });
  };

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
        value={email}
        onChangeText={setEmail}
      />

      {/* Password Input */}
      <TextInput
        style={styles.input}
        placeholder="Password"
        secureTextEntry={true}
        autoCapitalize="none"
        autoCorrect={false}
        value={password}
        onChangeText={setPassword}
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
        onPress={handleLogin}
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
