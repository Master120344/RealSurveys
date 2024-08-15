// Import the functions you need from the SDKs you need
import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getStorage } from 'firebase/storage';
import { getDatabase } from 'firebase/database'; // Import Realtime Database

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: 'AIzaSyA7GP-4bnijUNXGBti2nCOJF9iwusuL7c4',
  authDomain: 'real-surveys.firebaseapp.com',
  projectId: 'real-surveys',
  storageBucket: 'real-surveys.appspot.com',
  messagingSenderId: '1024139519354',
  appId: '1:1024139519354:web:a0b11a5a0560ab02ee22c3'
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const storage = getStorage(app);
const database = getDatabase(app); // Initialize Realtime Database

// Export auth, storage, and database to use in other files
export { auth, storage, database };
