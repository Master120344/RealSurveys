import { initializeApp } from "https://www.gstatic.com/firebasejs/9.15.0/firebase-app.js";
import {
    getAuth,
    signInWithEmailAndPassword,
    sendPasswordResetEmail,
    onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/9.15.0/firebase-auth.js";
import { firebaseConfig } from './firebase-config.js'; // CORRECT: Import shared config

// The hardcoded firebaseConfig object has been removed from here.

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

document.addEventListener('DOMContentLoaded', () => {

    // --- Preloader ---
    window.addEventListener('load', () => {
        const preloader = document.getElementById('preloader');
        if (preloader) {
            setTimeout(() => {
                preloader.style.opacity = '0';
                setTimeout(() => preloader.style.display = 'none', 500);
            }, 500);
        }
    });

    // --- Form Elements ---
    const loginSection = document.getElementById('loginSection');
    const forgotPasswordSection = document.getElementById('forgotPasswordSection');
    const forgotPasswordLink = document.getElementById('forgotPasswordLink');
    const backToLoginLink = document.getElementById('backToLoginLink');

    const loginForm = document.getElementById('loginForm');
    const resetPasswordBtn = document.getElementById('resetPasswordBtn');

    const loginMessage = document.getElementById('loginMessage');
    const resetMessage = document.getElementById('resetMessage');

    // --- Function to display messages ---
    function showMessage(element, text, isError = false) {
        if (!element) return;
        element.textContent = text;
        element.className = isError ? 'message error' : 'message success';
    }

    // --- Check Auth State ---
    onAuthStateChanged(auth, user => {
        if (user) {
            // User is signed in.
            console.log('User is signed in:', user.uid);
            // Example: Redirect if a logged-in user lands here
            // if(window.location.pathname.includes('login_mobile.html')) {
            //     window.location.href = 'index_mobile.html';
            // }
        } else {
            console.log('User is signed out.');
        }
    });

    // --- Toggle between Login and Forgot Password views ---
    if (forgotPasswordLink) {
        forgotPasswordLink.addEventListener('click', (e) => {
            e.preventDefault();
            loginSection.style.display = 'none';
            forgotPasswordSection.style.display = 'block';
        });
    }

    if (backToLoginLink) {
        backToLoginLink.addEventListener('click', (e) => {
            e.preventDefault();
            forgotPasswordSection.style.display = 'none';
            loginSection.style.display = 'block';
        });
    }

    // --- Email & Password Login ---
    if (loginForm) {
        loginForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const email = document.getElementById('email').value.trim();
            const password = document.getElementById('password').value.trim();
            const submitButton = loginForm.querySelector('.submit-btn');

            showMessage(loginMessage, ''); // Clear previous messages

            if (!email || !password) {
                showMessage(loginMessage, 'Please fill in all fields.', true);
                return;
            }

            submitButton.disabled = true;
            submitButton.textContent = 'Logging In...';

            signInWithEmailAndPassword(auth, email, password)
                .then((userCredential) => {
                    showMessage(loginMessage, 'Login successful! Redirecting...');
                    setTimeout(() => {
                        window.location.href = 'index_mobile.html';
                    }, 1500);
                })
                .catch((error) => {
                    let friendlyMessage = "An error occurred. Please try again.";
                    if (error.code === 'auth/user-not-found' || error.code === 'auth/wrong-password' || error.code === 'auth/invalid-credential') {
                        friendlyMessage = 'Invalid email or password. Please try again.';
                    }
                    showMessage(loginMessage, friendlyMessage, true);
                })
                .finally(() => {
                    submitButton.disabled = false;
                    submitButton.textContent = 'Login';
                });
        });
    }

    // --- Password Reset ---
    if (resetPasswordBtn) {
        resetPasswordBtn.addEventListener('click', (e) => {
            e.preventDefault();
            const resetEmail = document.getElementById('resetEmail').value.trim();
            showMessage(resetMessage, ''); // Clear previous messages

            if (!resetEmail) {
                showMessage(resetMessage, 'Please enter your email address.', true);
                return;
            }

            sendPasswordResetEmail(auth, resetEmail)
                .then(() => {
                    showMessage(resetMessage, 'Password reset link sent! Please check your email inbox (and spam folder).');
                })
                .catch((error) => {
                     let friendlyMessage = `Error: ${error.message}`;
                     if(error.code === 'auth/user-not-found'){
                         friendlyMessage = "No account found with that email address."
                     }
                     showMessage(resetMessage, friendlyMessage, true);
                });
        });
    }
});
