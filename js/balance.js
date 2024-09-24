import { initializeApp } from "https://www.gstatic.com/firebasejs/9.22.0/firebase-app.js";
import { getAuth, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/9.22.0/firebase-auth.js";
import { getDatabase, ref, get, update } from "https://www.gstatic.com/firebasejs/9.22.0/firebase-database.js";

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

const app = initializeApp(firebaseConfig);
const db = getDatabase(app);
const auth = getAuth(app);

const stripe = Stripe('YOUR_STRIPE_PUBLISHABLE_KEY'); // Replace with your actual Stripe key
const elements = stripe.elements();
let cardElement;

function setupStripe() {
    cardElement = elements.create('card');
    cardElement.mount('#card-element');
}

onAuthStateChanged(auth, (user) => {
    if (!user) {
        window.location.href = 'login.html';
    } else {
        const userId = user.uid;
        const userRef = ref(db, 'users/' + userId);
        get(userRef).then((snapshot) => {
            if (snapshot.exists()) {
                const userData = snapshot.val();
                document.getElementById('current-balance').innerText = `$${userData.balance.toFixed(2)}`;
            } else {
                console.error("No user data found.");
            }
        }).catch((error) => {
            console.error("Error fetching user data: ", error);
        });
    }
});

window.addEventListener('load', setupStripe);

function calculateNetAmount() {
    const amount = parseFloat(document.getElementById('cashout-amount').value);
    if (!isNaN(amount)) {
        const netAmount = amount * 0.9;
        document.getElementById('net-amount').innerText = `You will receive: $${netAmount.toFixed(2)}`;
    } else {
        document.getElementById('net-amount').innerText = '';
    }
}

document.getElementById('cashout-btn').addEventListener('click', function() {
    const amount = parseFloat(document.getElementById('cashout-amount').value);
    if (!isNaN(amount) && amount > 0) {
        const currentBalance = parseFloat(document.getElementById('current-balance').innerText.replace('$', ''));
        if (amount <= currentBalance) {
            document.getElementById('current-balance').innerText = `$${(currentBalance - amount).toFixed(2)}`;
            document.getElementById('cashout-step-1').classList.add('hidden');
            document.getElementById('cashout-step-2').classList.remove('hidden');
        } else {
            alert('Insufficient balance.');
        }
    } else {
        alert('Please enter a valid amount.');
    }
});

document.getElementById('payment-form').addEventListener('submit', async (event) => {
    event.preventDefault();
    const {token, error} = await stripe.createToken(cardElement);
    if (error) {
        document.getElementById('card-errors').textContent = error.message;
    } else {
        document.getElementById('confirmation-message').innerText = 'Processing your cashout request...';
        document.getElementById('cashout-step-2').classList.add('hidden');
        document.getElementById('cashout-step-3').classList.remove('hidden');
    }
});
