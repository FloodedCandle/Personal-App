import React from 'react';
import { View, StyleSheet, Image, TouchableOpacity } from 'react-native';
import CustomText from '../components/CustomText';
import { MaterialIcons } from '@expo/vector-icons';

const ProfileScreen = () => {
  // Sample user data
  const user = {
    name: 'John Doe',
    email: 'john.doe@example.com',
    profilePicture: 'https://via.placeholder.com/100', // Placeholder image URL
  };

  // Example data; you might fetch this from an API or state management
  const totalSaved = 1500; // Total amount saved up
  const totalBudget = 3000; // Total budget

  return (
    <View style={styles.container}>
      <View style={styles.profileHeader}>
        <Image source={{ uri: user.profilePicture }} style={styles.profileImage} />
        <CustomText style={styles.userName}>{user.name}</CustomText>
        <CustomText style={styles.userEmail}>{user.email}</CustomText>
      </View>

      <View style={styles.summaryCard}>
        <CustomText style={styles.summaryTitle}>Total Saved</CustomText>
        <CustomText style={styles.summaryAmount}>${totalSaved}</CustomText>
        <CustomText style={styles.summarySubtitle}>
          Out of ${totalBudget} Budget
        </CustomText>
      </View>

      <TouchableOpacity style={styles.editButton}>
        <MaterialIcons name="edit" size={24} color="#ECF0F1" />
        <CustomText style={styles.editButtonText}>Edit Profile</CustomText>
      </TouchableOpacity>

      <View style={styles.settingsContainer}>
        <TouchableOpacity style={styles.settingItem}>
          <MaterialIcons name="logout" size={24} color="#E74C3C" />
          <CustomText style={styles.settingText}>Logout</CustomText>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ECF0F1',
    padding: 20,
  },
  profileHeader: {
    alignItems: 'center',
    marginBottom: 20,
  },
  profileImage: {
    width: 100,
    height: 100,
    borderRadius: 50,
    marginBottom: 10,
  },
  userName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#2C3E50',
  },
  userEmail: {
    fontSize: 16,
    color: '#7F8C8D',
  },
  summaryCard: {
    width: '100%',
    maxWidth: 400,
    padding: 20,
    backgroundColor: '#ffffff',
    borderRadius: 12,
    shadowColor: '#2C3E50',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
    marginBottom: 20,
    alignItems: 'center',
  },
  summaryTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2C3E50',
    marginBottom: 10,
  },
  summaryAmount: {
    fontSize: 36,
    fontWeight: 'bold',
    color: '#2ECC71',
    marginBottom: 10,
  },
  summarySubtitle: {
    fontSize: 14,
    color: '#7F8C8D',
  },
  editButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#3498DB',
    padding: 12,
    borderRadius: 8,
    justifyContent: 'center',
    marginBottom: 20,
  },
  editButtonText: {
    color: '#ECF0F1',
    fontSize: 16,
    marginLeft: 8,
  },
  settingsContainer: {
    backgroundColor: '#ffffff',
    borderRadius: 8,
    padding: 10,
    shadowColor: '#2C3E50',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#BDC3C7',
  },
  settingText: {
    fontSize: 18,
    color: '#2C3E50',
    marginLeft: 10,
  },
});

export default ProfileScreen;
