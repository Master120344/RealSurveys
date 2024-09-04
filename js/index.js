// Import the necessary Firebase functions from your firebase-config.js
import { auth, signIn, onAuthStateChanged } from './js/firebase-config.js';

// Handle form submission for registration
document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('register-form');

    if (form) {
        form.addEventListener('submit', async (e) => {
            e.preventDefault();

            const email = document.getElementById('email').value;
            const password = document.getElementById('password').value;
            const confirmPassword = document.getElementById('confirm-password').value;

            if (password !== confirmPassword) {
                alert('Passwords do not match.');
                return;
            }

            try {
                await createUserWithEmailAndPassword(auth, email, password);
                window.location.href = 'welcome.html'; // Redirect to the welcome page
            } catch (error) {
                console.error('Error registering:', error);
                alert('Registration failed. Please try again.');
            }
        });
    }

    // Theme switching logic
    const themeSwitcher = document.getElementById('theme-switcher');
    if (themeSwitcher) {
        const savedTheme = localStorage.getItem('theme') || 'light';
        document.body.classList.add(savedTheme);

        themeSwitcher.addEventListener('click', () => {
            const currentTheme = document.body.classList.contains('light') ? 'light' : 'dark';
            const newTheme = currentTheme === 'light' ? 'dark' : 'light';
            document.body.classList.remove(currentTheme);
            document.body.classList.add(newTheme);
            localStorage.setItem('theme', newTheme);
        });
    }
});
