// Import Firebase modules
import { getDatabase, ref, get, update } from 'https://www.gstatic.com/firebasejs/9.22.0/firebase-database.js';
import { getAuth, initializeApp } from 'https://www.gstatic.com/firebasejs/9.22.0/firebase-auth.js';

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

/**
 * Fetches the current balance of the authenticated user.
 * @returns {Promise<number>} The current balance of the user.
 */
async function getUserBalance() {
    const user = auth.currentUser;
    if (user) {
        const userId = user.uid;
        const userRef = ref(db, 'users/' + userId + '/balance');
        try {
            const snapshot = await get(userRef);
            if (snapshot.exists()) {
                return snapshot.val();
            } else {
                console.error('User data not found.');
                return 0; // Default balance
            }
        } catch (error) {
            console.error('Error fetching user balance:', error);
            return 0; // Default balance on error
        }
    } else {
        console.error('No user is currently authenticated.');
        return 0; // Default balance when no user is authenticated
    }
}

/**
 * Updates the balance for the authenticated user.
 * @param {number} amount - The amount to add or subtract from the user’s balance.
 */
async function updateUserBalance(amount) {
    const user = auth.currentUser;
    if (user) {
        const userId = user.uid;
        const userRef = ref(db, 'users/' + userId);
        try {
            const snapshot = await get(userRef);
            if (snapshot.exists()) {
                const currentBalance = snapshot.val().balance || 0; // Default to 0 if balance is undefined
                const newBalance = currentBalance + amount;
                await update(userRef, { balance: newBalance });
                console.log('Balance updated successfully.');
            } else {
                console.error('User data not found.');
            }
        } catch (error) {
            console.error('Error updating user balance:', error);
        }
    } else {
        console.error('No user is currently authenticated.');
    }
}

export { getUserBalance, updateUserBalance };
