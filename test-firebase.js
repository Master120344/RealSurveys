// Import the functions you need from the SDKs you need
import { initializeApp } from 'https://www.gstatic.com/firebasejs/9.22.0/firebase-app.js';
import { getDatabase } from 'https://www.gstatic.com/firebasejs/9.22.0/firebase-database.js';

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: 'AIzaSyA7GP-4bnijUNXGBti2nCOJF9iwusuL7c4',
  authDomain: 'real-surveys.firebaseapp.com',
  databaseURL: 'https://real-surveys-default-rtdb.firebaseio.com',
  projectId: 'real-surveys',
  storageBucket: 'real-surveys.appspot.com',
  messagingSenderId: '1024139519354',
  appId: '1:1024139519354:web:a0b11a5a0560ab02ee22c3'
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const database = getDatabase(app);

// Test if Firebase is initialized correctly
console.log('Firebase initialized successfully');
