import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getAnalytics } from 'firebase/analytics';

const firebaseConfig = {
    apiKey: "AIzaSyBOv6VEUAvYR9A3Y-rVLCbY_zM2lDnDgsc",
    authDomain: "budgetwavesapp.firebaseapp.com",
    projectId: "budgetwavesapp",
    storageBucket: "budgetwavesapp.appspot.com",
    messagingSenderId: "56568044984",
    appId: "1:56568044984:web:28b873cb2a1d708f4ac34d",
    measurementId: "G-BP7GRJ64KZ"
};


const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const analytics = getAnalytics(app);

export { auth, db, analytics };
