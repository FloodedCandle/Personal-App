import React, { useState, useEffect } from 'react';
import { View, TextInput, Image, StyleSheet, TouchableOpacity, KeyboardAvoidingView, Platform, SafeAreaView, Alert, FlatList, Dimensions } from 'react-native';
import { useDispatch } from 'react-redux';
import { setUser } from '../redux/userSlice';
import CustomButton from '../components/CustomButton';
import CustomText from '../components/CustomText';
import { auth } from '../config/firebaseConfig';
import { signInWithEmailAndPassword, fetchSignInMethodsForEmail } from 'firebase/auth';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { MaterialIcons } from '@expo/vector-icons';
import { clearUserData, loadUserData } from '../utils/userDataUtils';

const { width, height } = Dimensions.get('window');
const logo = require('../assets/logo.png');

const LoginScreen = ({ navigation, route }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [savedAccounts, setSavedAccounts] = useState([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const [isSwitch, setIsSwitch] = useState(false);
  const dispatch = useDispatch();

  useEffect(() => {
    setIsSwitch(route.params?.isSwitch || false);
    getStoredAccounts();
  }, [route.params]);

  const getStoredAccounts = async () => {
    try {
      const accounts = await AsyncStorage.getItem('savedAccounts');
      console.log('Retrieved accounts:', accounts);
      if (accounts) {
        const parsedAccounts = JSON.parse(accounts);
        setSavedAccounts(parsedAccounts);
      }
    } catch (error) {
      console.error('Error retrieving stored accounts:', error);
    }
  };

  const handleLogin = async () => {
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      await AsyncStorage.multiRemove(['budgets', 'transactions', 'notifications']);

      dispatch(setUser({
        uid: user.uid,
        email: user.email,
        displayName: user.displayName,
        photoURL: user.photoURL,
        emailVerified: user.emailVerified,
      }));

      if (rememberMe) {
        const updatedAccounts = [...savedAccounts.filter(acc => acc.email !== email), { email, password }];
        await AsyncStorage.setItem('savedAccounts', JSON.stringify(updatedAccounts));
        console.log('Saved accounts:', updatedAccounts);
      }

      await AsyncStorage.setItem('offlineMode', 'false');

      await loadUserData(user.uid);

      if (isSwitch) {
        navigation.reset({
          index: 0,
          routes: [{ name: 'MainApp' }],
        });
      } else {
        navigation.replace('MainApp');
      }
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
            <MaterialIcons name="email" size={24} color="#3498DB" style={styles.inputIcon} />
            <TextInput
              style={styles.input}
              placeholder="Email"
              placeholderTextColor="#95A5A6"
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
              value={email}
              onChangeText={setEmail}
            />
            {savedAccounts.length > 0 && (
              <TouchableOpacity style={styles.dropdownButton} onPress={() => setShowDropdown(!showDropdown)}>
                <MaterialIcons name="arrow-drop-down" size={24} color="#3498DB" />
              </TouchableOpacity>
            )}
          </View>

          {showDropdown && savedAccounts.length > 0 && (
            <View style={styles.dropdownContainer}>
              <FlatList
                data={savedAccounts}
                renderItem={renderAccountItem}
                keyExtractor={(item) => item.email}
                style={styles.dropdownList}
              />
            </View>
          )}

          <View style={styles.inputContainer}>
            <MaterialIcons name="lock" size={24} color="#3498DB" style={styles.inputIcon} />
            <TextInput
              style={styles.input}
              placeholder="Password"
              placeholderTextColor="#95A5A6"
              secureTextEntry={true}
              autoCapitalize="none"
              autoCorrect={false}
              value={password}
              onChangeText={setPassword}
            />
          </View>

          <TouchableOpacity style={styles.checkboxContainer} onPress={() => setRememberMe(!rememberMe)}>
            <View style={[styles.checkbox, rememberMe && styles.checkboxChecked]}>
              {rememberMe && <MaterialIcons name="check" size={18} color="#FFFFFF" />}
            </View>
            <CustomText style={styles.checkboxLabel}>Remember Me</CustomText>
          </TouchableOpacity>

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
    justifyContent: 'center',
    padding: 20,
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
    borderRadius: 15,
    padding: 20,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 5,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#2C3E50',
    marginBottom: 20,
    textAlign: 'center',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
    borderColor: '#3498DB',
    borderWidth: 1,
    borderRadius: 8,
    backgroundColor: '#FFFFFF',
  },
  inputIcon: {
    padding: 10,
  },
  input: {
    flex: 1,
    height: 50,
    fontSize: 16,
    color: '#2C3E50',
  },
  dropdownButton: {
    padding: 10,
  },
  checkboxContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
  },
  checkbox: {
    width: 24,
    height: 24,
    borderWidth: 2,
    borderColor: '#3498DB',
    borderRadius: 4,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
  },
  checkboxChecked: {
    backgroundColor: '#3498DB',
  },
  checkboxLabel: {
    fontSize: 16,
    color: '#2C3E50',
  },
  button: {
    backgroundColor: '#2ECC71',
    paddingVertical: 15,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 15,
  },
  buttonText: {
    fontSize: 18,
    color: '#FFFFFF',
    fontWeight: 'bold',
  },
  signUpText: {
    color: '#3498DB',
    fontSize: 16,
    textAlign: 'center',
  },
  dropdownContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    marginTop: 5,
    marginBottom: 15,
    maxHeight: 150,
    borderWidth: 1,
    borderColor: '#3498DB',
  },
  dropdownList: {
    width: '100%',
  },
  accountItem: {
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
});

export default LoginScreen;
