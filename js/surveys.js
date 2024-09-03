import { getDatabase, ref, set, update, get } from 'https://www.gstatic.com/firebasejs/9.22.0/firebase-database.js';
import { getAuth, onAuthStateChanged } from 'https://www.gstatic.com/firebasejs/9.22.0/firebase-auth.js';
import { initializeApp } from 'https://www.gstatic.com/firebasejs/9.22.0/firebase-app.js';

// Your web app's Firebase configuration
const firebaseConfig = {
    apiKey: 'AIzaSyA7GP-4bnijUNXGBti2nCOJF9iwusuL7c4',
    authDomain: 'real-surveys.firebaseapp.com',
    databaseURL: 'https://real-surveys-default-rtdb.firebaseio.com',
    projectId: 'real-surveys',
    storageBucket: 'real-surveys.appspot.com',
    messagingSenderId: '1024139519354',
    appId: '1:1024139519354:web:a0b11a5a0560ab02ee22c3'
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getDatabase(app);
const auth = getAuth(app);
const usersRef = ref(db, 'users');  // Reference to the 'users' node in your Firebase Realtime Database

// Check authentication state
let userId = null;
onAuthStateChanged(auth, (user) => {
    if (user) {
        userId = user.uid;  // Get the authenticated user's ID
    } else {
        // Redirect to login if no user is authenticated
        window.location.href = 'login.html';
    }
});

// Survey navigation
let currentQuestion = 1;

document.getElementById('nextButton').addEventListener('click', () => {
    console.log('Next Button Clicked');
    if (currentQuestion < 5) {
        document.querySelector(`.survey-question[data-question="${currentQuestion}"]`).classList.remove('active');
        currentQuestion++;
        document.querySelector(`.survey-question[data-question="${currentQuestion}"]`).classList.add('active');
        document.getElementById('prevButton').style.display = 'inline-block';
        if (currentQuestion === 5) {
            document.getElementById('nextButton').style.display = 'none';
            document.getElementById('submitButton').style.display = 'inline-block';
        }
    }
});

document.getElementById('prevButton').addEventListener('click', () => {
    console.log('Previous Button Clicked');
    if (currentQuestion > 1) {
        document.querySelector(`.survey-question[data-question="${currentQuestion}"]`).classList.remove('active');
        currentQuestion--;
        document.querySelector(`.survey-question[data-question="${currentQuestion}"]`).classList.add('active');
        document.getElementById('nextButton').style.display = 'inline-block';
        document.getElementById('submitButton').style.display = 'none';
        if (currentQuestion === 1) {
            document.getElementById('prevButton').style.display = 'none';
        }
    }
});

// Form submission
document.getElementById('surveyForm').addEventListener('submit', async (event) => {
    event.preventDefault();

    // Check if user is logged in
    if (!userId) {
        alert('User is not authenticated.');
        return;
    }

    // Handle form submission
    const answers = {
        q1: document.querySelector('input[name="q1"]:checked')?.value,
        q2: document.querySelector('input[name="q2"]:checked')?.value,
        q3: document.querySelector('input[name="q3"]:checked')?.value,
        q4: document.querySelector('input[name="q4"]:checked')?.value,
        q5: document.querySelector('textarea[name="q5"]').value
    };

    if (Object.values(answers).every(answer => answer || answer === "")) {  // Handle empty answers for textarea
        try {
            // Update user's balance in Firebase
            const userSnapshot = await get(ref(usersRef, userId));
            const userData = userSnapshot.val();
            const currentBalance = userData?.balance || 0;
            const newBalance = currentBalance + 10;  // Reward amount

            await update(ref(usersRef, userId), { balance: newBalance });
            alert('Survey completed! Your balance has been updated.');
            window.location.href = 'reward.html';  // Redirect to reward page
        } catch (error) {
            console.error('Error updating balance:', error);
        }
    } else {
        alert('Please answer all questions before submitting.');
    }
});
