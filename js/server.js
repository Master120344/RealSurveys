// server.js

const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const admin = require('firebase-admin');
const Stripe = require('stripe');

// Initialize Firebase Admin SDK
const serviceAccount = require('./path/to/your/firebase-service-account.json'); // Adjust the path accordingly

admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    databaseURL: 'https://real-surveys-default-rtdb.firebaseio.com'  // Use your actual database URL
});

const db = admin.database();
const usersRef = db.ref('users');

// Initialize Stripe
const stripe = Stripe('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'); // Your Stripe secret key

// Initialize Express app
const app = express();
const port = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(bodyParser.json());

// Route to create payment intent
app.post('/create-payment-intent', async (req, res) => {
    const { amount } = req.body;

    try {
        const paymentIntent = await stripe.paymentIntents.create({
            amount,
            currency: 'usd',
            // You can add more options here, like description, etc.
        });
        res.json({ clientSecret: paymentIntent.client_secret });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Route to handle survey completion
app.post('/complete-survey', async (req, res) => {
    const { userId, surveyAnswers } = req.body;

    try {
        // Handle survey logic here
        const userSnapshot = await usersRef.child(userId).once('value');
        const userData = userSnapshot.val();
        const currentBalance = userData?.balance || 0;
        const newBalance = currentBalance + 10; // Reward amount

        await usersRef.child(userId).update({ balance: newBalance });
        res.json({ message: 'Survey completed and balance updated!' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Start server
app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});
