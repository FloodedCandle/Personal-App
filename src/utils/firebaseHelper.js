import firestore from '@react-native-firebase/firestore';
import AsyncStorage from '@react-native-async-storage/async-storage';

export const getUserData = async (userId, collection) => {
    try {
        const doc = await firestore().collection(collection).doc(userId).get();
        return doc.data();
    } catch (error) {
        console.error(`Error fetching ${collection}:`, error);
        return null;
    }
};

export const updateUserData = async (userId, collection, data, isOnline) => {
    if (isOnline) {
        try {
            await firestore().collection(collection).doc(userId).set(data, { merge: true });
        } catch (error) {
            console.error(`Error updating ${collection}:`, error);
        }
    } else {
        // Store offline changes
        await AsyncStorage.setItem(`${collection}_${userId}`, JSON.stringify(data));
    }
};

export const syncOfflineData = async (userId) => {
    const collections = ['transactions', 'userBudget', 'userPreferences'];

    for (const collection of collections) {
        const offlineData = await AsyncStorage.getItem(`${collection}_${userId}`);
        if (offlineData) {
            await firestore().collection(collection).doc(userId).set(JSON.parse(offlineData), { merge: true });
            await AsyncStorage.removeItem(`${collection}_${userId}`);
        }
    }
};