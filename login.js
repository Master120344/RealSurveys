// Import necessary Firebase SDKs
import { initializeApp } from 'https://www.gstatic.com/firebasejs/9.22.0/firebase-app.js';
import { getAuth, signInWithEmailAndPassword } from 'https://www.gstatic.com/firebasejs/9.22.0/firebase-auth.js';

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

function loginUser(event) {
    event.preventDefault();
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;

    signInWithEmailAndPassword(auth, email, password)
        .then((userCredential) => {
            // User signed in successfully
            document.querySelector('.error-message').textContent = ''; // Clear error message
            document.querySelector('.redirecting').style.display = 'block'; // Show redirect message
            setTimeout(() => {
                window.location.href = 'surveys.html'; // Redirect after 2 seconds
            }, 2000);
        })
        .catch((error) => {
            // Handle any errors that occur during login
            console.error("Error logging in:", error);
            document.querySelector('.redirecting').style.display = 'none'; // Hide redirect message
            document.querySelector('.error-message').textContent = "Error: " + error.message; // Show error message
        });
}

// Attach the loginUser function to the form's submit event
document.getElementById('login-form').addEventListener('submit', loginUser);
