import React from 'react';
import { View, TextInput, TouchableOpacity, StyleSheet, Dimensions } from 'react-native';
import CustomButton from '../components/CustomButton';
import CustomText from '../components/CustomText'; // Assuming this is your text component

const SignupScreen = ({ navigation }) => {
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
        autoCapitalize="none"
        autoCorrect={false}
      />
      <TextInput
        style={styles.input}
        placeholder="Email"
        keyboardType="email-address"
        autoCapitalize="none"
        autoCorrect={false}
      />
      <TextInput
        style={styles.input}
        placeholder="Password"
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
        onPress={() => {
          // Handle sign up logic here
        }}
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
