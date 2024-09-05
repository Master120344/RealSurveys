import { auth, onAuthStateChanged, signOutUser } from './firebase-config.js';

// Ensure elements exist before operating on them
document.addEventListener('DOMContentLoaded', () => {
    const userMenu = document.getElementById('user-menu'); // Container for user info and logout
    const loginLink = document.getElementById('login-link'); // Link to login page
    const logoutButton = document.getElementById('logout-button'); // Button to log out

    // Check authentication state
    onAuthStateChanged(user => {
        if (user) {
            // User is signed in
            if (userMenu) {
                userMenu.innerHTML = `Logged in as ${user.email} <button id="logout-button">Log Out</button>`;
            }
            if (loginLink) loginLink.style.display = 'none'; // Hide login link

            // Add event listener for logout button
            const updatedLogoutButton = document.getElementById('logout-button');
            if (updatedLogoutButton) {
                updatedLogoutButton.addEventListener('click', () => {
                    signOutUser().then(() => {
                        window.location.href = 'index.html'; // Redirect to home page after logout
                    }).catch(error => {
                        console.error('Error signing out:', error);
                        alert('Logout failed. Please try again.');
                    });
                });
            }
        } else {
            // No user is signed in
            if (userMenu) userMenu.innerHTML = '';
            if (loginLink) loginLink.style.display = 'inline'; // Show login link

            // Redirect to login page if not logged in and on surveys page
            if (window.location.pathname.endsWith('surveys.html')) {
                window.location.href = 'login.html'; // Redirect to login page if not logged in
            }
        }
    });
});
