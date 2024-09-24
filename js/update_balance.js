// Import the necessary Firebase modules
import { database, auth } from './firebase-config.js';
import { ref, get, update } from 'https://www.gstatic.com/firebasejs/9.22.0/firebase-database.js';
import { onAuthStateChanged } from 'https://www.gstatic.com/firebasejs/9.22.0/firebase-auth.js';

/**
 * Updates the balance for the currently authenticated user.
 * @param {number} amount - The amount to add or subtract from the user's balance.
 */
function updateBalance(amount) {
  onAuthStateChanged(auth, async (user) => {
    if (user) {
      const userId = user.uid;
      try {
        // Reference to the user's balance in the database
        const userRef = ref(database, `users/${userId}/balance`);
        
        // Get the current balance
        const snapshot = await get(userRef);
        if (snapshot.exists()) {
          let currentBalance = snapshot.val();
          let newBalance = currentBalance + amount;
          
          // Update the balance in the database
          await update(userRef, { balance: newBalance });
          console.log(`Balance for user ${userId} updated to ${newBalance}`);
        } else {
          console.log("No data available for the given user ID.");
          // Optionally initialize balance if it doesn't exist
          await update(userRef, { balance: amount });
          console.log(`Balance for user ${userId} initialized to ${amount}`);
        }
      } catch (error) {
        console.error("Error updating balance:", error);
      }
    } else {
      console.log("No user is currently signed in.");
    }
  });
}

// Example usage (commented out for production use)
// updateBalance(50); // This would add 50 to the currently logged-in user's balance
// updateBalance(-10); // This would subtract 10 from the currently logged-in user's balance

export { updateBalance };
