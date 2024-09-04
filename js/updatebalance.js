// Import the functions you need from the Firebase SDK
import { initializeApp } from "firebase/app";
import { getDatabase, ref, get, update } from "firebase/database";

// Your web app's Firebase configuration
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
const database = getDatabase(app);

/**
 * Updates the balance for a given user.
 * @param {string} userId - The ID of the user whose balance is to be updated.
 * @param {number} amount - The amount to add or subtract from the user's balance.
 */
async function updateBalance(userId, amount) {
  try {
    // Reference to the user's balance in the database
    const userRef = ref(database, `users/${userId}/balance`);
    
    // Get the current balance
    const snapshot = await get(userRef);
    if (snapshot.exists()) {
      let currentBalance = snapshot.val();
      let newBalance = currentBalance + amount;
      
      // Update the balance in the database
      await update(userRef, newBalance);
      console.log(`Balance for user ${userId} updated to ${newBalance}`);
    } else {
      console.log("No data available for the given user ID.");
    }
  } catch (error) {
    console.error("Error updating balance:", error);
  }
}

// Example usage
// updateBalance("user123", 50); // This would add 50 to user123's balance
// updateBalance("user456", -10); // This would subtract 10 from user456's balance
