// js/firebase-config.js
console.log('firebase-config.js starting...');

import { initializeApp } from 'https://www.gstatic.com/firebasejs/9.22.0/firebase-app.js';
import {
    getAuth,
    signInWithEmailAndPassword,
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

const firebaseConfig = {
    apiKey: 'AIzaSyA7GP-4bnijUNXGBti2nCOJF9iwusuL7c4', // Replace with your actual key
    authDomain: 'real-surveys.firebaseapp.com',
    projectId: 'real-surveys',
    storageBucket: 'real-surveys.appspot.com',
    messagingSenderId: '1024139519354',
    appId: '1:1024139519354:web:a0b11a5a0560ab02ee22c3'
};

let app, auth, db;

try {
    app = initializeApp(firebaseConfig);
    console.log('Firebase app initialized successfully.');
} catch (error) {
    console.error('FATAL: Failed to initialize Firebase app:', error);
    // If app fails, subsequent getAuth/getFirestore will likely fail too.
    // No good way to recover here, page functionality reliant on Firebase will break.
    throw error; // Prevent further execution of this script if core init fails
}

try {
    auth = getAuth(app);
    console.log('Firebase Auth initialized successfully.');
} catch (error) {
    console.error('ERROR: Failed to initialize Firebase Auth:', error);
    auth = null; // Ensure auth is null if init fails
}

try {
    db = getFirestore(app);
    console.log('Firebase Firestore initialized successfully.');
} catch (error) {
    console.error('ERROR: Failed to initialize Firebase Firestore:', error);
    db = null; // Ensure db is null if init fails
}

function signIn(email, password) {
    if (!auth) {
        console.error('signIn failed: auth object is null.');
        return Promise.reject(new Error('Authentication service not available.'));
    }
    console.log('Attempting sign in for:', email);
    return signInWithEmailAndPassword(auth, email, password); // Return the promise
}

function signOutUser() {
    if (!auth) {
        console.error('signOutUser failed: auth object is null.');
        return Promise.reject(new Error('Authentication service not available.'));
    }
    console.log('Attempting sign out.');
    return signOut(auth);
}

function onAuthStateChanged(callback) {
    if (!auth) {
         console.error('onAuthStateChanged setup failed: auth object is null.');
         // Immediately invoke callback with null since auth isn't ready
         try {
             callback(null);
         } catch (e) {
             console.error("Error executing onAuthStateChanged callback with null user:", e);
         }
         return () => {}; // Return a no-op unsubscribe function
    }
    console.log('Setting up onAuthStateChanged listener.');
    return onAuthStateChangedFn(auth, callback); // Return the actual unsubscribe function
}

async function writeUserData(userId, name, email) {
    if (!db) {
        console.error('writeUserData failed: db object is null.');
        throw new Error('Database service not available.');
    }
    if (!userId) {
        console.error('writeUserData failed: userId is missing.');
        throw new Error('User ID is required to write user data.');
    }
    console.log('Attempting to write user data for:', userId);
    try {
        await setDoc(doc(db, 'users', userId), {
            username: name,
            email: email,
            balance: 0 // Ensure balance is initialized as number
        }, { merge: true }); // Merge is often safer for updates
        console.log('User data written successfully for:', userId);
    } catch (error) {
        console.error('Error writing user data for:', userId, error);
        throw error; // Re-throw error to be handled by caller
    }
}

async function readUserData(userId) {
    if (!db) {
        console.error('readUserData failed: db object is null.');
        throw new Error('Database service not available.');
    }
    if (!userId) {
        console.error('readUserData failed: userId is missing.');
        throw new Error('User ID is required to read user data.');
    }
    console.log('Attempting to read user data for:', userId);
    try {
        const userDocRef = doc(db, 'users', userId);
        const docSnap = await getDoc(userDocRef);
        if (docSnap.exists()) {
            console.log('User data retrieved successfully for:', userId);
            return docSnap.data();
        } else {
            console.warn('No user document found for:', userId);
            return null; // Return null instead of throwing error for non-existent doc
        }
    } catch (error) {
        console.error('Error reading user data for:', userId, error);
        throw error; // Re-throw error to be handled by caller
    }
}

// Export the necessary objects and functions
export {
    auth,
    db,
    signIn,
    signOutUser,
    onAuthStateChanged,
    writeUserData,
    readUserData,
    sendPasswordResetEmail,
    doc,
    getDoc,
    setDoc
};

console.log('firebase-config.js finished execution.');