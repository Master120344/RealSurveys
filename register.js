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

// Initialize Firebase
import { initializeApp } from 'https://www.gstatic.com/firebasejs/9.22.0/firebase-app.js';
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const database = getDatabase(app);

function registerUser(event) {
    event.preventDefault();

    // Get user inputs
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;
    const email = document.getElementById('email').value;

    // Register user with Firebase Authentication
    createUserWithEmailAndPassword(auth, email, password)
        .then((userCredential) => {
            // Get the user's ID
            const userId = userCredential.user.uid;

            // Create a user object to store in Realtime Database
            const user = {
                username,
                email,
                balance: 0 // Initialize balance
            };

            // Store the user object in Realtime Database
            set(ref(database, 'users/' + userId), user)
                .then(() => {
                    // Show redirecting message and redirect after a short delay
                    document.querySelector('.redirecting').style.display = 'block';
                    setTimeout(() => {
                        window.location.href = 'welcome.html'; // Redirect to welcome.html
                    }, 2000);
                })
                .catch((error) => {
                    console.error("Error writing to database:", error);
                });
        })
        .catch((error) => {
            console.error("Error registering user:", error);
            alert("Error: " + error.message);
        });
}

// Attach the registerUser function to the form's submit event
document.querySelector('form').addEventListener('submit', registerUser);
