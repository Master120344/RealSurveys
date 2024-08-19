// balance.js

import { getDatabase, ref, onValue, update } from 'https://www.gstatic.com/firebasejs/9.22.0/firebase-database.js';
import { initializeApp } from 'https://www.gstatic.com/firebasejs/9.22.0/firebase-app.js';

const firebaseConfig = {
  apiKey: 'AIzaSyA7GP-4bnijUNXGBti2nCOJF9iwusuL7c4',
  authDomain: 'real-surveys.firebaseapp.com',
  databaseURL: 'https://real-surveys-default-rtdb.firebaseio.com',
  projectId: 'real-surveys',
  storageBucket: 'real-surveys.appspot.com',
  messagingSenderId: '1024139519354',
  appId: '1:1024139519354:web:a0b11a5a0560ab02ee22c3'
};

const app = initializeApp(firebaseConfig);
const database = getDatabase(app);

const stripe = Stripe('pk_live_51PGUR0P8M9Pgb8qZmxBX8zhH2i9ZhtSP9RNGmD1dgbsPDiW0zDcmRnNxVACAcBLzhz12YlKLMv9BvMrTUF69YlWS002ZqQ9Pey');

function fetchUserBalance(userId) {
  const userBalanceRef = ref(database, 'users/' + userId + '/balance');
  onValue(userBalanceRef, (snapshot) => {
    const balance = snapshot.val();
    document.querySelector('.balance-amount').textContent = `$${balance.toFixed(2)}`;
  });
}

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
      const data = await response.json();
      const clientSecret = data.clientSecret;

      const { error } = await stripe.confirmCardPayment(clientSecret, {
        payment_method: {
          card: {
            number: '4242424242424242',
            exp_month: 12,
            exp_year: 2024,
            cvc: '123'
          }
        }
      });

      if (error) {
        alert('Payment failed. Please try again.');
      } else {
        alert('Payment successful!');
      }
    } catch (error) {
      console.error('Error processing payment:', error);
      alert('Error processing payment. Please try again.');
    }
  });
});
