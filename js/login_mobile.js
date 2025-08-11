// js/login_mobile.js

// Import the necessary functions from your central firebase-config.js
// This ensures Firebase is initialized only ONCE.
import {
    auth,
    signIn,
    sendPasswordResetEmail,
    onAuthStateChanged
} from './firebase-config.js';

document.addEventListener('DOMContentLoaded', () => {

    // --- Preloader ---
    // This listener should be on 'window.load' to ensure all assets are loaded
    window.addEventListener('load', () => {
        const preloader = document.getElementById('preloader');
        if (preloader) {
            preloader.style.opacity = '0';
            // Use a transition-end listener for smoother removal
            preloader.addEventListener('transitionend', () => preloader.style.display = 'none');
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
        element.className = `message ${isError ? 'error' : 'success'}`;
        // Ensure message is visible
        element.style.display = 'block';
    }
    
    function hideMessage(element) {
        if (!element) return;
        element.textContent = '';
        element.style.display = 'none';
    }

    // --- Check Auth State ---
    onAuthStateChanged(user => {
        if (user) {
            // User is signed in. Redirect from login page to the welcome page.
            console.log('User is signed in, redirecting to welcome.html:', user.uid);
            if (window.location.pathname.includes('login_mobile.html')) {
                // *** THIS IS THE UPDATED REDIRECT LINE ***
                window.location.href = 'welcome.html';
            }
        } else {
            console.log('User is signed out. Login page is ready.');
        }
    });

    // --- Toggle between Login and Forgot Password views ---
    if (forgotPasswordLink) {
        forgotPasswordLink.addEventListener('click', (e) => {
            e.preventDefault();
            hideMessage(loginMessage);
            loginSection.style.display = 'none';
            forgotPasswordSection.style.display = 'block';
        });
    }

    if (backToLoginLink) {
        backToLoginLink.addEventListener('click', (e) => {
            e.preventDefault();
            hideMessage(resetMessage);
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

            hideMessage(loginMessage);

            if (!email || !password) {
                showMessage(loginMessage, 'Please fill in both email and password.', true);
                return;
            }

            submitButton.disabled = true;
            submitButton.textContent = 'Logging In...';

            // Use the signIn function imported from firebase-config.js
            signIn(email, password)
                .then((userCredential) => {
                    // The onAuthStateChanged listener above will handle the redirect automatically.
                    // This message will be visible for a brief moment before the redirect occurs.
                    showMessage(loginMessage, 'Login successful! Redirecting...', false);
                })
                .catch((error) => {
                    let friendlyMessage = "An unexpected error occurred. Please try again.";
                    console.error("Login Error:", error.code, error.message);
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
            hideMessage(resetMessage);

            if (!resetEmail) {
                showMessage(resetMessage, 'Please enter your email address.', true);
                return;
            }

            // Use the sendPasswordResetEmail function imported from firebase-config.js
            sendPasswordResetEmail(auth, resetEmail)
                .then(() => {
                    showMessage(resetMessage, 'Password reset link sent! Please check your email inbox (and spam folder).', false);
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
