// Import necessary Firebase SDKs
import { getAuth, createUserWithEmailAndPassword } from 'https://www.gstatic.com/firebasejs/9.22.0/firebase-auth.js';
import { getDatabase, ref, set } from 'https://www.gstatic.com/firebasejs/9.22.0/firebase-database.js';

// Initialize Firebase
const firebaseConfig = {
    apiKey: "AIzaSyA7GP-4bnijUNXGBti2nCOJF9iwusuL7c4",
    authDomain: "real-surveys.firebaseapp.com",
    projectId: "real-surveys",
    storageBucket: "real-surveys.appspot.com",
    messagingSenderId: "1024139519354",
    appId: "1:1024139519354:web:a0b11a5a0560ab02ee22c3"
};

import { initializeApp } from 'https://www.gstatic.com/firebasejs/9.22.0/firebase-app.js';
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const database = getDatabase(app);

function registerUser(event) {
    event.preventDefault();

    // Get user inputs
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    const confirmPassword = document.getElementById('confirm-password').value;

    // Check if passwords match
    if (password !== confirmPassword) {
        alert('Passwords do not match!');
        return;
    }

    // Register user with Firebase Authentication
    createUserWithEmailAndPassword(auth, email, password)
        .then((userCredential) => {
            // Get the user's ID
            const userId = userCredential.user.uid;

            // Save user data to Realtime Database
            set(ref(database, 'users/' + userId), {
                email: email,
                createdAt: new Date().toISOString()
            })
            .then(() => {
                // Redirect to welcome page
                document.getElementById('redirecting').style.display = 'block';
                setTimeout(() => {
                    window.location.href = 'welcome.html';
                }, 2000);
            })
            .catch((error) => {
                console.error("Error saving user data:", error);
                alert("Error: " + error.message);
            });
        })
        .catch((error) => {
            console.error("Error registering:", error);
            alert("Error: " + error.message);
        });
}

// Attach the registerUser function to the form's submit event
document.getElementById('register-form').addEventListener('submit', registerUser);
