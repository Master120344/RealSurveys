// Initialize Stripe with your public key
const stripe = Stripe('pk_live_51PGUR0P8M9Pgb8qZmxBX8zhH2i9ZhtSP9RNGmD1dgbsPDiW0zDcmRnNxVACAcBLzhz12YlKLMv9BvMrTUF69YlWS002ZqQ9Pey');
const elements = stripe.elements();

// Create an instance of the card Element
const card = elements.create('card');
card.mount('#card-element');

const step1 = document.getElementById('cashout-step-1');
const step2 = document.getElementById('cashout-step-2');
const step3 = document.getElementById('cashout-step-3');
const cashoutBtn = document.getElementById('cashout-btn');
const form = document.getElementById('payment-form');
const cardErrors = document.getElementById('card-errors');
const confirmationMessage = document.getElementById('confirmation-message');

// Cash out button click event
cashoutBtn.addEventListener('click', async () => {
    const amount = parseFloat(document.getElementById('cashout-amount').value);
    if (!isNaN(amount) && amount > 0) {
        const currentBalance = parseFloat(document.getElementById('current-balance').innerText.replace('$', ''));
        if (amount <= currentBalance) {
            // Proceed to payment step
            step1.classList.add('hidden');
            step2.classList.remove('hidden');
        } else {
            alert('Insufficient balance.');
        }
    } else {
        alert('Please enter a valid amount.');
    }
});

// Payment form submission
form.addEventListener('submit', async (event) => {
    event.preventDefault();

    const amount = parseFloat(document.getElementById('cashout-amount').value) * 100; // Convert to cents

    try {
        // Create a payment intent
        const response = await fetch('/create-payment-intent', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ amount }),
        });

        if (!response.ok) {
            throw new Error('Network response was not ok');
        }

        const { clientSecret } = await response.json();

        // Confirm the payment
        const { error } = await stripe.confirmCardPayment(clientSecret, {
            payment_method: {
                card: card,
            }
        });

        if (error) {
            cardErrors.textContent = error.message;
        } else {
            cardErrors.textContent = '';
            step2.classList.add('hidden');
            step3.classList.remove('hidden');
            confirmationMessage.textContent = `Congratulations! Your payment of $${(amount / 100).toFixed(2)} is on its way. Your new balance will be updated shortly.`;

            // Update user's balance in Firebase
            updateBalance(amount / 100);
        }
    } catch (error) {
        console.error('Error during payment:', error);
        cardErrors.textContent = 'An error occurred. Please try again.';
    }
});

// Function to update user's balance in Firebase
async function updateBalance(amount) {
    const user = firebase.auth().currentUser;
    if (user) {
        const userId = user.uid;
        const userRef = firebase.database().ref('users/' + userId);

        try {
            const snapshot = await userRef.once('value');
            if (snapshot.exists()) {
                const currentBalance = snapshot.val().balance;
                const newBalance = currentBalance - amount;
                await userRef.update({ balance: newBalance });
                console.log('Balance updated successfully.');
            }
        } catch (error) {
            console.error('Error fetching or updating user data:', error);
        }
    } else {
        console.error('No user is currently authenticated.');
    }
}
