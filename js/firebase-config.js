// js/firebase-config.js
import { initializeApp } from 'https://www.gstatic.com/firebasejs/9.22.0/firebase-app.js';
import {
    getAuth,
    signInWithEmailAndPassword,
    sendPasswordResetEmail
} from 'https://www.gstatic.com/firebasejs/9.22.0/firebase-auth.js';
import { getFirestore } from 'https://www.gstatic.com/firebasejs/9.22.0/firebase-firestore.js';

// Import the configuration from your env.js file
import { firebaseConfig } from './env.js';

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

// Custom sign-in function for the login page to use
function signIn(email, password) {
    return signInWithEmailAndPassword(auth, email, password);
}

// Export only what the login page needs to eliminate errors
export {
    auth,
    signIn,
    sendPasswordResetEmail
};