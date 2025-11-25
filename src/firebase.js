import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
    apiKey: "AIzaSyA84xJlvaXxzEuc_KxI4IEcCH6sUIj0apw",
    authDomain: "gravity-runner-4e1e2.firebaseapp.com",
    projectId: "gravity-runner-4e1e2",
    storageBucket: "gravity-runner-4e1e2.firebasestorage.app",
    messagingSenderId: "667191246904",
    appId: "1:667191246904:web:ff7ccc776dadca9dbb66cd"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
