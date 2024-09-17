import React, { useState, useEffect } from 'react';
import { View, StyleSheet, TouchableOpacity, TextInput, Alert, ScrollView, SafeAreaView } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import CustomText from '../components/CustomText';
import CustomButton from '../components/CustomButton';
import { auth, db, logout, deleteAccount } from '../config/firebaseConfig';
import { doc, getDoc, updateDoc, deleteDoc } from 'firebase/firestore';
import { updateProfile } from 'firebase/auth';
import { LinearGradient } from 'expo-linear-gradient';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useDispatch } from 'react-redux';
import { clearUser } from '../redux/userSlice';
import { useFocusEffect } from '@react-navigation/native';

const ProfileScreen = ({ navigation }) => {
  const [user, setUser] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editedUsername, setEditedUsername] = useState('');
  const [isOfflineMode, setIsOfflineMode] = useState(false);

  const dispatch = useDispatch();

  useEffect(() => {
    checkOfflineMode();
    fetchUserData();
  }, []);

  useFocusEffect(
    React.useCallback(() => {
      checkOfflineMode();
      fetchUserData();
    }, [])
  );

  const checkOfflineMode = async () => {
    const offlineMode = await AsyncStorage.getItem('offlineMode');
    setIsOfflineMode(offlineMode === 'true');
  };

  const fetchUserData = async () => {
    if (isOfflineMode) {
      const offlineUser = await AsyncStorage.getItem('offlineUser');
      if (offlineUser) {
        setUser(JSON.parse(offlineUser));
        setEditedUsername(JSON.parse(offlineUser).username);
      } else {
        // If no offline user exists, create a default one
        const defaultUser = { username: 'Offline User', createdAt: new Date().toISOString() };
        await AsyncStorage.setItem('offlineUser', JSON.stringify(defaultUser));
        setUser(defaultUser);
        setEditedUsername(defaultUser.username);
      }
    } else {
      const currentUser = auth.currentUser;
      if (currentUser) {
        const userDoc = await getDoc(doc(db, 'users', currentUser.uid));
        if (userDoc.exists()) {
          setUser({ ...currentUser, ...userDoc.data() });
          setEditedUsername(userDoc.data().username || currentUser.displayName);
        } else {
          setUser(currentUser);
          setEditedUsername(currentUser.displayName);
        }
      }
    }
  };

  const handleEdit = () => {
    setIsEditing(true);
  };

  const handleSave = async () => {
    try {
      if (isOfflineMode) {
        const updatedUser = { ...user, username: editedUsername };
        await AsyncStorage.setItem('offlineUser', JSON.stringify(updatedUser));
        setUser(updatedUser);
      } else {
        const currentUser = auth.currentUser;
        await updateProfile(currentUser, { displayName: editedUsername });
        await updateDoc(doc(db, 'users', currentUser.uid), { username: editedUsername });
      }
      setIsEditing(false);
      fetchUserData();
      Alert.alert('Success', 'Profile updated successfully');
    } catch (error) {
      console.error('Error updating profile:', error);
      Alert.alert('Error', 'Failed to update profile');
    }
  };

  const handleLogout = () => {
    Alert.alert(
      "Confirm Logout",
      "Are you sure you want to log out?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Logout",
          onPress: async () => {
            try {
              await logout();
              dispatch(clearUser());
              await AsyncStorage.multiRemove(['budgets', 'transactions', 'notifications']);
              navigation.reset({
                index: 0,
                routes: [{ name: 'GetStarted' }],
              });
            } catch (error) {
              console.error('Error logging out:', error);
              Alert.alert('Error', 'Failed to log out');
            }
          }
        }
      ]
    );
  };

  const handleDeleteAccount = () => {
    Alert.alert(
      "Delete Account",
      "Are you sure you want to delete your account? This action cannot be undone.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            try {
              const uid = await deleteAccount();
              if (uid) {
                await deleteDoc(doc(db, 'users', uid));
              }
              navigation.reset({
                index: 0,
                routes: [{ name: 'Login' }],
              });
            } catch (error) {
              console.error('Error deleting account:', error);
              Alert.alert('Error', 'Failed to delete account. Please try again later.');
            }
          }
        }
      ]
    );
  };

  const handleLogin = () => {
    navigation.navigate('Login');
  };

  const handleBackToGetStarted = () => {
    navigation.reset({
      index: 0,
      routes: [{ name: 'GetStarted' }],
    });
  };

  const handleSwitchToOnlineMode = () => {
    navigation.navigate('Login', { isSwitch: true });
  };

  return (
    <SafeAreaView style={styles.container}>
      <LinearGradient colors={['#2C3E50', '#3498DB']} style={styles.header}>
        <CustomText style={styles.headerText}>Profile</CustomText>
        {!isOfflineMode && (
          <TouchableOpacity onPress={isEditing ? handleSave : handleEdit} style={styles.editButton}>
            <MaterialIcons name={isEditing ? "save" : "edit"} size={24} color="#ECF0F1" />
          </TouchableOpacity>
        )}
      </LinearGradient>
      <ScrollView style={styles.content}>
        <View style={styles.profileInfo}>
          <View style={styles.avatarContainer}>
            <MaterialIcons name="account-circle" size={100} color="#3498DB" />
          </View>
          {isEditing ? (
            <TextInput
              style={styles.editInput}
              value={editedUsername}
              onChangeText={setEditedUsername}
              placeholder="Enter username"
            />
          ) : (
            <CustomText style={styles.name}>{user?.username || user?.displayName || 'User Name'}</CustomText>
          )}
          {!isOfflineMode && <CustomText style={styles.email}>{user?.email}</CustomText>}
        </View>

        {!isOfflineMode && (
          <View style={styles.infoContainer}>
            <View style={styles.infoItem}>
              <MaterialIcons name="date-range" size={24} color="#3498DB" />
              <CustomText style={styles.infoText}>Joined: {user?.createdAt ? new Date(user.createdAt.toDate()).toLocaleDateString() : 'N/A'}</CustomText>
            </View>
          </View>
        )}

        {isOfflineMode && (
          <View style={styles.offlineInfoContainer}>
            <CustomText style={styles.offlineInfoText}>You are currently in offline mode.</CustomText>
            <CustomText style={styles.offlineInfoText}>Some features may be limited.</CustomText>
          </View>
        )}

        <View style={styles.buttonContainer}>
          {isOfflineMode ? (
            <>
              <CustomButton
                title="Switch to Online Mode"
                onPress={handleSwitchToOnlineMode}
                buttonStyle={styles.loginButton}
                textStyle={styles.buttonText}
              />
              <CustomButton
                title="Back to Get Started"
                onPress={handleBackToGetStarted}
                buttonStyle={styles.backButton}
                textStyle={styles.buttonText}
              />
            </>
          ) : (
            <>
              <CustomButton
                title="Logout"
                onPress={handleLogout}
                buttonStyle={styles.logoutButton}
                textStyle={styles.buttonText}
              />
              <CustomButton
                title="Delete Account"
                onPress={handleDeleteAccount}
                buttonStyle={styles.deleteButton}
                textStyle={styles.buttonText}
              />
            </>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ECF0F1',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
  },
  headerText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#ECF0F1',
  },
  editButton: {
    padding: 5,
  },
  content: {
    flex: 1,
    padding: 20,
  },
  profileInfo: {
    alignItems: 'center',
    marginBottom: 20,
  },
  avatarContainer: {
    marginBottom: 15,
    backgroundColor: '#ECF0F1',
    borderRadius: 50,
    padding: 5,
  },
  name: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#2C3E50',
    marginBottom: 5,
  },
  email: {
    fontSize: 16,
    color: '#7F8C8D',
  },
  editInput: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#2C3E50',
    borderBottomWidth: 1,
    borderBottomColor: '#3498DB',
    marginBottom: 5,
    textAlign: 'center',
    minWidth: 200,
  },
  infoContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 10,
    padding: 15,
    marginBottom: 20,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.23,
    shadowRadius: 2.62,
    elevation: 4,
  },
  infoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  infoText: {
    marginLeft: 10,
    fontSize: 16,
    color: '#2C3E50',
  },
  buttonContainer: {
    marginTop: 20,
  },
  logoutButton: {
    backgroundColor: '#E74C3C',
    marginBottom: 15,
  },
  deleteButton: {
    backgroundColor: '#C0392B',
  },
  loginButton: {
    backgroundColor: '#2ECC71',
    marginBottom: 15,
  },
  backButton: {
    backgroundColor: '#3498DB',
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  offlineInfoContainer: {
    backgroundColor: '#F39C12',
    borderRadius: 10,
    padding: 15,
    marginBottom: 20,
  },
  offlineInfoText: {
    color: '#FFFFFF',
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 5,
  },
});

export default ProfileScreen;
