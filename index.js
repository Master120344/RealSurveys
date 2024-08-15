// Import the functions you need from the Firebase SDKs
import { initializeApp } from "firebase/app";
import { getAuth, createUserWithEmailAndPassword } from "firebase/auth";

// Your web app's Firebase configuration
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

// Handle form submission
document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('register-form');

    form.addEventListener('submit', async (e) => {
        e.preventDefault();

        const email = document.getElementById('email').value;
        const password = document.getElementById('password').value;
        const confirmPassword = document.getElementById('confirm-password').value;

        if (password !== confirmPassword) {
            alert('Passwords do not match.');
            return;
        }

        try {
            await createUserWithEmailAndPassword(auth, email, password);
            window.location.href = 'welcome.html'; // Redirect to the welcome page
        } catch (error) {
            console.error('Error registering:', error);
            alert('Registration failed. Please try again.');
        }
    });
});
