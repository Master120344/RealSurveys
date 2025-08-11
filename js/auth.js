// auth.js
import { auth, db, onAuthStateChanged } from './firebase-config.js';
import { doc, setDoc } from 'https://www.gstatic.com/firebasejs/9.22.0/firebase-firestore.js';

function setupAuthUI(userMenuId = 'user-menu', loginLinkId = 'login-link', emailSpanId = 'user-email', logoutBtnId = 'logout-btn') {
    document.addEventListener('DOMContentLoaded', () => {
        const userMenu = document.getElementById(userMenuId);
        const loginLink = document.getElementById(loginLinkId);
        const emailSpan = document.getElementById(emailSpanId);
        const logoutButton = document.getElementById(logoutBtnId);

        onAuthStateChanged(user => {
            if (user) {
                // Save email and initialize balance on login
                saveUserData(user.uid, user.email);
                if (userMenu) {
                    userMenu.innerHTML = `Logged in as ${user.email} <button id="temp-logout">Log Out</button>`;
                    const tempLogout = document.getElementById('temp-logout');
                    if (tempLogout) tempLogout.addEventListener('click', handleLogout);
                } else if (emailSpan && logoutButton) {
                    emailSpan.textContent = user.email;
                    logoutButton.style.display = 'inline-block';
                }
                if (loginLink) loginLink.style.display = 'none';
            } else {
                if (userMenu) userMenu.innerHTML = '';
                if (emailSpan && logoutButton) {
                    emailSpan.textContent = '';
                    logoutButton.style.display = 'none';
                }
                if (loginLink) loginLink.style.display = 'inline';
                if (window.location.pathname.endsWith('surveys.html') || window.location.pathname.endsWith('balance.html')) {
                    window.location.href = 'login.html';
                }
            }
        });

        if (logoutButton) logoutButton.addEventListener('click', handleLogout);
    });
}

function handleLogout() {
    auth.signOut()
        .then(() => window.location.href = 'index.html')
        .catch(error => {
            console.error('Error signing out:', error);
            alert('Logout failed. Please try again.');
        });
}

async function saveUserData(userId, email) {
    try {
        const userRef = doc(db, 'users', userId);
        await setDoc(userRef, { 
            email: email, 
            balance: 0 
        }, { merge: true });
        console.log('User data saved:', email);
    } catch (error) {
        console.error('Error saving user data:', error);
    }
}

export { setupAuthUI, saveUserData };