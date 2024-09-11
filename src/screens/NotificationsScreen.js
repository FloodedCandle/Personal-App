import React, { useState, useCallback } from 'react';
import { View, StyleSheet, FlatList, TouchableOpacity, Alert, RefreshControl } from 'react-native';
import CustomText from '../components/CustomText';
import { MaterialIcons } from '@expo/vector-icons';
import { Swipeable } from 'react-native-gesture-handler';

const initialNotifications = [
  { id: '1', title: 'Budget Alert', description: 'Your budget limit is nearing. Please review your expenses.' },
  { id: '2', title: 'Savings Milestone', description: 'Congratulations! You’ve reached a new savings milestone.' },
  { id: '3', title: 'Expense Update', description: 'An expense has been added to your account.' },
  // Add more notifications as needed
];

const NotificationScreen = () => {
  const [notifications, setNotifications] = useState(initialNotifications);
  const [refreshing, setRefreshing] = useState(false);

  const handleDelete = (id) => {
    setNotifications((prevNotifications) =>
      prevNotifications.filter((notification) => notification.id !== id)
    );
  };

  const clearAllNotifications = () => {
    Alert.alert(
      'Clear All Notifications',
      'Are you sure you want to clear all notifications?',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'OK',
          onPress: () => setNotifications([]),
        },
      ]
    );
  };

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    // Simulate a network request or data refresh
    setTimeout(() => {
      setRefreshing(false);
      // You can fetch fresh data here
    }, 1000); // Adjust the timeout as needed
  }, []);

  const renderRightActions = (id) => (
    <TouchableOpacity
      style={styles.deleteButton}
      onPress={() => handleDelete(id)}
    >
      <MaterialIcons name="delete" size={24} color="#ffffff" />
    </TouchableOpacity>
  );

  const renderItem = ({ item }) => (
    <Swipeable
      renderRightActions={() => renderRightActions(item.id)}
      overshootRight={false}
    >
      <View style={styles.notificationItem}>
        <View style={styles.notificationContent}>
          <CustomText style={styles.notificationTitle}>{item.title}</CustomText>
          <CustomText style={styles.notificationDescription}>{item.description}</CustomText>
        </View>
      </View>
    </Swipeable>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.clearAllButton} onPress={clearAllNotifications}>
          <CustomText style={styles.clearAllText}>Clear All</CustomText>
        </TouchableOpacity>
      </View>
      <FlatList
        data={notifications}
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={['#3498DB']}
          />
        }
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
    alignItems: 'flex-end', // Align items to the right
    marginBottom: 20,
  },
  clearAllButton: {
    backgroundColor: '#3498DB',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
  },
  clearAllText: {
    color: '#ECF0F1',
    fontSize: 16,
  },
  notificationItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    padding: 15,
    borderRadius: 8,
    marginBottom: 10,
    shadowColor: '#2C3E50',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  notificationContent: {
    flex: 1,
  },
  notificationTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#2C3E50',
  },
  notificationDescription: {
    fontSize: 14,
    color: '#7F8C8D',
    marginTop: 5,
  },
  deleteButton: {
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#E74C3C',
    width: 50,
    height: '100%',
    borderRadius: 8,
    paddingHorizontal: 10,
    marginLeft: 4,
  },
});

export default NotificationScreen;
