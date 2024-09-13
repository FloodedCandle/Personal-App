import React, { useState } from 'react';
import { View, TextInput, Image, StyleSheet, TouchableOpacity, KeyboardAvoidingView, Platform, SafeAreaView } from 'react-native';
import CustomButton from '../components/CustomButton';
import CustomText from '../components/CustomText'; // Make sure CustomText is a Text component
import { auth } from '../config/firebaseConfig'; // Import your Firebase auth instance
import { signInWithEmailAndPassword } from 'firebase/auth';

const logo = require('../assets/logo.png');

const LoginScreen = ({ navigation }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleLogin = async () => {
    try {
      await signInWithEmailAndPassword(auth, email, password);
      console.log('User logged in successfully');
      navigation.replace('Home'); // Use replace instead of navigate
    } catch (error) {
      console.error('Error logging in:', error.message);
      // Handle error appropriately (e.g., show an alert to the user)
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.content}
      >
        <View style={styles.logoContainer}>
          <Image source={logo} style={styles.logo} resizeMode="contain" />
        </View>

        <View style={styles.formContainer}>
          <CustomText style={styles.title}>Welcome Back</CustomText>
          <TextInput
            style={styles.input}
            placeholder="Email"
            keyboardType="email-address"
            autoCapitalize="none"
            autoCorrect={false}
            value={email}
            onChangeText={setEmail}
          />

          <TextInput
            style={styles.input}
            placeholder="Password"
            secureTextEntry={true}
            autoCapitalize="none"
            autoCorrect={false}
            value={password}
            onChangeText={setPassword}
          />

          <CustomButton
            title="Login"
            onPress={handleLogin}
            buttonStyle={styles.button}
            textStyle={styles.buttonText}
          />

          <TouchableOpacity onPress={() => navigation.navigate('Signup')}>
            <CustomText style={styles.signUpText}>
              Don't have an account? Sign Up
            </CustomText>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
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
  },
  logoContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  formContainer: {
    flex: 2,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    paddingHorizontal: 30,
    paddingTop: 30,
    paddingBottom: 20,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: -3,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 5,
  },
  logo: {
    width: '40%',
    height: undefined,
    aspectRatio: 1,
    backgroundColor: '#2C3E50',
    borderRadius: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#2C3E50',
    marginBottom: 30,
  },
  input: {
    width: '100%',
    height: 50,
    borderColor: '#E0E0E0',
    borderWidth: 1,
    borderRadius: 8,
    paddingLeft: 15,
    marginBottom: 15,
    backgroundColor: '#F5F5F5',
    fontSize: 16,
  },
  button: {
    backgroundColor: '#2ECC71',
    width: '100%',
    paddingVertical: 15,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 20,
    marginBottom: 20,
  },
  buttonText: {
    fontSize: 18,
    color: '#FFF',
    fontWeight: 'bold',
  },
  signUpText: {
    color: '#3498DB',
    fontSize: 16,
  },
});

export default LoginScreen;
