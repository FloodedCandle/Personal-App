import { initializeApp, getApps, getApp } from 'firebase/app';
import { initializeAuth, getReactNativePersistence, signOut, deleteUser, getAuth } from 'firebase/auth';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { getFirestore } from 'firebase/firestore';
import { getAnalytics, isSupported } from 'firebase/analytics';

const firebaseConfig = {
    apiKey: "AIzaSyBOv6VEUAvYR9A3Y-rVLCbY_zM2lDnDgsc",
    authDomain: "budgetwavesapp.firebaseapp.com",
    projectId: "budgetwavesapp",
    storageBucket: "budgetwavesapp.appspot.com",
    messagingSenderId: "56568044984",
    appId: "1:56568044984:web:28b873cb2a1d708f4ac34d",
    measurementId: "G-BP7GRJ64KZ"
};

let app;
let auth;
let db;
let analytics = null;

if (getApps().length === 0) {
    app = initializeApp(firebaseConfig);
    auth = initializeAuth(app, {
        persistence: getReactNativePersistence(AsyncStorage)
    });
    db = getFirestore(app);

    isSupported().then(supported => {
        if (supported) {
            analytics = getAnalytics(app);
        }
    });
} else {
    app = getApp();
    auth = getAuth(app);
    db = getFirestore(app);
}

const logout = () => signOut(auth);
const deleteAccount = async () => {
    const user = auth.currentUser;
    if (!user) {
        throw new Error('No user logged in');
    }
    const uid = user.uid;
    await deleteUser(user);
    return uid;
};

export { auth, db, analytics, logout, deleteAccount };
