// js/firebase-config.js
import { initializeApp } from 'https://www.gstatic.com/firebasejs/9.22.0/firebase-app.js';
import {
    getAuth,
    signInWithEmailAndPassword,
    createUserWithEmailAndPassword,
    onAuthStateChanged as onAuthStateChangedFn,
    signOut,
    sendPasswordResetEmail
} from 'https://www.gstatic.com/firebasejs/9.22.0/firebase-auth.js';
import {
    getFirestore,
    doc,
    setDoc,
    getDoc
} from 'https://www.gstatic.com/firebasejs/9.22.0/firebase-firestore.js';

// Import the configuration from your env.js file
import { firebaseConfig } from './env.js';

let app, auth, db;

try {
    app = initializeApp(firebaseConfig);
} catch (error) {
    console.error('FATAL: Failed to initialize Firebase app:', error);
    throw error;
}

try {
    auth = getAuth(app);
} catch (error) {
    console.error('ERROR: Failed to initialize Firebase Auth:', error);
    auth = null;
}

try {
    db = getFirestore(app);
} catch (error) {
    console.error('ERROR: Failed to initialize Firebase Firestore:', error);
    db = null;
}

// This function is renamed to signInWithEmailAndPassword to avoid conflicts with the import
function signIn(email, password) {
    if (!auth) return Promise.reject(new Error('Authentication service not available.'));
    return signInWithEmailAndPassword(auth, email, password);
}

function signOutUser() {
    if (!auth) return Promise.reject(new Error('Authentication service not available.'));
    return signOut(auth);
}

function onAuthStateChanged(callback) {
    if (!auth) {
        try {
            callback(null);
        } catch (e) {
            console.error("Error executing onAuthStateChanged callback with null user:", e);
        }
        return () => {};
    }
    return onAuthStateChangedFn(auth, callback);
}

async function writeUserData(userId, name, email) {
    if (!db) throw new Error('Database service not available.');
    if (!userId) throw new Error('User ID is required to write user data.');
    try {
        await setDoc(doc(db, 'users', userId), {
            username: name,
            email: email,
            balance: 0
        }, { merge: true });
    } catch (error) {
        console.error('Error writing user data for:', userId, error);
        throw error;
    }
}

async function readUserData(userId) {
    if (!db) throw new Error('Database service not available.');
    if (!userId) throw new Error('User ID is required to read user data.');
    try {
        const userDocRef = doc(db, 'users', userId);
        const docSnap = await getDoc(userDocRef);
        return docSnap.exists() ? docSnap.data() : null;
    } catch (error) {
        console.error('Error reading user data for:', userId, error);
        throw error;
    }
}

// Export all the functions needed by other parts of your application
export {
    auth,
    db,
    signIn, // Export our custom signIn function
    signOutUser,
    onAuthStateChanged,
    writeUserData,
    readUserData,
    sendPasswordResetEmail,
    createUserWithEmailAndPassword,
    doc,
    getDoc,
    setDoc
};