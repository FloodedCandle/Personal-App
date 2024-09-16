import React, { useState, useEffect } from 'react';
import { View, StyleSheet, TouchableOpacity, TextInput, Alert, ScrollView, SafeAreaView } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import CustomText from '../components/CustomText';
import CustomButton from '../components/CustomButton';
import { auth, db, logout, deleteAccount } from '../config/firebaseConfig';
import { doc, getDoc, updateDoc, deleteDoc } from 'firebase/firestore';
import { updateProfile } from 'firebase/auth';
import { LinearGradient } from 'expo-linear-gradient';

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
    <SafeAreaView style={styles.container}>
      <LinearGradient colors={['#2C3E50', '#3498DB']} style={styles.header}>
        <CustomText style={styles.headerText}>Profile</CustomText>
        <TouchableOpacity onPress={isEditing ? handleSave : handleEdit} style={styles.editButton}>
          <MaterialIcons name={isEditing ? "save" : "edit"} size={24} color="#ECF0F1" />
        </TouchableOpacity>
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
          <CustomText style={styles.email}>{user?.email}</CustomText>
        </View>

        <View style={styles.infoContainer}>
          <View style={styles.infoItem}>
            <MaterialIcons name="date-range" size={24} color="#3498DB" />
            <CustomText style={styles.infoText}>Joined: {user?.createdAt ? new Date(user.createdAt.toDate()).toLocaleDateString() : 'N/A'}</CustomText>
          </View>
          {/* Add more user info items here if needed */}
        </View>

        <View style={styles.buttonContainer}>
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
  buttonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default ProfileScreen;
