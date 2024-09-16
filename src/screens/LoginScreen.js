import React, { useState, useEffect } from 'react';
import { View, TextInput, Image, StyleSheet, TouchableOpacity, KeyboardAvoidingView, Platform, SafeAreaView, Alert, Modal, FlatList, Dimensions } from 'react-native';
import CustomButton from '../components/CustomButton';
import CustomText from '../components/CustomText';
import { auth } from '../config/firebaseConfig';
import { signInWithEmailAndPassword } from 'firebase/auth';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { CheckBox } from 'react-native-elements';
import { MaterialIcons } from '@expo/vector-icons';

const { width, height } = Dimensions.get('window');
const logo = require('../assets/logo.png');

const LoginScreen = ({ navigation }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [savedAccounts, setSavedAccounts] = useState([]);
  const [showDropdown, setShowDropdown] = useState(false);

  useEffect(() => {
    const getStoredAccounts = async () => {
      try {
        const accounts = await AsyncStorage.getItem('savedAccounts');
        if (accounts) {
          setSavedAccounts(JSON.parse(accounts));
        }
      } catch (error) {
        console.error('Error retrieving stored accounts:', error);
      }
    };

    getStoredAccounts();
  }, []);

  const handleLogin = async () => {
    try {
      await signInWithEmailAndPassword(auth, email, password);
      console.log('User logged in successfully');

      if (rememberMe) {
        const updatedAccounts = [...savedAccounts.filter(acc => acc.email !== email), { email, password }];
        await AsyncStorage.setItem('savedAccounts', JSON.stringify(updatedAccounts));
      }

      navigation.replace('MainApp');
    } catch (error) {
      console.error('Error logging in:', error.message);
      Alert.alert('Login Error', error.message);
    }
  };

  const selectAccount = (account) => {
    setEmail(account.email);
    setPassword(account.password);
    setShowDropdown(false);
  };

  const renderAccountItem = ({ item }) => (
    <TouchableOpacity style={styles.accountItem} onPress={() => selectAccount(item)}>
      <CustomText>{item.email}</CustomText>
    </TouchableOpacity>
  );

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
          <View style={styles.inputContainer}>
            <MaterialIcons name="email" size={24} color="#7F8C8D" style={styles.inputIcon} />
            <TextInput
              style={styles.input}
              placeholder="Email"
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
              value={email}
              onChangeText={setEmail}
            />
            {savedAccounts.length > 0 && (
              <TouchableOpacity style={styles.dropdownButton} onPress={() => setShowDropdown(!showDropdown)}>
                <MaterialIcons name="arrow-drop-down" size={24} color="#2C3E50" />
              </TouchableOpacity>
            )}
          </View>

          <View style={styles.inputContainer}>
            <MaterialIcons name="lock" size={24} color="#7F8C8D" style={styles.inputIcon} />
            <TextInput
              style={styles.input}
              placeholder="Password"
              secureTextEntry={true}
              autoCapitalize="none"
              autoCorrect={false}
              value={password}
              onChangeText={setPassword}
            />
          </View>

          <View style={styles.rememberMeContainer}>
            <CheckBox
              title="Remember Me"
              checked={rememberMe}
              onPress={() => setRememberMe(!rememberMe)}
              containerStyle={styles.checkboxContainer}
              textStyle={styles.checkboxText}
            />
          </View>

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

      <Modal
        visible={showDropdown}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowDropdown(false)}
      >
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setShowDropdown(false)}
        >
          <View style={styles.dropdownList}>
            <FlatList
              data={savedAccounts}
              renderItem={renderAccountItem}
              keyExtractor={(item) => item.email}
            />
          </View>
        </TouchableOpacity>
      </Modal>
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
  logoContainer: {
    alignItems: 'center',
    marginBottom: height * 0.05,
  },
  logo: {
    width: width * 0.4,
    height: width * 0.4,
    backgroundColor: '#2C3E50',
    borderRadius: 20,
  },
  formContainer: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    paddingHorizontal: width * 0.08,
    paddingTop: height * 0.05,
    paddingBottom: height * 0.03,
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
    fontSize: width * 0.08,
    fontWeight: 'bold',
    color: '#2C3E50',
    marginBottom: height * 0.03,
    textAlign: 'center',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: height * 0.02,
    borderColor: '#E0E0E0',
    borderWidth: 1,
    borderRadius: 8,
    backgroundColor: '#F5F5F5',
  },
  inputIcon: {
    padding: 10,
  },
  input: {
    flex: 1,
    height: height * 0.06,
    fontSize: width * 0.04,
  },
  dropdownButton: {
    padding: 10,
  },
  rememberMeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: height * 0.02,
  },
  checkboxContainer: {
    backgroundColor: 'transparent',
    borderWidth: 0,
    padding: 0,
    margin: 0,
  },
  checkboxText: {
    fontWeight: 'normal',
    fontSize: width * 0.035,
    color: '#2C3E50',
  },
  button: {
    backgroundColor: '#2ECC71',
    paddingVertical: height * 0.02,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: height * 0.02,
  },
  buttonText: {
    fontSize: width * 0.045,
    color: '#FFF',
    fontWeight: 'bold',
  },
  signUpText: {
    color: '#3498DB',
    fontSize: width * 0.04,
    textAlign: 'center',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  dropdownList: {
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    padding: 10,
    width: width * 0.8,
    maxHeight: height * 0.4,
  },
  accountItem: {
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
});

export default LoginScreen;
