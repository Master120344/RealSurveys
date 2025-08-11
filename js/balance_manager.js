// js/balance-manager.js
import { db } from './firebase-config.js';
import { doc, getDoc, updateDoc } from 'https://www.gstatic.com/firebasejs/9.22.0/firebase-firestore.js';

/**
 * Update the user's balance in Firestore.
 * @param {string} userId - The ID of the user.
 * @param {number} amount - The new balance amount.
 */
async function updateUserBalance(userId, amount) {
    const userRef = doc(db, 'users', userId);
    try {
        await updateDoc(userRef, { balance: amount });
        console.log('Balance updated successfully.');
    } catch (error) {
        console.error('Error updating balance:', error);
        throw error;
    }
}

/**
 * Retrieve the user's current balance from Firestore.
 * @param {string} userId - The ID of the user.
 * @returns {Promise<number>} - The user's current balance.
 */
async function getUserBalance(userId) {
    const userRef = doc(db, 'users', userId);
    try {
        const docSnap = await getDoc(userRef);
        if (docSnap.exists() && docSnap.data().balance !== undefined) {
            return docSnap.data().balance;
        } else {
            console.warn('No balance data available');
            return 0;
        }
    } catch (error) {
        console.error('Error retrieving balance:', error);
        throw error;
    }
}

export { updateUserBalance, getUserBalance };