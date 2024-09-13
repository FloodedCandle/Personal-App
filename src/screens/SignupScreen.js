import React, { useState } from 'react';
import { View, TextInput, TouchableOpacity, StyleSheet, Dimensions, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import CustomButton from '../components/CustomButton';
import CustomText from '../components/CustomText';
import { auth, db } from '../config/firebaseConfig'; // Import your Firebase auth and Firestore instances
import { createUserWithEmailAndPassword, updateProfile } from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';

const SignupScreen = ({ navigation }) => {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleSignUp = async () => {
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      // Update the user's profile with the username
      await updateProfile(user, { displayName: username });

      // Store additional user info in Firestore
      await setDoc(doc(db, 'users', user.uid), {
        username: username,
        email: email,
        createdAt: new Date()
      });

      console.log('User signed up:', user);
      navigation.navigate('Login');
    } catch (error) {
      console.error('Error signing up:', error.message);
      // Handle error appropriately
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={styles.container}
    >
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <View style={styles.formContainer}>
          <CustomText style={styles.title}>Create Account</CustomText>

          <TextInput
            style={styles.input}
            placeholder="Username"
            value={username}
            onChangeText={setUsername}
            autoCapitalize="none"
            autoCorrect={false}
          />
          <TextInput
            style={styles.input}
            placeholder="Email"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
            autoCorrect={false}
          />
          <TextInput
            style={styles.input}
            placeholder="Password"
            value={password}
            onChangeText={setPassword}
            secureTextEntry={true}
            autoCapitalize="none"
            autoCorrect={false}
          />

          <CustomButton
            title="Sign Up"
            onPress={handleSignUp}
            buttonStyle={styles.signupButton}
            textStyle={styles.buttonText}
          />

          <TouchableOpacity onPress={() => navigation.navigate('Login')}>
            <CustomText style={styles.loginText}>
              Already have an account? Log in
            </CustomText>
          </TouchableOpacity>

          <View style={styles.separatorContainer}>
            <View style={styles.separator} />
            <CustomText style={styles.separatorText}>OR</CustomText>
            <View style={styles.separator} />
          </View>

          <CustomButton
            title="Sign up with Google"
            onPress={() => {
              // Handle Google sign-up logic here
            }}
            buttonStyle={styles.socialButton}
            textStyle={styles.socialButtonText}
          />
          <CustomButton
            title="Sign up with Facebook"
            onPress={() => {
              // Handle Facebook sign-up logic here
            }}
            buttonStyle={[styles.socialButton, styles.facebookButton]}
            textStyle={styles.socialButtonText}
          />
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const { width } = Dimensions.get('window');

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ECF0F1',
  },
  scrollContainer: {
    flexGrow: 1,
    justifyContent: 'center',
  },
  formContainer: {
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
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#2C3E50',
    marginBottom: 30,
    textAlign: 'center',
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
  signupButton: {
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
  loginText: {
    color: '#3498DB',
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 20,
  },
  separatorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 20,
  },
  separator: {
    flex: 1,
    height: 1,
    backgroundColor: '#E0E0E0',
  },
  separatorText: {
    marginHorizontal: 10,
    fontSize: 14,
    color: '#2C3E50',
  },
  socialButton: {
    backgroundColor: '#DB4437',
    width: '100%',
    paddingVertical: 15,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 10,
  },
  facebookButton: {
    backgroundColor: '#4267B2',
  },
  socialButtonText: {
    fontSize: 16,
    color: '#FFF',
  },
});

export default SignupScreen;
