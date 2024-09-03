// Import necessary Firebase modules
import { getAuth, onAuthStateChanged, updateProfile } from 'https://www.gstatic.com/firebasejs/9.22.0/firebase-auth.js';
import { initializeApp } from 'https://www.gstatic.com/firebasejs/9.22.0/firebase-app.js';
import { getDatabase, ref, set, get } from 'https://www.gstatic.com/firebasejs/9.22.0/firebase-database.js';

// Initialize Firebase
const firebaseConfig = {
    apiKey: "AIzaSyA7GP-4bnijUNXGBti2nCOJF9iwusuL7c4",
    authDomain: "real-surveys.firebaseapp.com",
    projectId: "real-surveys",
    storageBucket: "real-surveys.appspot.com",
    messagingSenderId: "1024139519354",
    appId: "1:1024139519354:web:a0b11a5a0560ab02ee22c3"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const database = getDatabase(app);

// Elements
const profileForm = document.getElementById('profileForm');
const usernameInput = document.getElementById('username');
const emailInput = document.getElementById('email');
const messageElement = document.getElementById('message');

// Function to check if the user is authenticated
function checkAuth() {
    onAuthStateChanged(auth, (user) => {
        if (user) {
            // User is signed in
            loadUserProfile(user.uid);
        } else {
            // No user is signed in
            window.location.href = 'login.html'; // Redirect to login page
        }
    });
}

// Function to load user profile
function loadUserProfile(userId) {
    const userRef = ref(database, 'users/' + userId);

    get(userRef).then((snapshot) => {
        if (snapshot.exists()) {
            const userData = snapshot.val();
            usernameInput.value = userData.username || '';
            emailInput.value = userData.email || '';
        } else {
            console.error('No user data available');
        }
    }).catch((error) => {
        console.error('Error fetching user data:', error);
    });
}

// Function to update user profile
function updateUserProfile(userId) {
    const newUsername = usernameInput.value;
    const newEmail = emailInput.value;

    // Update profile in Firebase Authentication
    const user = auth.currentUser;
    if (user) {
        updateProfile(user, { displayName: newUsername }).then(() => {
            // Update profile in Firebase Realtime Database
            set(ref(database, 'users/' + userId), {
                username: newUsername,
                email: newEmail
            }).then(() => {
                messageElement.textContent = 'Profile updated successfully!';
            }).catch((error) => {
                console.error('Error updating profile:', error);
                messageElement.textContent = 'Error updating profile.';
            });
        }).catch((error) => {
            console.error('Error updating profile in Authentication:', error);
            messageElement.textContent = 'Error updating profile in Authentication.';
        });
    }
}

// Event listener for form submission
profileForm.addEventListener('submit', (event) => {
    event.preventDefault();
    const userId = auth.currentUser.uid;
    updateUserProfile(userId);
});

// Initialize authentication check on page load
checkAuth();
