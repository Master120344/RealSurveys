// Import Firebase modules
import { getDatabase, ref, get } from 'https://www.gstatic.com/firebasejs/9.22.0/firebase-database.js';
import { getAuth } from 'https://www.gstatic.com/firebasejs/9.22.0/firebase-auth.js';
import { initializeApp } from 'https://www.gstatic.com/firebasejs/9.22.0/firebase-app.js';

// Firebase configuration
const firebaseConfig = {
    apiKey: "AIzaSyA7GP-4bnijUNXGBti2nCOJF9iwusuL7c4",
    authDomain: "real-surveys.firebaseapp.com",
    databaseURL: "https://real-surveys-default-rtdb.firebaseio.com",
    projectId: "real-surveys",
    storageBucket: "real-surveys.appspot.com",
    messagingSenderId: "1024139519354",
    appId: "1:1024139519354:web:a0b11a5a0560ab02ee22c3"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getDatabase(app);
const auth = getAuth(app);

// Update the balance on page load
window.addEventListener('load', async () => {
    const user = auth.currentUser;
    if (!user) {
        window.location.href = 'login.html';
        return;
    }
    const userId = user.uid;

    try {
        const userRef = ref(db, 'users/' + userId);
        const snapshot = await get(userRef);
        if (snapshot.exists()) {
            const userData = snapshot.val();
            document.getElementById('current-balance').innerText = `$${(userData.balance || 0).toFixed(2)}`;
        } else {
            console.error('User data not found.');
        }
    } catch (error) {
        console.error('Error fetching balance:', error);
    }
});
