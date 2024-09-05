// Import Firebase modules
import { initializeApp } from 'https://www.gstatic.com/firebasejs/9.22.0/firebase-app.js';
import { getAuth, signInWithEmailAndPassword, onAuthStateChanged as onAuthStateChangedFn, signOut } from 'https://www.gstatic.com/firebasejs/9.22.0/firebase-auth.js';
import { getStorage } from 'https://www.gstatic.com/firebasejs/9.22.0/firebase-storage.js';
import { getDatabase, ref, set, get } from 'https://www.gstatic.com/firebasejs/9.22.0/firebase-database.js';

// Firebase configuration
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
const database = getDatabase(app);

// Authentication functions
function signIn(email, password) {
  return signInWithEmailAndPassword(auth, email, password);
}

function signOutUser() {
  return signOut(auth);
}

// Check user authentication state
function onAuthStateChanged(callback) {
  return onAuthStateChangedFn(auth, callback);
}

// Database functions
function writeUserData(userId, name, email) {
  return set(ref(database, 'users/' + userId), {
    username: name,
    email: email
  });
}

function readUserData(userId) {
  const userRef = ref(database, 'users/' + userId);
  return get(userRef).then(snapshot => {
    if (snapshot.exists()) {
      return snapshot.val();
    } else {
      throw new Error('No data available');
    }
  });
}

// Exporting functions and instances
export { auth, storage, database, signIn, signOutUser, onAuthStateChanged, writeUserData, readUserData };
