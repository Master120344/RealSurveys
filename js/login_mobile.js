// js/login_mobile.js

// IMPORTANT: This script relies on two external libraries being loaded in your HTML:
// 1. AOS (Animate on Scroll) for animations.
// 2. Firebase SDK (specifically the functions below) for authentication.
// If UI elements are not interactive, check your browser's developer console for errors,
// as they often point to issues with these imports.
import {
    auth,
    signIn,
    sendPasswordResetEmail,
    onAuthStateChanged
} from './firebase-config.js';

document.addEventListener('DOMContentLoaded', () => {

    // --- Initialize Libraries ---
    try {
        AOS.init({
            duration: 800,
            once: true
        });
    } catch (e) {
        console.error("AOS initialization failed. Is the library loaded?", e);
    }

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
            icon.className = document.body.classList.contains('light-mode') ? 'fas fa-sun' : 'fas fa-moon';
        });
    }
    
    // --- Password Visibility Toggle ---
    document.querySelectorAll('.toggle-password').forEach(button => {
        button.addEventListener('click', () => {
            const container = button.parentElement;
            const input = container.querySelector('input');
            const icon = button.querySelector('i');
            if (input.type === 'password') {
                input.type = 'text';
                icon.className = 'fas fa-eye-slash';
            } else {
                input.type = 'password';
                icon.className = 'fas fa-eye';
            }
        });
    });

    // --- Form Elements ---
    const loginSection = document.getElementById('loginSection');
    const forgotPasswordSection = document.getElementById('forgotPasswordSection');
    const forgotPasswordLink = document.getElementById('forgotPasswordLink');
    const backToLoginLink = document.getElementById('backToLoginLink');
    const loginForm = document.getElementById('loginForm');
    const resetPasswordForm = document.getElementById('resetPasswordForm');
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

    // --- Firebase Authentication Logic ---
    try {
        // --- Check Auth State ---
        onAuthStateChanged(auth, user => {
            if (user) {
                console.log('User is signed in, redirecting to welcome.html:', user.uid);
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
                    .catch((error) => {
                        let friendlyMessage = "An unexpected error occurred. Please try again.";
                        if (['auth/user-not-found', 'auth/wrong-password', 'auth/invalid-credential'].includes(error.code)) {
                            friendlyMessage = 'Invalid email or password. Please try again.';
                        }
                        showMessage(loginMessage, friendlyMessage, true);
                        console.error("Login Error:", error.code, error.message);
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
                         console.error("Password Reset Error:", error.code, error.message);
                    })
                    .finally(() => {
                        submitButton.disabled = false;
                        submitButton.textContent = 'Send Reset Link';
                    });
            });
        }
    } catch (e) {
        console.error("Firebase authentication setup failed. Is firebase-config.js correct and loaded?", e);
        showMessage(loginMessage, "Could not connect to authentication service.", true);
    }
});