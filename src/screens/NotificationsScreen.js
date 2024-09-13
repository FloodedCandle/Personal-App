import React, { useState, useEffect } from 'react';
import { View, StyleSheet, FlatList, RefreshControl, TouchableOpacity, Alert } from 'react-native';
import CustomText from '../components/CustomText';
import { MaterialIcons } from '@expo/vector-icons';
import { db, auth } from '../config/firebaseConfig';
import { doc, getDoc, updateDoc, arrayRemove } from 'firebase/firestore';

const NotificationsScreen = () => {
  const [notifications, setNotifications] = useState([]);
  const [refreshing, setRefreshing] = useState(false);

  const fetchNotifications = async () => {
    try {
      const userId = auth.currentUser.uid;
      const notificationsRef = doc(db, 'notifications', userId);
      const docSnap = await getDoc(notificationsRef);

      if (docSnap.exists()) {
        const notificationsData = docSnap.data().notifications || [];
        setNotifications(notificationsData.sort((a, b) => b.createdAt.seconds - a.createdAt.seconds));
      } else {
        setNotifications([]);
      }
    } catch (error) {
      console.error('Error fetching notifications: ', error);
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, []);

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchNotifications();
    setRefreshing(false);
  };

  const deleteNotification = async (notification) => {
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
  };

  const renderNotification = ({ item }) => (
    <View style={styles.notificationItem}>
      <CustomText style={styles.notificationText}>{item.message}</CustomText>
      <CustomText style={styles.notificationDate}>
        {new Date(item.createdAt.seconds * 1000).toLocaleString()}
      </CustomText>
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
      <FlatList
        data={notifications}
        renderItem={renderNotification}
        keyExtractor={item => item.id}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        ListEmptyComponent={<CustomText style={styles.emptyText}>No notifications</CustomText>}
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
    borderRadius: 5,
    marginBottom: 10,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  notificationText: {
    fontSize: 16,
    color: '#2C3E50',
    flex: 1,
  },
  notificationDate: {
    fontSize: 12,
    color: '#7F8C8D',
    marginTop: 5,
  },
  deleteButton: {
    padding: 5,
  },
  emptyText: {
    textAlign: 'center',
    marginTop: 20,
    fontSize: 16,
    color: '#7F8C8D',
  },
});

export default NotificationsScreen;
