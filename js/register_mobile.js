// js/register_mobile.js

// --- Firebase imports are temporarily disabled to fix the visibility issue. ---
// We will re-enable these in the next step.
/*
import {
    auth,
    createUserWithEmailAndPassword,
    writeUserData
} from './firebase-config.js';
*/

document.addEventListener('DOMContentLoaded', () => {

    // This initialization is critical for making the form visible.
    AOS.init({
        duration: 800,
        once: true
    });

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

    const registerForm = document.getElementById('registerForm');
    const passwordInput = document.getElementById('password');
    const confirmPasswordInput = document.getElementById('confirmPassword');
    const strengthBar = document.querySelector('.strength-bar');
    const strengthLevel = document.querySelector('.strength-level');
    const passwordFeedback = document.getElementById('password-feedback');
    const confirmPasswordFeedback = document.getElementById('confirm-password-feedback');
    const registerMessage = document.getElementById('registerMessage');

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

    if (passwordInput && strengthBar && strengthLevel && passwordFeedback) {
        passwordInput.addEventListener('input', () => {
            const password = passwordInput.value;

            if (password.length === 0) {
                strengthBar.style.display = 'none';
                passwordFeedback.style.display = 'none';
                return;
            }

            strengthBar.style.display = 'block';
            passwordFeedback.style.display = 'block';

            let strength = 0;
            if (password.length >= 8) strength++;
            if (password.match(/[a-z]/) && password.match(/[A-Z]/)) strength++;
            if (password.match(/[0-9]/)) strength++;
            if (password.match(/[^a-zA-Z0-9]/)) strength++;

            strengthLevel.className = 'strength-level';

            if (strength < 2) {
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

    if (registerForm) {
        registerForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const email = document.getElementById('email').value.trim();
            const password = passwordInput.value;
            const confirmPassword = confirmPasswordInput.value;
            const submitButton = registerForm.querySelector('.submit-btn');

            hideMessage(registerMessage);
            confirmPasswordFeedback.style.display = 'none';

            if (!email || !password || !confirmPassword) {
                showMessage(registerMessage, 'Please fill in all fields.', true);
                return;
            }
            if (password !== confirmPassword) {
                confirmPasswordFeedback.textContent = 'Passwords do not match.';
                confirmPasswordFeedback.className = 'feedback-message';
                confirmPasswordFeedback.style.display = 'block';
                return;
            }
            if (password.length < 8) {
                showMessage(registerMessage, 'Password must be at least 8 characters long.', true);
                return;
            }

            submitButton.disabled = true;
            submitButton.textContent = 'Signing Up...';

            // --- Real Firebase logic is temporarily disabled for this test ---
            console.log("Submit button clicked. Firebase is disabled for this test.");
            showMessage(registerMessage, 'Registration is currently in test mode.', true);

            // Re-enable button after a short delay
            setTimeout(() => {
                submitButton.disabled = false;
                submitButton.textContent = 'Sign Up';
            }, 1500);
        });
    }
});