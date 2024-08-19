// balance.js

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

// Stripe Elements setup
const stripe = Stripe('pk_live_51PGUR0P8M9Pgb8qZmxBX8zhH2i9ZhtSP9RNGmD1dgbsPDiW0zDcmRnNxVACAcBLzhz12YlKLMv9BvMrTUF69YlWS002ZqQ9Pey'); // Your Stripe publishable key

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

  // Handle payment form submission
  const paymentForm = document.getElementById('payment-form');
  const payButton = document.getElementById('pay-button');

  paymentForm.addEventListener('submit', async (event) => {
    event.preventDefault();
    const amount = 2000; // Amount to be paid in cents ($20.00)

    try {
      const response = await fetch('/create-payment-intent', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ amount })
      });
      const { clientSecret } = await response.json();

      const result = await stripe.confirmCardPayment(clientSecret, {
        payment_method: {
          card: cardElement, // Replace with your actual card element
        }
      });

      if (result.error) {
        console.error(result.error.message);
        alert('Payment failed. Please try again.');
      } else if (result.paymentIntent.status === 'succeeded') {
        alert('Payment successful!');
        // Additional logic after successful payment
      }
    } catch (error) {
      console.error('Error processing payment:', error);
      alert('Error processing payment. Please try again.');
    }
  });
});
