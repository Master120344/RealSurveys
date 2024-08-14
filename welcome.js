// Import necessary Firebase SDKs
import { getAuth, onAuthStateChanged } from 'https://www.gstatic.com/firebasejs/9.22.0/firebase-auth.js';
import { initializeApp } from 'https://www.gstatic.com/firebasejs/9.22.0/firebase-app.js';

// Initialize Firebase
const firebaseConfig = {
    apiKey: "AIzaSyA7GP-4bnijUNXGBti2nCOJF9iwusuL7c4",
    authDomain: "real-surveys.firebaseapp.com",
    projectId: "real-surveys",
    storageBucket: "real-surveys.appspot.com",
    messagingSenderId: "1024139519354",
    appId: "1:1024139519354:web:a0b11a5a0560ab02ee22c3"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

function displayWelcomeMessage(user) {
    // Example: Display user email or username
    document.getElementById('welcomeMessage').innerText = `Welcome, ${user.email}!`;
}

onAuthStateChanged(auth, (user) => {
    if (user) {
        // User is signed in
        displayWelcomeMessage(user);
    } else {
        // No user is signed in
        window.location.href = 'login.html'; // Redirect to login page if not authenticated
    }
});
