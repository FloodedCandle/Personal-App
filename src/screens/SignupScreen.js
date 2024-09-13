import React, { useState } from 'react';
import { View, TextInput, StyleSheet, TouchableOpacity, KeyboardAvoidingView, Platform, SafeAreaView } from 'react-native';
import CustomButton from '../components/CustomButton';
import CustomText from '../components/CustomText';
import { auth, db } from '../config/firebaseConfig';
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
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.content}
      >
        <View style={styles.formContainer}>
          <CustomText style={styles.title}>Create Account</CustomText>
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

          <CustomButton
            title="Sign Up"
            onPress={handleSignUp}
            buttonStyle={styles.signupButton}
            textStyle={styles.signupButtonText}
          />

          <TouchableOpacity onPress={() => navigation.navigate('Login')}>
            <CustomText style={styles.loginText}>
              Already have an account? Log in
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
    fontSize: 28,
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
  signupButtonText: {
    fontSize: 18,
    color: '#FFF',
    fontWeight: 'bold',
  },
  loginText: {
    color: '#3498DB',
    fontSize: 16,
    textAlign: 'center',
  },
});

export default SignupScreen;
