// js/login_mobile.js
import {
    auth,
    signIn,
    sendPasswordResetEmail
} from './firebase-config.js';

document.addEventListener('DOMContentLoaded', () => {

    // --- Initialize Animations ---
    AOS.init({
        duration: 800,
        once: true
    });

    // --- Common Navigation and Theme ---
    const navToggle = document.querySelector('.nav-toggle');
    const navMenu = document.querySelector('.nav-menu');
    if (navToggle && navMenu) {
        navToggle.addEventListener('click', () => {
            navMenu.classList.toggle('active');
        });
    }

    document.querySelectorAll('.nav-btn').forEach(button => {
        const targetHref = button.dataset.href;
        if (targetHref) {
            button.addEventListener('click', () => {
                window.location.href = targetHref;
            });
        }
    });

    const themeToggle = document.getElementById('theme-toggle');
    if (themeToggle) {
        themeToggle.addEventListener('click', () => {
            document.body.classList.toggle('light-mode');
            const icon = themeToggle.querySelector('i');
            icon.classList.toggle('fa-moon');
            icon.classList.toggle('fa-sun');
        });
    }

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
        element.style.display = 'none';
        element.textContent = '';
    }

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

    // --- Toggle Password Visibility ---
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

    // --- Login Form Submission ---
    if (loginForm) {
        loginForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const email = loginForm.email.value.trim();
            const password = loginForm.password.value;
            const submitButton = loginForm.querySelector('.submit-btn');

            hideMessage(loginMessage);

            if (!email || !password) {
                showMessage(loginMessage, 'Please enter both email and password.', true);
                return;
            }

            submitButton.disabled = true;
            submitButton.textContent = 'Logging In...';

            signIn(email, password)
                .then(userCredential => {
                    showMessage(loginMessage, 'Login successful! Redirecting...', false);
                    setTimeout(() => {
                        window.location.href = 'surveys_mobile.html'; // Redirect to the main surveys page
                    }, 1500);
                })
                .catch(error => {
                    let friendlyMessage = 'An error occurred. Please try again.';
                    switch (error.code) {
                        case 'auth/user-not-found':
                        case 'auth/wrong-password':
                            friendlyMessage = 'Invalid email or password.';
                            break;
                        case 'auth/invalid-email':
                            friendlyMessage = 'Please enter a valid email address.';
                            break;
                    }
                    showMessage(loginMessage, friendlyMessage, true);
                })
                .finally(() => {
                    submitButton.disabled = false;
                    submitButton.textContent = 'Login';
                });
        });
    }

    // --- Reset Password Form Submission ---
    if (resetPasswordForm) {
        resetPasswordForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const email = resetPasswordForm.resetEmail.value.trim();
            const submitButton = resetPasswordForm.querySelector('.submit-btn');

            hideMessage(resetMessage);

            if (!email) {
                showMessage(resetMessage, 'Please enter your email address.', true);
                return;
            }

            submitButton.disabled = true;
            submitButton.textContent = 'Sending...';

            sendPasswordResetEmail(auth, email)
                .then(() => {
                    // Always show a generic success message to prevent email enumeration
                    showMessage(resetMessage, 'If an account exists for this email, a password reset link has been sent. Please check your inbox and spam folder.', false);
                })
                .catch(error => {
                    // Also show the same generic message on error for security
                     showMessage(resetMessage, 'If an account exists for this email, a password reset link has been sent. Please check your inbox and spam folder.', false);
                })
                .finally(() => {
                    submitButton.disabled = false;
                    submitButton.textContent = 'Send Reset Link';
                });
        });
    }
});