// Import the necessary Firebase functions from your firebase-config.js
import { auth, onAuthStateChanged, signOutUser } from './js/firebase-config.js';

// Ensure elements exist before operating on them
document.addEventListener('DOMContentLoaded', () => {
    const userMenu = document.getElementById('user-menu'); // Container for user info and logout
    const loginLink = document.getElementById('login-link'); // Link to login page
    const logoutButton = document.getElementById('logout-button'); // Button to log out

    // Check authentication state
    onAuthStateChanged(user => {
        if (user) {
            // User is signed in
            userMenu.innerHTML = `Logged in as ${user.email} <button id="logout-button">Log Out</button>`;
            if (loginLink) loginLink.style.display = 'none'; // Hide login link
        } else {
            // No user is signed in
            userMenu.innerHTML = '';
            if (loginLink) loginLink.style.display = 'inline'; // Show login link
        }
    });

    // Handle logout
    document.addEventListener('click', event => {
        if (event.target && event.target.id === 'logout-button') {
            signOutUser().then(() => {
                window.location.href = 'index.html'; // Redirect to home page after logout
            }).catch(error => {
                console.error('Error signing out:', error);
                alert('Logout failed. Please try again.');
            });
        }
    });
});
