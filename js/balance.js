import { getDatabase, ref, update, get } from 'https://www.gstatic.com/firebasejs/9.22.0/firebase-database.js';
import { getAuth, initializeApp } from 'https://www.gstatic.com/firebasejs/9.22.0/firebase-auth.js';
import { Stripe } from 'https://js.stripe.com/v3/';

// Initialize Firebase
const firebaseConfig = {
    apiKey: "AIzaSyA7GP-4bnijUNXGBti2nCOJF9iwusuL7c4",
    authDomain: "real-surveys.firebaseapp.com",
    databaseURL: "https://real-surveys-default-rtdb.firebaseio.com",
    projectId: "real-surveys",
    storageBucket: "real-surveys.appspot.com",
    messagingSenderId: "1024139519354",
    appId: "1:1024139519354:web:a0b11a5a0560ab02ee22c3"
};

initializeApp(firebaseConfig);
const db = getDatabase();
const auth = getAuth();
const stripe = Stripe('pk_live_51PGUR0P8M9Pgb8qZmxBX8zhH2i9ZhtSP9RNGmD1dgbsPDiW0zDcmRnNxVACAcBLzhz12YlKLMv9BvMrTUF69YlWS002ZqQ9Pey');
const elements = stripe.elements();
const card = elements.create('card');
card.mount('#card-element');

// Event Listeners
document.getElementById('cashout-btn').addEventListener('click', validateAmount);
document.getElementById('payment-form').addEventListener('submit', handlePayment);

// Functions
async function validateAmount() {
    const amount = parseFloat(document.getElementById('cashout-amount').value);
    if (!isNaN(amount) && amount > 0) {
        const balance = parseFloat(document.getElementById('current-balance').innerText.replace('$', ''));
        if (amount <= balance) {
            toggleVisibility('cashout-step-1', 'cashout-step-2');
        } else {
            alert('Insufficient balance.');
        }
    } else {
        alert('Please enter a valid amount.');
    }
}

async function handlePayment(event) {
    event.preventDefault();
    const amount = parseFloat(document.getElementById('cashout-amount').value) * 100;

    try {
        const response = await fetch('/create-payment-intent', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ amount })
        });

        if (!response.ok) throw new Error('Network response was not ok');
        const { clientSecret } = await response.json();

        const { error } = await stripe.confirmCardPayment(clientSecret, { payment_method: { card } });
        if (error) {
            document.getElementById('card-errors').textContent = error.message;
        } else {
            document.getElementById('card-errors').textContent = '';
            toggleVisibility('cashout-step-2', 'cashout-step-3');
            document.getElementById('confirmation-message').textContent = `Congratulations! Your payment of $${(amount / 100).toFixed(2)} is on its way. Your new balance will be updated shortly.`;
            await updateBalance(amount / 100);
        }
    } catch (error) {
        console.error('Error during payment:', error);
        document.getElementById('card-errors').textContent = 'An error occurred. Please try again.';
    }
}

async function updateBalance(amount) {
    const user = auth.currentUser;
    if (user) {
        const userRef = ref(db, `users/${user.uid}`);
        try {
            const snapshot = await get(userRef);
            if (snapshot.exists()) {
                const newBalance = (snapshot.val().balance || 0) - amount;
                await update(userRef, { balance: newBalance });
                console.log('Balance updated successfully.');
            } else {
                console.error('User data not found.');
            }
        } catch (error) {
            console.error('Error fetching or updating user data:', error);
        }
    } else {
        console.error('No user is currently authenticated.');
    }
}

function toggleVisibility(hiddenId, visibleId) {
    document.getElementById(hiddenId).classList.add('hidden');
    document.getElementById(visibleId).classList.remove('hidden');
}
