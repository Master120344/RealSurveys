// Import the functions you need from the SDKs you need
import { initializeApp } from 'https://www.gstatic.com/firebasejs/9.22.0/firebase-app.js';
import { getAuth, signInAnonymously } from 'https://www.gstatic.com/firebasejs/9.22.0/firebase-auth.js';
import { getDatabase, ref, set, get } from 'https://www.gstatic.com/firebasejs/9.22.0/firebase-database.js';

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
const auth = getAuth(app);
const database = getDatabase(app);

// Test Firebase Authentication
async function testAuth() {
  try {
    const userCredential = await signInAnonymously(auth);
    console.log('Signed in anonymously:', userCredential.user.uid);
    return userCredential.user.uid;
  } catch (error) {
    console.error('Error signing in:', error);
  }
}

// Test Firebase Realtime Database
async function writeUserData(userId, name, email) {
  try {
    await set(ref(database, 'users/' + userId), {
      username: name,
      email: email
    });
    console.log('Data written successfully');
  } catch (error) {
    console.error('Error writing data:', error);
  }
}

async function readUserData(userId) {
  try {
    const userRef = ref(database, 'users/' + userId);
    const snapshot = await get(userRef);
    if (snapshot.exists()) {
      console.log('User data:', snapshot.val());
    } else {
      console.log('No data available');
    }
  } catch (error) {
    console.error('Error reading data:', error);
  }
}

// Execute the test functions
async function runTests() {
  const userId = await testAuth();
  if (userId) {
    await writeUserData(userId, 'John Doe', 'john.doe@example.com');
    await readUserData(userId);
  }
}

runTests();
