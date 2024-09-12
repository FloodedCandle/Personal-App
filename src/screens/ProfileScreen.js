import React, { useState, useEffect } from 'react';
import { View, StyleSheet, TouchableOpacity, Image, TextInput, Alert } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import CustomText from '../components/CustomText';
import CustomButton from '../components/CustomButton';
import { auth, db, logout, deleteAccount } from '../config/firebaseConfig';
import { doc, getDoc, updateDoc, deleteDoc } from 'firebase/firestore';
import { updateProfile } from 'firebase/auth';

const ProfileScreen = ({ navigation }) => {
  const [user, setUser] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editedUsername, setEditedUsername] = useState('');

  useEffect(() => {
    fetchUserData();
  }, []);

  const fetchUserData = async () => {
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
  };

  const handleEdit = () => {
    setIsEditing(true);
  };

  const handleSave = async () => {
    try {
      const currentUser = auth.currentUser;
      await updateProfile(currentUser, { displayName: editedUsername });
      await updateDoc(doc(db, 'users', currentUser.uid), { username: editedUsername });
      setIsEditing(false);
      fetchUserData(); // Refresh user data
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
              navigation.reset({
                index: 0,
                routes: [{ name: 'Login' }],
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
              if (error.message === 'No user logged in') {
                Alert.alert('Error', 'You are not logged in. Please log in and try again.');
                navigation.reset({
                  index: 0,
                  routes: [{ name: 'Login' }],
                });
              } else {
                Alert.alert('Error', 'Failed to delete account. Please try again later.');
              }
            }
          }
        }
      ]
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <MaterialIcons name="arrow-back" size={24} color="#2C3E50" />
        </TouchableOpacity>
        <CustomText style={styles.headerTitle}>Profile</CustomText>
        <TouchableOpacity onPress={isEditing ? handleSave : handleEdit}>
          <MaterialIcons name={isEditing ? "save" : "edit"} size={24} color="#2C3E50" />
        </TouchableOpacity>
      </View>

      <View style={styles.profileInfo}>
        <Image
          source={{ uri: user?.photoURL || 'https://via.placeholder.com/150' }}
          style={styles.profileImage}
        />
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
        <CustomText style={styles.email}>{user?.email}</CustomText>
      </View>

      <View style={styles.settingsContainer}>
        <TouchableOpacity style={styles.settingItem}>
          <MaterialIcons name="notifications" size={24} color="#2C3E50" />
          <CustomText style={styles.settingText}>Notifications</CustomText>
        </TouchableOpacity>
        <TouchableOpacity style={styles.settingItem}>
          <MaterialIcons name="security" size={24} color="#2C3E50" />
          <CustomText style={styles.settingText}>Security</CustomText>
        </TouchableOpacity>
        <TouchableOpacity style={styles.settingItem}>
          <MaterialIcons name="help" size={24} color="#2C3E50" />
          <CustomText style={styles.settingText}>Help</CustomText>
        </TouchableOpacity>
      </View>

      <CustomButton
        title="Logout"
        onPress={handleLogout}
        buttonStyle={styles.logoutButton}
        textStyle={styles.logoutButtonText}
      />

      <CustomButton
        title="Delete Account"
        onPress={handleDeleteAccount}
        buttonStyle={styles.deleteButton}
        textStyle={styles.deleteButtonText}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ECF0F1',
    padding: 20,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#2C3E50',
  },
  profileInfo: {
    alignItems: 'center',
    marginBottom: 30,
  },
  profileImage: {
    width: 100,
    height: 100,
    borderRadius: 50,
    marginBottom: 10,
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
  settingsContainer: {
    marginBottom: 30,
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#BDC3C7',
  },
  settingText: {
    marginLeft: 15,
    fontSize: 16,
    color: '#2C3E50',
  },
  logoutButton: {
    backgroundColor: '#E74C3C',
    marginTop: 20,
  },
  logoutButtonText: {
    color: '#FFFFFF',
  },
  deleteButton: {
    backgroundColor: '#C0392B',
    marginTop: 10,
  },
  deleteButtonText: {
    color: '#FFFFFF',
  },
  editInput: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#2C3E50',
    borderBottomWidth: 1,
    borderBottomColor: '#2C3E50',
    marginBottom: 5,
    textAlign: 'center',
  },
});

export default ProfileScreen;
