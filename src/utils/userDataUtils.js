import AsyncStorage from '@react-native-async-storage/async-storage';
import { db } from '../config/firebaseConfig';
import { doc, getDoc } from 'firebase/firestore';

export const clearUserData = async () => {
    const keys = ['budgets', 'transactions', 'notifications'];
    await AsyncStorage.multiRemove(keys);
};

export const loadUserData = async (userId) => {
    try {
        // Load budgets
        const userBudgetsRef = doc(db, 'userBudgets', userId);
        const budgetsSnap = await getDoc(userBudgetsRef);
        if (budgetsSnap.exists()) {
            const budgets = budgetsSnap.data().budgets || [];
            await AsyncStorage.setItem('budgets', JSON.stringify(budgets));
        }

        // Load transactions
        const userTransactionsRef = doc(db, 'transactions', userId);
        const transactionsSnap = await getDoc(userTransactionsRef);
        if (transactionsSnap.exists()) {
            const transactions = transactionsSnap.data().transactions || [];
            await AsyncStorage.setItem('transactions', JSON.stringify(transactions));
        }

        // Load notifications
        const userNotificationsRef = doc(db, 'notifications', userId);
        const notificationsSnap = await getDoc(userNotificationsRef);
        if (notificationsSnap.exists()) {
            const notifications = notificationsSnap.data().notifications || [];
            await AsyncStorage.setItem('notifications', JSON.stringify(notifications));
        }
    } catch (error) {
        console.error('Error loading user data:', error);
    }
};