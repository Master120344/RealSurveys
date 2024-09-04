import { auth } from './firebase-config.js'; // Import auth from firebase-config.js
import { signInWithEmailAndPassword } from 'https://www.gstatic.com/firebasejs/9.22.0/firebase-auth.js';

// Function to handle user login
function loginUser(event) {
    event.preventDefault(); // Prevent form submission

    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;

    // Display loading indicator and hide error messages
    document.querySelector('.loading').style.display = 'block';
    document.querySelector('.error-message').textContent = '';

    signInWithEmailAndPassword(auth, email, password)
        .then((userCredential) => {
            // User signed in successfully
            document.querySelector('.loading').style.display = 'none';
            document.querySelector('.redirecting').style.display = 'block';
            setTimeout(() => {
                window.location.href = 'welcome.html'; // Redirect to welcome page
            }, 2000);
        })
        .catch((error) => {
            // Handle any errors that occur during login
            console.error("Error logging in:", error);
            document.querySelector('.loading').style.display = 'none';
            document.querySelector('.redirecting').style.display = 'none';
            document.querySelector('.error-message').textContent = getErrorMessage(error.code);
        });
}

// Function to get user-friendly error messages based on Firebase error codes
function getErrorMessage(errorCode) {
    switch (errorCode) {
        case 'auth/invalid-email':
            return 'The email address is badly formatted.';
        case 'auth/user-disabled':
            return 'The user account has been disabled by an administrator.';
        case 'auth/user-not-found':
            return 'No user corresponding to this email address.';
        case 'auth/wrong-password':
            return 'The password is invalid or the user does not have a password.';
        default:
            return 'An error occurred. Please try again.';
    }
}

// Attach the loginUser function to the form's submit event
document.getElementById('login-form').addEventListener('submit', loginUser);
