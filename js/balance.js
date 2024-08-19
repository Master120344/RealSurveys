// Initialize Stripe with your public key
const stripe = Stripe('YOUR_STRIPE_PUBLISHABLE_KEY');
const elements = stripe.elements();

// Create an instance of the card Element
const card = elements.create('card');
card.mount('#card-element');

// Handle form submission
const form = document.getElementById('payment-form');
const cardErrors = document.getElementById('card-errors');

form.addEventListener('submit', async (event) => {
    event.preventDefault();

    // Create a payment intent
    const response = await fetch('/create-payment-intent', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            amount: document.getElementById('cashout-amount').value * 100, // Convert to cents
        }),
    });

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
        alert('Payment successful!');
    }
});
