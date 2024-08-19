// js/server.js

const express = require('express');
const bodyParser = require('body-parser');
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const admin = require('firebase-admin');
const serviceAccount = require('./path-to-your-firebase-adminsdk.json'); // Update with the correct path

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: 'https://real-surveys-default-rtdb.firebaseio.com'
});

const app = express();
const port = process.env.PORT || 3000;

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Endpoint to get user balance
app.get('/api/balance/:userId', async (req, res) => {
  const userId = req.params.userId;
  const db = admin.database();
  const userRef = db.ref('users/' + userId + '/balance');

  try {
    const snapshot = await userRef.once('value');
    const balance = snapshot.val();
    res.json({ balance });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Endpoint to handle cash out
app.post('/api/cashout', async (req, res) => {
  const { userId, amount } = req.body;
  const db = admin.database();
  const userRef = db.ref('users/' + userId + '/balance');

  try {
    const snapshot = await userRef.once('value');
    const currentBalance = snapshot.val();

    if (amount <= currentBalance) {
      await userRef.update({ balance: currentBalance - amount });
      res.json({ success: true });
    } else {
      res.status(400).json({ error: 'Insufficient balance' });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
