// Firebase configuration
const firebaseConfig = {
    apiKey: "YOUR_API_KEY",
    authDomain: "YOUR_PROJECT_ID.firebaseapp.com",
    databaseURL: "https://YOUR_PROJECT_ID.firebaseio.com",
    projectId: "YOUR_PROJECT_ID",
    storageBucket: "YOUR_PROJECT_ID.appspot.com",
    messagingSenderId: "YOUR_SENDER_ID",
    appId: "YOUR_APP_ID"
};

// Initialize Firebase
firebase.initializeApp(firebaseConfig);

// Reference to the Firebase database
const db = firebase.database();
const usersRef = db.ref('users');  // Reference to the 'users' node in your Firebase Realtime Database

// Survey navigation
let currentQuestion = 1;

document.getElementById('nextButton').addEventListener('click', () => {
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
document.getElementById('mcdonaldsSurveyForm').addEventListener('submit', (event) => {
    event.preventDefault();
    
    // Get user ID (this could come from user authentication or local storage)
    const userId = 'exampleUserId';  // Replace with actual user ID

    // Handle form submission
    const answers = {
        q1: document.querySelector('input[name="q1"]:checked')?.value,
        q2: document.querySelector('input[name="q2"]:checked')?.value,
        q3: document.querySelector('input[name="q3"]:checked')?.value,
        q4: document.querySelector('input[name="q4"]:checked')?.value,
        q5: document.querySelector('textarea[name="q5"]').value  // Note: Changed to textarea
    };

    if (Object.values(answers).every(answer => answer || answer === "")) {  // Handle empty answers for textarea
        // Update user's balance in Firebase
        usersRef.child(userId).once('value').then(snapshot => {
            const userData = snapshot.val();
            const currentBalance = userData?.balance || 0;
            const newBalance = currentBalance + 10;  // Reward amount

            usersRef.child(userId).update({ balance: newBalance }).then(() => {
                alert('Survey completed! Your balance has been updated.');
                window.location.href = 'reward.html';  // Redirect to reward page
            }).catch(error => {
                console.error('Error updating balance:', error);
            });
        }).catch(error => {
            console.error('Error fetching user data:', error);
        });
    } else {
        alert('Please answer all questions before submitting.');
    }
});
