const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const admin = require('firebase-admin');
const Stripe = require('stripe');
const nodemailer = require('nodemailer'); // For sending emails
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

// Initialize Nodemailer transporter
const transporter = nodemailer.createTransport({
    service: 'gmail', // Use Gmail or another email service provider
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
    }
});

// Initialize Express app
const app = express();
const port = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(bodyParser.json());

// Authentication middleware
async function authenticateToken(req, res, next) {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (token == null) return res.sendStatus(401);

    try {
        const decodedToken = await admin.auth().verifyIdToken(token);
        req.user = decodedToken;
        next();
    } catch (error) {
        res.sendStatus(403); // Forbidden
    }
}

// Serve static HTML for surveys
app.use('/surveys', authenticateToken, express.static('public/surveys.html'));

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
    const { email, surveyAnswers } = req.body;

    try {
        // Send email with survey data
        const mailOptions = {
            from: process.env.EMAIL_USER,
            to: 'realsurveydata@gmail.com', // The recipient email address
            subject: 'New Survey Submission',
            text: `Survey completed by: ${email}\n\nAnswers:\n${surveyAnswers.join('\n')}`
        };

        await transporter.sendMail(mailOptions);

        res.json({ success: true });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Start the server
app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});
