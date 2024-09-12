import React, { useState } from 'react';
import { View, TextInput, TouchableOpacity, StyleSheet, Dimensions } from 'react-native';
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
    <View style={styles.container}>
      {/* Google and Facebook Sign-In Buttons */}
      <CustomButton
        title="Sign in with Google"
        onPress={() => {
          // Handle Google sign-in logic here
        }}
        buttonStyle={styles.socialButton}
        textStyle={styles.socialButtonText}
      />
      <CustomButton
        title="Sign in with Facebook"
        onPress={() => {
          // Handle Facebook sign-in logic here
        }}
        buttonStyle={[styles.socialButton, styles.facebookButton]}
        textStyle={styles.socialButtonText}
      />

      {/* Separator */}
      <View style={styles.separatorContainer}>
        <View style={styles.separator} />
        <CustomText style={styles.separatorText}>OR</CustomText>
        <View style={styles.separator} />
      </View>

      {/* Username, Email, and Password Input */}
      <TextInput
        style={styles.input}
        placeholder="Username"
        value={username}
        onChangeText={(text) => setUsername(text)}
        autoCapitalize="none"
        autoCorrect={false}
      />
      <TextInput
        style={styles.input}
        placeholder="Email"
        value={email}
        onChangeText={(text) => setEmail(text)}
        keyboardType="email-address"
        autoCapitalize="none"
        autoCorrect={false}
      />
      <TextInput
        style={styles.input}
        placeholder="Password"
        value={password}
        onChangeText={(text) => setPassword(text)}
        secureTextEntry={true}
        autoCapitalize="none"
        autoCorrect={false}
      />

      {/* Already have an account? */}
      <View style={styles.textContainer}>
        <TouchableOpacity onPress={() => navigation.navigate('Login')}>
          <CustomText style={styles.text}>Already have an account? Log in</CustomText>
        </TouchableOpacity>
      </View>

      {/* Signup Button */}
      <CustomButton
        title="Sign Up"
        onPress={handleSignUp}
        buttonStyle={styles.signupButton}
        textStyle={styles.signupButtonText}
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
  socialButton: {
    backgroundColor: '#3498DB',
    width: '90%',
    paddingVertical: 15,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 10,
  },
  facebookButton: {
    backgroundColor: '#3B5998',
  },
  socialButtonText: {
    fontSize: 16,
    color: '#FFF',
  },
  separatorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '90%',
    marginVertical: 20,
  },
  separator: {
    flex: 1,
    height: 1,
    backgroundColor: '#2C3E50',
  },
  separatorText: {
    marginHorizontal: 10,
    fontSize: 14,
    color: '#2C3E50',
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
  textContainer: {
    width: '90%',
    alignItems: 'center',
    marginBottom: 20,
  },
  text: {
    color: '#3498DB',
    fontSize: 14,
  },
  signupButton: {
    backgroundColor: '#2ECC71',
    width: '90%',
    paddingVertical: 15,
    borderRadius: 8,
    alignItems: 'center',
  },
  signupButtonText: {
    fontSize: 16,
    color: '#FFF',
  },
});

export default SignupScreen;
