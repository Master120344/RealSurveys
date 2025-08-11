// js/register_mobile.js

// Assuming you have a similar firebase-config.js for registration
/*
import {
    auth,
    createUserWithEmailAndPassword
} from './firebase-config.js';
*/

document.addEventListener('DOMContentLoaded', () => {

    // --- AOS Initialization ---
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

    // --- Form Elements ---
    const registerForm = document.getElementById('registerForm');
    const passwordInput = document.getElementById('password');
    const confirmPasswordInput = document.getElementById('confirmPassword');
    const strengthLevel = document.querySelector('.strength-level');
    const passwordFeedback = document.getElementById('password-feedback');
    const confirmPasswordFeedback = document.getElementById('confirm-password-feedback');
    const registerMessage = document.getElementById('registerMessage');

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

    // --- Password Strength Checker ---
    if (passwordInput && strengthLevel && passwordFeedback) {
        passwordInput.addEventListener('input', () => {
            const password = passwordInput.value;
            let strength = 0;
            if (password.length >= 8) strength++;
            if (password.match(/[a-z]/) && password.match(/[A-Z]/)) strength++;
            if (password.match(/[0-9]/)) strength++;
            if (password.match(/[^a-zA-Z0-9]/)) strength++;

            strengthLevel.className = 'strength-level'; // Reset classes
            passwordFeedback.style.display = 'block';

            if (password.length === 0) {
                 strengthLevel.style.width = '0%';
                 passwordFeedback.style.display = 'none';
            } else if (strength < 2) {
                strengthLevel.classList.add('weak');
                passwordFeedback.textContent = 'Weak: Use a mix of characters and numbers.';
                passwordFeedback.className = 'feedback-message';
            } else if (strength < 4) {
                strengthLevel.classList.add('medium');
                passwordFeedback.textContent = 'Medium: Good strength.';
                passwordFeedback.className = 'feedback-message success';
            } else {
                strengthLevel.classList.add('strong');
                passwordFeedback.textContent = 'Strong: Excellent!';
                passwordFeedback.className = 'feedback-message success';
            }
        });
    }

    // --- Confirm Password Checker ---
     if (confirmPasswordInput && confirmPasswordFeedback) {
        confirmPasswordInput.addEventListener('input', () => {
            if (confirmPasswordInput.value.length > 0 && confirmPasswordInput.value !== passwordInput.value) {
                confirmPasswordFeedback.textContent = 'Passwords do not match.';
                confirmPasswordFeedback.className = 'feedback-message';
                confirmPasswordFeedback.style.display = 'block';
            } else {
                confirmPasswordFeedback.style.display = 'none';
            }
        });
    }

    // --- Registration Form Submission ---
    if (registerForm) {
        registerForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const email = document.getElementById('email').value.trim();
            const password = passwordInput.value;
            const confirmPassword = confirmPasswordInput.value;
            const submitButton = registerForm.querySelector('.submit-btn');

            hideMessage(registerMessage);
            confirmPasswordFeedback.style.display = 'none';

            // Validation
            if (!email || !password || !confirmPassword) {
                showMessage(registerMessage, 'Please fill in all fields.', true);
                return;
            }
            if (password !== confirmPassword) {
                confirmPasswordFeedback.textContent = 'Passwords do not match.';
                confirmPasswordFeedback.className = 'feedback-message';
                confirmPasswordFeedback.style.display = 'block';
                showMessage(registerMessage, 'Passwords do not match.', true);
                return;
            }
            if (password.length < 8) {
                showMessage(registerMessage, 'Password must be at least 8 characters long.', true);
                return;
            }

            submitButton.disabled = true;
            submitButton.textContent = 'Signing Up...';

            // --- Firebase Registration Logic (Placeholder) ---
            // Replace this with your actual Firebase call
            /*
            createUserWithEmailAndPassword(auth, email, password)
                .then((userCredential) => {
                    showMessage(registerMessage, 'Registration successful! Redirecting to login...', false);
                    setTimeout(() => {
                        window.location.href = 'login_mobile.html';
                    }, 2000);
                })
                .catch((error) => {
                    let friendlyMessage = "An unexpected error occurred. Please try again.";
                    if (error.code === 'auth/email-already-in-use') {
                        friendlyMessage = 'This email address is already in use.';
                    } else if (error.code === 'auth/invalid-email') {
                        friendlyMessage = 'Please enter a valid email address.';
                    }
                    showMessage(registerMessage, friendlyMessage, true);
                })
                .finally(() => {
                    submitButton.disabled = false;
                    submitButton.textContent = 'Sign Up';
                });
            */
            
            // --- Simulated success for demonstration ---
            setTimeout(() => {
                showMessage(registerMessage, 'Registration successful! Redirecting to login...', false);
                submitButton.disabled = false;
                submitButton.textContent = 'Sign Up';
                setTimeout(() => {
                   window.location.href = 'login_mobile.html';
                }, 2000);
            }, 1500);
        });
    }
});
