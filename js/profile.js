// profile.js
import { auth, db, onAuthStateChanged } from './firebase-config.js';
import { doc, onSnapshot } from 'https://www.gstatic.com/firebasejs/9.22.0/firebase-firestore.js';
import { updateUserBalance, getUserBalance } from './balance-manager.js';

// AOS Initialization
AOS.init({ duration: 1000, once: true });

// Particles.js for Header Background
particlesJS('particles-js', {
    particles: {
        number: { value: 60, density: { enable: true, value_area: 800 } },
        color: { value: '#66bb6a' },
        shape: { type: 'circle' },
        opacity: { value: 0.5, random: true },
        size: { value: 3, random: true },
        line_linked: { enable: true, distance: 120, color: '#66bb6a', opacity: 0.3, width: 1 },
        move: { enable: true, speed: 2, direction: 'none', random: false }
    },
    interactivity: {
        detect_on: 'canvas',
        events: { onhover: { enable: true, mode: 'repulse' }, onclick: { enable: true, mode: 'push' } },
        modes: { repulse: { distance: 80 }, push: { particles_nb: 3 } }
    },
    retina_detect: true
});

// Theme Toggle
document.getElementById('theme-toggle').addEventListener('click', () => {
    document.body.classList.toggle('light-mode');
    document.getElementById('theme-toggle').innerHTML = document.body.classList.contains('light-mode') 
        ? '<i class="fas fa-sun"></i>' 
        : '<i class="fas fa-moon"></i>';
});

// Navigation Buttons
document.querySelectorAll('.nav-btn:not(#logout-btn)').forEach(button => {
    button.addEventListener('click', () => {
        window.location.href = button.getAttribute('data-href');
    });
});

// Elements
const profileForm = document.getElementById('profileForm');
const usernameInput = document.getElementById('username');
const emailInput = document.getElementById('email');
const balanceSpan = document.getElementById('current-balance');
const messageElement = document.getElementById('message');

// Check Authentication
document.addEventListener('DOMContentLoaded', () => {
    onAuthStateChanged(user => {
        if (user) {
            loadUserProfile(user.uid);
            setupRealTimeBalance(user.uid);
        } else {
            window.location.href = 'login.html';
        }
    });

    profileForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const user = auth.currentUser;
        if (user) updateUserProfile(user.uid);
    });
});

// Load User Profile
async function loadUserProfile(userId) {
    try {
        const userDoc = await getDoc(doc(db, 'users', userId));
        if (userDoc.exists()) {
            const userData = userDoc.data();
            usernameInput.value = userData.username || '';
            emailInput.value = userData.email || '';
            balanceSpan.textContent = `$${userData.balance !== undefined ? userData.balance.toFixed(2) : '0.00'}`;
        }
    } catch (error) {
        console.error('Error loading profile:', error);
        messageElement.textContent = 'Error loading profile.';
    }
}

// Real-Time Balance Listener
function setupRealTimeBalance(userId) {
    const userRef = doc(db, 'users', userId);
    onSnapshot(userRef, (doc) => {
        if (doc.exists()) {
            const balance = doc.data().balance !== undefined ? doc.data().balance : 0;
            balanceSpan.textContent = `$${balance.toFixed(2)}`;
        }
    }, (error) => {
        console.error('Error listening to balance:', error);
    });
}

// Update User Profile
async function updateUserProfile(userId) {
    const newUsername = usernameInput.value;
    const newEmail = emailInput.value;

    try {
        const userRef = doc(db, 'users', userId);
        await updateDoc(userRef, { username: newUsername, email: newEmail });
        messageElement.textContent = 'Profile updated successfully!';
        messageElement.style.color = '#66bb6a';
    } catch (error) {
        console.error('Error updating profile:', error);
        messageElement.textContent = 'Error updating profile.';
        messageElement.style.color = '#ef5350';
    }
}