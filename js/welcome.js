// Import necessary Firebase SDKs
import { getAuth, onAuthStateChanged } from 'https://www.gstatic.com/firebasejs/9.22.0/firebase-auth.js';
import { initializeApp } from 'https://www.gstatic.com/firebasejs/9.22.0/firebase-app.js';

// Initialize Firebase
const firebaseConfig = {
    apiKey: 'AIzaSyA7GP-4bnijUNXGBti2nCOJF9iwusuL7c4',
    authDomain: 'real-surveys.firebaseapp.com',
    projectId: 'real-surveys',
    storageBucket: 'real-surveys.appspot.com',
    messagingSenderId: '1024139519354',
    appId: '1:1024139519354:web:a0b11a5a0560ab02ee22c3'
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

function displayWelcomeMessage(user) {
    // Ensure the element exists before trying to modify it
    const welcomeMessageElement = document.getElementById('welcomeMessage');
    if (welcomeMessageElement) {
        welcomeMessageElement.innerText = `Welcome, ${user.email}!`;
    } else {
        console.error('Element with ID "welcomeMessage" not found.');
    }
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
