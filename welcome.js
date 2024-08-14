// Import the necessary functions from Firebase SDK
import { initializeApp } from 'https://www.gstatic.com/firebasejs/9.22.0/firebase-app.js';
import { getAuth, onAuthStateChanged, signOut } from 'https://www.gstatic.com/firebasejs/9.22.0/firebase-auth.js';
import { getDatabase, ref, onValue } from 'https://www.gstatic.com/firebasejs/9.22.0/firebase-database.js';

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

    // Listen for user data changes
    onValue(userRef, (snapshot) => {
      const userData = snapshot.val();
      if (userData) {
        document.getElementById('username').textContent = userData.username || 'No Username';
        document.getElementById('email').textContent = userData.email || 'No Email';
        document.getElementById('balance').textContent = userData.balance || 'No Balance';
      } else {
        document.getElementById('username').textContent = 'No User Data';
        document.getElementById('email').textContent = 'No User Data';
        document.getElementById('balance').textContent = 'No User Data';
      }
    });

    // Handle logout
    document.getElementById('logout-btn').addEventListener('click', () => {
      signOut(auth).then(() => {
        window.location.href = 'index.html';
      }).catch((error) => {
        console.error('Error signing out: ', error);
      });
    });
  } else {
    // Redirect to login page if no user is authenticated
    window.location.href = 'index.html';
  }
});
