// Import necessary Firebase SDKs
import { initializeApp } from 'https://www.gstatic.com/firebasejs/9.22.0/firebase-app.js';
import { getAuth, createUserWithEmailAndPassword } from 'https://www.gstatic.com/firebasejs/9.22.0/firebase-auth.js';

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

// Function to register a user
function registerUser(event) {
    event.preventDefault(); // Prevent form from submitting normally

    // Get form values
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    const confirmPassword = document.getElementById('confirm-password').value;

    // Validate passwords
    if (password !== confirmPassword) {
        document.querySelector('.error-message').textContent = 'Passwords do not match.';
        document.querySelector('.error-message').style.display = 'block';
        return;
    }

    // Register user
    createUserWithEmailAndPassword(auth, email, password)
        .then((userCredential) => {
            // User registered successfully
            document.querySelector('.redirecting').style.display = 'block';
            setTimeout(() => {
                window.location.href = 'welcome.html'; // Redirect to welcome.html
            }, 2000);
        })
        .catch((error) => {
            // Handle any errors that occur during registration
            console.error("Error registering user:", error);
            document.querySelector('.error-message').textContent = "Error: " + error.message;
            document.querySelector('.error-message').style.display = 'block';
        });
}

// Attach the registerUser function to the form's submit event
document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('register-form');
    if (form) {
        form.addEventListener('submit', registerUser);
    }
});
