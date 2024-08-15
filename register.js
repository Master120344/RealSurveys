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

function registerUser(event) {
    event.preventDefault();
    
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    const confirmPassword = document.getElementById('confirm-password').value;

    // Check if passwords match
    if (password !== confirmPassword) {
        alert("Passwords do not match.");
        return;
    }

    // Create a new user with email and password
    createUserWithEmailAndPassword(auth, email, password)
        .then((userCredential) => {
            // User registered successfully
            const redirectingElement = document.querySelector('.redirecting');
            redirectingElement.textContent = 'Success! Redirecting...';
            redirectingElement.classList.add('success');
            redirectingElement.style.display = 'block';
            setTimeout(() => {
                window.location.href = 'login.html';
            }, 2000);
        })
        .catch((error) => {
            // Handle errors
            console.error("Error registering user:", error);
            alert("Error: " + error.message);
        });
}

// Attach the registerUser function to the form's submit event
document.getElementById('register-form').addEventListener('submit', registerUser);
