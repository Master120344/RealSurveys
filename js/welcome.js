// Import necessary Firebase SDKs
import { getAuth, onAuthStateChanged } from 'https://www.gstatic.com/firebasejs/9.22.0/firebase-auth.js';
import { initializeApp } from 'https://www.gstatic.com/firebasejs/9.22.0/firebase-app.js';
import { getFirestore, doc, getDoc } from 'https://www.gstatic.com/firebasejs/9.22.0/firebase-firestore.js';

// Initialize Firebase
const firebaseConfig = {
    apiKey: 'AIzaSyA7GP-4bnijUNXGBti2nCOJF9iwusuL7c4',
    authDomain: 'real-surveys.firebaseapp.com',
    projectId: 'real-surveys',
    storageBucket: 'real-surveys.appspot.com',
    messagingSenderId: '1024139519354',
    appId: '1:1024139519354:web:a0b11a5a0560ab02ee22c3'
};

let app;
try {
    app = initializeApp(firebaseConfig);
} catch (error) {
    console.error("Firebase initialization error:", error);
}

const auth = getAuth(app);
const db = getFirestore(app);

function displayUserDetails(user) {
    if (!user) {
        console.error("No user data provided to display.");
        return;
    }

    const emailElement = document.getElementById('email');
    const usernameElement = document.getElementById('username');
    const balanceElement = document.getElementById('balance');

    if (emailElement && usernameElement && balanceElement) {
        emailElement.innerText = `Email: ${user.email}`;

        // Fetch additional user data from Firestore (or another data source)
        const userDocRef = doc(db, "users", user.uid);
        getDoc(userDocRef).then((docSnap) => {
            if (docSnap.exists()) {
                const userData = docSnap.data();
                usernameElement.innerText = `Username: ${userData.username}`;
                balanceElement.innerText = `Balance: $${userData.balance.toFixed(2)}`;
            } else {
                console.log("No such user document!");
            }
        }).catch((error) => {
            console.error("Error fetching user data:", error);
        });
    } else {
        console.error("One or more user detail elements not found on the page.");
    }
}

onAuthStateChanged(auth, (user) => {
    if (user) {
        // User is signed in, display user details
        displayUserDetails(user);
    } else {
        // No user is signed in, redirect to login page
        window.location.href = 'login.html';
    }
});