import { auth } from './firebase-config.js'; // Import auth from firebase-config.js
import { signInWithEmailAndPassword } from 'https://www.gstatic.com/firebasejs/9.22.0/firebase-auth.js';

function loginUser(event) {
    event.preventDefault();
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;

    signInWithEmailAndPassword(auth, email, password)
        .then((userCredential) => {
            // User signed in successfully
            document.getElementById('error-message').textContent = '';
            document.getElementById('success-message').textContent = 'Success! Redirecting...';
            document.querySelector('.redirecting').style.display = 'block';
            setTimeout(() => {
                window.location.href = 'surveys.html'; // Redirect to surveys page or wherever needed
            }, 2000);
        })
        .catch((error) => {
            // Handle any errors that occur during login
            console.error("Error logging in:", error);
            document.getElementById('success-message').textContent = '';
            document.getElementById('error-message').textContent = "Error: " + error.message;
        });
}

// Attach the loginUser function to the form's submit event
document.getElementById('login-form').addEventListener('submit', loginUser);
