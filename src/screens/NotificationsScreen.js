import React, { useState, useEffect, useCallback } from 'react';
import { View, StyleSheet, FlatList, RefreshControl, TouchableOpacity, Alert } from 'react-native';
import CustomText from '../components/CustomText';
import { MaterialIcons } from '@expo/vector-icons';
import { db, auth } from '../config/firebaseConfig';
import { doc, getDoc, updateDoc, arrayRemove } from 'firebase/firestore';
import { useFocusEffect } from '@react-navigation/native';

const NotificationsScreen = () => {
  const [notifications, setNotifications] = useState([]);
  const [refreshing, setRefreshing] = useState(false);

  const fetchNotifications = useCallback(async () => {
    try {
      const userId = auth.currentUser.uid;
      const notificationsRef = doc(db, 'notifications', userId);
      const docSnap = await getDoc(notificationsRef);

      if (docSnap.exists()) {
        const notificationsData = docSnap.data().notifications || [];
        setNotifications(notificationsData.sort((a, b) => b.createdAt.toDate() - a.createdAt.toDate()));
      } else {
        setNotifications([]);
      }
    } catch (error) {
      console.error('Error fetching notifications: ', error);
      Alert.alert('Error', 'Failed to fetch notifications. Please try again.');
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      fetchNotifications();
    }, [fetchNotifications])
  );

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await fetchNotifications();
    setRefreshing(false);
  }, [fetchNotifications]);

  const deleteNotification = useCallback(async (notification) => {
    try {
      const userId = auth.currentUser.uid;
      const notificationsRef = doc(db, 'notifications', userId);
      await updateDoc(notificationsRef, {
        notifications: arrayRemove(notification)
      });
      await fetchNotifications(); // Refresh the list
    } catch (error) {
      console.error('Error deleting notification:', error);
      Alert.alert('Error', 'Failed to delete notification. Please try again.');
    }
  }, [fetchNotifications]);

  const deleteAllNotifications = useCallback(async () => {
    try {
      const userId = auth.currentUser.uid;
      const notificationsRef = doc(db, 'notifications', userId);
      await updateDoc(notificationsRef, { notifications: [] });
      setNotifications([]);
      Alert.alert('Success', 'All notifications deleted successfully');
    } catch (error) {
      console.error('Error deleting all notifications:', error);
      Alert.alert('Error', 'Failed to delete all notifications. Please try again.');
    }
  }, []);

  const renderNotification = ({ item }) => (
    <View style={styles.notificationItem}>
      <View style={styles.notificationContent}>
        <CustomText style={styles.notificationText}>{item.message}</CustomText>
        <CustomText style={styles.notificationDate}>
          {item.createdAt.toDate().toLocaleString()}
        </CustomText>
      </View>
      <TouchableOpacity
        style={styles.deleteButton}
        onPress={() => deleteNotification(item)}
      >
        <MaterialIcons name="delete" size={24} color="#E74C3C" />
      </TouchableOpacity>
    </View>
  );

  return (
    <View style={styles.container}>
      {notifications.length > 0 && (
        <TouchableOpacity
          style={styles.deleteAllButton}
          onPress={() => {
            Alert.alert(
              'Delete All Notifications',
              'Are you sure you want to delete all notifications?',
              [
                { text: 'Cancel', style: 'cancel' },
                { text: 'Delete All', onPress: deleteAllNotifications }
              ]
            );
          }}
        >
          <CustomText style={styles.deleteAllText}>Delete All</CustomText>
        </TouchableOpacity>
      )}
      <FlatList
        data={notifications}
        renderItem={renderNotification}
        keyExtractor={item => item.id}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <MaterialIcons name="notifications-none" size={64} color="#BDC3C7" />
            <CustomText style={styles.emptyText}>No notifications</CustomText>
          </View>
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
  notificationItem: {
    backgroundColor: '#FFFFFF',
    padding: 15,
    borderRadius: 10,
    marginBottom: 10,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 3,
  },
  notificationContent: {
    flex: 1,
    marginRight: 10,
  },
  notificationText: {
    fontSize: 16,
    color: '#2C3E50',
    marginBottom: 5,
  },
  notificationDate: {
    fontSize: 12,
    color: '#7F8C8D',
  },
  deleteButton: {
    padding: 5,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 50,
  },
  emptyText: {
    marginTop: 10,
    fontSize: 18,
    color: '#7F8C8D',
    textAlign: 'center',
  },
  deleteAllButton: {
    backgroundColor: '#E74C3C',
    padding: 10,
    borderRadius: 5,
    marginBottom: 20,
    alignItems: 'center',
  },
  deleteAllText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default NotificationsScreen;
