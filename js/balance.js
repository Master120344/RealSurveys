import { auth, db, onAuthStateChanged, setupAuthUI } from './firebase-config.js';
import { getFirestore, doc, updateDoc } from 'https://www.gstatic.com/firebasejs/9.22.0/firebase-firestore.js';

const stripe = Stripe('YOUR_STRIPE_PUBLISHABLE_KEY'); // Replace with your Stripe publishable key
const elements = stripe.elements();
let cardElement;

// AOS Initialization
AOS.init({ duration: 1000, once: true });

// Particles.js for Header Background
particlesJS('particles-js', {
    particles: {
        number: { value: 60, density: { enable: true, value_area: 800 } },
        color: { value: '#66bb6a' },
        shape: { type: 'circle' },
        opacity: { value: 0.5, random: true },
        size: { value: 3, random: true },
        line_linked: { enable: true, distance: 120, color: '#66bb6a', opacity: 0.3, width: 1 },
        move: { enable: true, speed: 2, direction: 'none', random: false }
    },
    interactivity: {
        detect_on: 'canvas',
        events: { onhover: { enable: true, mode: 'repulse' }, onclick: { enable: true, mode: 'push' } },
        modes: { repulse: { distance: 80 }, push: { particles_nb: 3 } }
    },
    retina_detect: true
});

// Theme Toggle
document.getElementById('theme-toggle').addEventListener('click', () => {
    document.body.classList.toggle('light-mode');
    document.getElementById('theme-toggle').innerHTML = document.body.classList.contains('light-mode') 
        ? '<i class="fas fa-sun"></i>' 
        : '<i class="fas fa-moon"></i>';
});

// Navigation Buttons
document.querySelectorAll('.nav-btn:not(#logout-btn)').forEach(button => {
    button.addEventListener('click', () => {
        window.location.href = button.getAttribute('data-href');
    });
});

// Authentication and Balance Logic
document.addEventListener('DOMContentLoaded', () => {
    setupAuthUI('user-menu', 'login-link', 'user-email', 'logout-btn');

    const currentBalanceSpan = document.getElementById('current-balance');
    const cashoutAmountInput = document.getElementById('cashout-amount');
    const netAmountSpan = document.getElementById('net-amount');
    const cashoutBtn = document.getElementById('cashout-btn');
    const paymentForm = document.getElementById('payment-form');

    // Setup Stripe Elements
    cardElement = elements.create('card', {
        style: {
            base: {
                color: '#e0e0e0',
                fontFamily: '"Poppins", sans-serif',
                fontSize: '16px',
                '::placeholder': { color: '#b0b0b5' }
            }
        }
    });
    cardElement.mount('#card-element');

    onAuthStateChanged(async (user) => {
        if (user) {
            try {
                const userDoc = await getDoc(doc(db, 'users', user.uid));
                const balance = userDoc.exists() && userDoc.data().balance !== undefined ? userDoc.data().balance : 0;
                currentBalanceSpan.textContent = `$${balance.toFixed(2)}`;
            } catch (error) {
                console.error('Error fetching balance:', error);
            }
        }
    });

    // Calculate Net Amount
    cashoutAmountInput.addEventListener('input', () => {
        const amount = parseFloat(cashoutAmountInput.value);
        if (!isNaN(amount) && amount >= 1) {
            const netAmount = amount * 0.9; // 10% fee
            netAmountSpan.textContent = `You’ll receive: $${netAmount.toFixed(2)}`;
        } else {
            netAmountSpan.textContent = '';
        }
    });

    // Cashout Step 1
    cashoutBtn.addEventListener('click', async () => {
        const amount = parseFloat(cashoutAmountInput.value);
        const currentBalance = parseFloat(currentBalanceSpan.textContent.replace('$', ''));
        if (!isNaN(amount) && amount >= 1 && amount <= currentBalance) {
            document.getElementById('cashout-step-1').classList.add('hidden');
            document.getElementById('cashout-step-2').classList.remove('hidden');
        } else {
            alert(amount < 1 ? 'Minimum cashout is $1.' : 'Insufficient balance.');
        }
    });

    // Cashout Step 2
    paymentForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const amount = parseFloat(cashoutAmountInput.value);
        const user = auth.currentUser;
        if (!user) return;

        const { token, error } = await stripe.createToken(cardElement);
        if (error) {
            document.getElementById('card-errors').textContent = error.message;
        } else {
            try {
                const newBalance = parseFloat(currentBalanceSpan.textContent.replace('$', '')) - amount;
                await updateDoc(doc(db, 'users', user.uid), { balance: newBalance });
                currentBalanceSpan.textContent = `$${newBalance.toFixed(2)}`;
                document.getElementById('confirmation-message').textContent = 'Cashout processing...';
                document.getElementById('cashout-step-2').classList.add('hidden');
                document.getElementById('cashout-step-3').classList.remove('hidden');
                setTimeout(() => window.location.href = 'surveys.html', 3000);
            } catch (error) {
                console.error('Error updating balance:', error);
                alert('Cashout failed.');
            }
        }
    });
});