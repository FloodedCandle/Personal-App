import React, { useState, useEffect, useCallback } from 'react';
import { View, StyleSheet, FlatList, RefreshControl, TouchableOpacity, Alert, SafeAreaView } from 'react-native';
import CustomText from '../components/CustomText';
import CustomButton from '../components/CustomButton';
import { MaterialIcons } from '@expo/vector-icons';
import { db, auth } from '../config/firebaseConfig';
import { doc, getDoc, updateDoc, arrayRemove } from 'firebase/firestore';
import { useFocusEffect } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient';
import AsyncStorage from '@react-native-async-storage/async-storage';

const NotificationsScreen = ({ route }) => {
  const [notifications, setNotifications] = useState([]);
  const [refreshing, setRefreshing] = useState(false);
  const isOfflineMode = route.params?.offlineMode || false;

  const fetchNotifications = useCallback(async () => {
    try {
      if (isOfflineMode) {
        const storedNotifications = await AsyncStorage.getItem('notifications');
        if (storedNotifications) {
          setNotifications(JSON.parse(storedNotifications));
        }
      } else {
        const userId = auth.currentUser?.uid;
        if (userId) {
          const notificationsRef = doc(db, 'notifications', userId);
          const docSnap = await getDoc(notificationsRef);
          if (docSnap.exists()) {
            const notificationsData = docSnap.data().notifications || [];
            setNotifications(notificationsData.sort((a, b) => b.createdAt.toDate() - a.createdAt.toDate()));
            await AsyncStorage.setItem('notifications', JSON.stringify(notificationsData));
          }
        }
      }
    } catch (error) {
      console.error('Error fetching notifications: ', error);
      Alert.alert('Error', 'Failed to fetch notifications. Please try again.');
    }
  }, [isOfflineMode]);

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
        <MaterialIcons name="delete-outline" size={24} color="#E74C3C" />
      </TouchableOpacity>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <LinearGradient colors={['#2C3E50', '#3498DB']} style={styles.header}>
        <CustomText style={styles.headerText}>Notifications</CustomText>
      </LinearGradient>
      {notifications.length > 0 && (
        <CustomButton
          title="Delete All"
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
          buttonStyle={styles.deleteAllButton}
          textStyle={styles.deleteAllText}
        />
      )}
      <FlatList
        data={notifications}
        renderItem={renderNotification}
        keyExtractor={item => item.id}
        contentContainerStyle={styles.listContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={['#3498DB']} />
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <MaterialIcons name="notifications-none" size={64} color="#BDC3C7" />
            <CustomText style={styles.emptyText}>No notifications</CustomText>
          </View>
        }
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ECF0F1',
  },
  header: {
    padding: 20,
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
  },
  headerText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#ECF0F1',
  },
  listContent: {
    padding: 15,
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
    marginHorizontal: 15,
    marginTop: 15,
    marginBottom: 5,
    borderRadius: 8,
  },
  deleteAllText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default NotificationsScreen;
