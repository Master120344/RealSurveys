// Import the necessary functions from Firebase SDK
import { getAuth, onAuthStateChanged, signOut } from 'https://www.gstatic.com/firebasejs/9.22.0/firebase-auth.js';
import { getDatabase, ref, onValue } from 'https://www.gstatic.com/firebasejs/9.22.0/firebase-database.js';
import { initializeApp } from 'https://www.gstatic.com/firebasejs/9.22.0/firebase-app.js';

// Your Firebase configuration object
const firebaseConfig = {
  apiKey: "AIzaSyA7GP-4bnijUNXGBti2nCOJF9iwusuL7c4",
  authDomain: "real-surveys.firebaseapp.com",
  projectId: "real-surveys",
  storageBucket: "real-surveys.appspot.com",
  messagingSenderId: "1024139519354",
  appId: "1:1024139519354:web:a0b11a5a0560ab02ee22c3"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const database = getDatabase(app);

// Auth state change listener
onAuthStateChanged(auth, (user) => {
  if (user) {
    const userId = user.uid;
    const userRef = ref(database, 'users/' + userId);
    onValue(userRef, (snapshot) => {
      const userData = snapshot.val();
      if (userData) {
        document.getElementById('username').innerHTML = userData.username || 'No Username';
        document.getElementById('email').innerHTML = userData.email || 'No Email';
        document.getElementById('balance').innerHTML = userData.balance || 'No Balance';
      } else {
        document.getElementById('username').innerHTML = 'No User Data';
        document.getElementById('email').innerHTML = 'No User Data';
        document.getElementById('balance').innerHTML = 'No User Data';
      }
    });

    document.getElementById('logout-btn').addEventListener('click', () => {
      signOut(auth).then(() => {
        window.location.href = 'index.html';
      }).catch((error) => {
        console.error('Error signing out: ', error);
      });
    });
  } else {
    window.location.href = 'index.html';
  }
});
