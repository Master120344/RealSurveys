// js/login_mobile.js

// Import the necessary functions from your central firebase-config.js
import {
    auth,
    signIn,
    sendPasswordResetEmail,
    onAuthStateChanged
} from './firebase-config.js';

document.addEventListener('DOMContentLoaded', () => {

    AOS.init({
        duration: 800,
        once: true
    });

    // --- Preloader ---
    window.addEventListener('load', () => {
        const preloader = document.getElementById('preloader');
        if (preloader) {
            preloader.style.opacity = '0';
            preloader.addEventListener('transitionend', () => preloader.style.display = 'none');
        }
    });

    // --- Navigation ---
    const navToggle = document.querySelector('.nav-toggle');
    const navMenu = document.querySelector('.nav-menu');
    if (navToggle && navMenu) {
        navToggle.addEventListener('click', () => {
            navMenu.classList.toggle('active');
        });
    }

    // --- Navigation Buttons ---
    document.querySelectorAll('.nav-btn').forEach(button => {
        const targetHref = button.dataset.href;
        if (targetHref) {
            button.addEventListener('click', () => {
                window.location.href = targetHref;
            });
        }
    });

    // --- Theme Toggle ---
    const themeToggle = document.getElementById('theme-toggle');
    if (themeToggle) {
        themeToggle.addEventListener('click', () => {
            document.body.classList.toggle('light-mode');
            const icon = themeToggle.querySelector('i');
            if (document.body.classList.contains('light-mode')) {
                icon.classList.remove('fa-moon');
                icon.classList.add('fa-sun');
            } else {
                icon.classList.remove('fa-sun');
                icon.classList.add('fa-moon');
            }
        });
    }
    
    // --- Password Visibility Toggle ---
    document.querySelectorAll('.toggle-password').forEach(button => {
        button.addEventListener('click', () => {
            const input = button.previousElementSibling;
            const icon = button.querySelector('i');
            if (input.type === 'password') {
                input.type = 'text';
                icon.classList.remove('fa-eye');
                icon.classList.add('fa-eye-slash');
            } else {
                input.type = 'password';
                icon.classList.remove('fa-eye-slash');
                icon.classList.add('fa-eye');
            }
        });
    });

    // --- Form Elements ---
    const loginSection = document.getElementById('loginSection');
    const forgotPasswordSection = document.getElementById('forgotPasswordSection');
    const forgotPasswordLink = document.getElementById('forgotPasswordLink');
    const backToLoginLink = document.getElementById('backToLoginLink');

    const loginForm = document.getElementById('loginForm');
    const resetPasswordForm = document.getElementById('resetPasswordForm'); // Corrected to target the form

    const loginMessage = document.getElementById('loginMessage');
    const resetMessage = document.getElementById('resetMessage');

    // --- Function to display messages ---
    function showMessage(element, text, isError = false) {
        if (!element) return;
        element.textContent = text;
        element.className = `message ${isError ? 'error' : 'success'}`;
        element.style.display = 'block';
    }
    
    function hideMessage(element) {
        if (!element) return;
        element.textContent = '';
        element.style.display = 'none';
    }

    // --- Check Auth State ---
    onAuthStateChanged(auth, user => {
        if (user) {
            console.log('User is signed in, redirecting to welcome.html:', user.uid);
            // Ensure we only redirect from the login page
            if (window.location.pathname.includes('login_mobile.html')) {
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

            signIn(auth, email, password)
                .then((userCredential) => {
                    showMessage(loginMessage, 'Login successful! Redirecting...', false);
                    // The onAuthStateChanged listener will handle the redirect.
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
    if (resetPasswordForm) {
        resetPasswordForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const resetEmail = document.getElementById('resetEmail').value.trim();
            const submitButton = resetPasswordForm.querySelector('.submit-btn');
            hideMessage(resetMessage);

            if (!resetEmail) {
                showMessage(resetMessage, 'Please enter your email address.', true);
                return;
            }
            
            submitButton.disabled = true;
            submitButton.textContent = 'Sending...';

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
                })
                .finally(() => {
                    submitButton.disabled = false;
                    submitButton.textContent = 'Send Reset Link';
                });
        });
    }
});