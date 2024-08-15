import { auth } from './firebase-config.js'; // Ensure this path is correct
import { signInWithEmailAndPassword } from 'https://www.gstatic.com/firebasejs/9.22.0/firebase-auth.js';

function loginUser(event) {
    event.preventDefault();
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;

    // Clear previous messages
    const errorMessageElement = document.getElementById('error-message');
    const successMessageElement = document.getElementById('success-message');
    if (errorMessageElement) errorMessageElement.textContent = '';
    if (successMessageElement) successMessageElement.textContent = '';

    signInWithEmailAndPassword(auth, email, password)
        .then((userCredential) => {
            // User signed in successfully
            if (successMessageElement) {
                successMessageElement.textContent = 'Success! Redirecting...';
                document.querySelector('.redirecting').style.display = 'block';
            }
            setTimeout(() => {
                window.location.href = 'surveys.html'; // Redirect to surveys page or wherever needed
            }, 2000);
        })
        .catch((error) => {
            // Handle any errors that occur during login
            console.error("Error logging in:", error);
            if (errorMessageElement) {
                errorMessageElement.textContent = "Error: " + error.message;
            }
        });
}

// Attach the loginUser function to the form's submit event
const loginForm = document.getElementById('login-form');
if (loginForm) {
    loginForm.addEventListener('submit', loginUser);
}
