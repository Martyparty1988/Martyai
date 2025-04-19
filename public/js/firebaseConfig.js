// Firebase Configuration for Marty Task Commander

// Initialize Firebase with your config
const firebaseConfig = {
  apiKey: "AIzaSyDcE-klbgLBaPDA-RPPF4oYlrSr36nk9XM",
  authDomain: "vykazy-prace.firebaseapp.com",
  projectId: "vykazy-prace",
  storageBucket: "vykazy-prace.firebasestorage.app",
  messagingSenderId: "513316043274",
  appId: "1:513316043274:web:2d958423630cdd8aa4fdf3",
  measurementId: "G-6V42YCLH72"
};

// This file is prepared for Firebase integration
// Firebase configuration has been updated with actual credentials

// Initialize Firebase when the module is imported
// When using ES modules, uncomment the following:
/*
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";
import { getStorage } from "firebase/storage";
import { getAnalytics } from "firebase/analytics";

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);
const storage = getStorage(app);
const analytics = getAnalytics(app);

// Export the Firebase services
export { db, auth, storage, analytics };
*/

// For now, using script tags approach for compatibility
document.addEventListener('DOMContentLoaded', () => {
  // Check if Firebase is loaded
  if (typeof firebase !== 'undefined') {
    // Initialize Firebase
    firebase.initializeApp(firebaseConfig);
    console.log('Firebase initialized successfully');
  } else {
    console.log('Firebase SDK not loaded yet. Make sure to include the Firebase SDK in your HTML.');
  }
});

console.log('Firebase configuration loaded with actual credentials');
