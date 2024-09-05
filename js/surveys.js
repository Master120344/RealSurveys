// Import Firebase modules
import { getDatabase, ref, update, get } from 'https://www.gstatic.com/firebasejs/9.22.0/firebase-database.js';
import { getAuth } from 'https://www.gstatic.com/firebasejs/9.22.0/firebase-auth.js';
import { initializeApp } from 'https://www.gstatic.com/firebasejs/9.22.0/firebase-app.js';
import { firebaseConfig } from './firebase-config.js'; // Assuming firebase-config.js exports the config

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getDatabase(app);
const auth = getAuth(app);

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

    // Get user ID from authentication
    const user = auth.currentUser;
    if (!user) {
        alert('User not authenticated.');
        return;
    }
    const userId = user.uid;

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
            const userRef = ref(db, 'users/' + userId);
            const snapshot = await get(userRef);
            if (snapshot.exists()) {
                const userData = snapshot.val();
                const currentBalance = userData?.balance || 0;
                const newBalance = currentBalance + 10;  // Reward amount

                await update(userRef, { balance: newBalance });

                alert('Survey completed! Your balance has been updated.');
                window.location.href = 'balance.html';  // Redirect to balance page
            } else {
                console.error('User data not found.');
                alert('Failed to retrieve user data.');
            }
        } catch (error) {
            console.error('Error updating balance:', error);
            alert('An error occurred while updating your balance. Please try again.');
        }
    } else {
        alert('Please answer all questions before submitting.');
    }
});
