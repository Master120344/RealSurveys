// Import required packages
const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const admin = require('firebase-admin');
const Stripe = require('stripe');
require('dotenv').config(); // Load environment variables

// Initialize Firebase Admin SDK
const serviceAccount = require('./path/to/your/firebase-service-account.json'); // Adjust the path accordingly

admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    databaseURL: process.env.FIREBASE_DATABASE_URL // Use environment variable
});

const db = admin.database();
const usersRef = db.ref('users');

// Initialize Stripe with secret key from environment variables
const stripe = Stripe(process.env.STRIPE_SECRET_KEY);

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
        const userSnapshot = await usersRef.child(userId).once('value');
        const userData = userSnapshot.val();
        const currentBalance = userData?.balance || 0;
        const newBalance = currentBalance + 10;

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
