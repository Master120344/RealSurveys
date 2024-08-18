// balance.js

// Import the necessary Firebase modules
import { getDatabase, ref, onValue, update } from 'https://www.gstatic.com/firebasejs/9.22.0/firebase-database.js';
import { initializeApp } from 'https://www.gstatic.com/firebasejs/9.22.0/firebase-app.js';

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: 'AIzaSyA7GP-4bnijUNXGBti2nCOJF9iwusuL7c4',
  authDomain: 'real-surveys.firebaseapp.com',
  databaseURL: 'https://real-surveys-default-rtdb.firebaseio.com',
  projectId: 'real-surveys',
  storageBucket: 'real-surveys.appspot.com',
  messagingSenderId: '1024139519354',
  appId: '1:1024139519354:web:a0b11a5a0560ab02ee22c3'
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const database = getDatabase(app);

// Function to fetch user balance
function fetchUserBalance(userId) {
  const userBalanceRef = ref(database, 'users/' + userId + '/balance');
  onValue(userBalanceRef, (snapshot) => {
    const balance = snapshot.val();
    document.querySelector('.balance-amount').textContent = `$${balance.toFixed(2)}`;
  });
}

// Function to handle cash out
function handleCashOut(userId, amount) {
  const userBalanceRef = ref(database, 'users/' + userId + '/balance');
  onValue(userBalanceRef, (snapshot) => {
    const currentBalance = snapshot.val();
    if (amount <= currentBalance) {
      update(userBalanceRef, {
        balance: currentBalance - amount
      }).then(() => {
        alert('Cash out successful!');
        document.querySelector('.balance-amount').textContent = `$${(currentBalance - amount).toFixed(2)}`;
      }).catch((error) => {
        console.error('Error processing cash out:', error);
        alert('Error processing cash out. Please try again.');
      });
    } else {
      alert('Insufficient balance.');
    }
  });
}

// Event listener for the cash out button
document.addEventListener('DOMContentLoaded', () => {
  const userId = 'user123'; // Replace with the actual user ID
  fetchUserBalance(userId);

  document.querySelector('.cashout-btn').addEventListener('click', () => {
    const cashoutAmount = parseFloat(document.querySelector('#cashout-amount').value);
    if (isNaN(cashoutAmount) || cashoutAmount <= 0) {
      alert('Please enter a valid amount.');
      return;
    }
    handleCashOut(userId, cashoutAmount);
  });
});
