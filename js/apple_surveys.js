import { getAuth } from "https://www.gstatic.com/firebasejs/9.22.0/firebase-auth.js";
import { getDatabase, ref, get, update } from "https://www.gstatic.com/firebasejs/9.22.0/firebase-database.js";

// Initialize Firebase
const firebaseConfig = {
    apiKey: "AIzaSyA7GP-4bnijUNXGBti2nCOJF9iwusuL7c4",
    authDomain: "real-surveys.firebaseapp.com",
    databaseURL: "https://real-surveys-default-rtdb.firebaseio.com",
    projectId: "real-surveys",
    storageBucket: "real-surveys.appspot.com",
    messagingSenderId: "1024139519354",
    appId: "1:1024139519354:web:a0b11a5a0560ab02ee22c3"
};

const app = initializeApp(firebaseConfig);
const db = getDatabase(app);
const auth = getAuth(app);

document.addEventListener('DOMContentLoaded', () => {
    const questions = [
        "Question 1: Do you like Android or Apple devices better?",
        "Question 2: How would you rate the customer service provided by Apple?",
        "Question 3: Will you be interested in purchasing the new iPhone when it releases?",
        "Question 4: What do you think about the pricing of Apple devices?",
        "Question 5: Were you satisfied with the ease of purchasing from Apple's website or store?",
        "Question 6: How likely are you to recommend Apple products to others?",
        "Question 7: What improvements would you suggest for Apple products or services?"
    ];

    let currentQuestion = 0;
    let timer;
    let timeLeft = 10;

    function startTimer() {
        timeLeft = 10;
        document.getElementById('timer').innerText = timeLeft;
        document.getElementById('nextButton').disabled = true;
        clearInterval(timer);
        timer = setInterval(() => {
            timeLeft--;
            document.getElementById('timer').innerText = timeLeft;
            if (timeLeft <= 0) {
                clearInterval(timer);
                document.getElementById('nextButton').disabled = false;
            }
        }, 1000);
    }

    function displayQuestion() {
        if (currentQuestion >= questions.length) {
            completeSurvey();
            return;
        }

        const questionText = questions[currentQuestion];
        document.getElementById('questionContainer').innerHTML = `<h2>${questionText}</h2>`;
        startTimer();
        document.getElementById('backButton').style.display = currentQuestion === 0 ? 'none' : 'inline-block';
    }

    function nextQuestion() {
        if (timeLeft <= 0) {
            currentQuestion++;
            displayQuestion();
        }
    }

    function goBack() {
        if (currentQuestion > 0) {
            currentQuestion--;
            displayQuestion();
        }
    }

    async function completeSurvey() {
        document.getElementById('questionContainer').innerHTML = "<p>Thank you for completing the survey!</p>";
        document.getElementById('nextButton').style.display = 'none';
        document.getElementById('backButton').style.display = 'none';
        document.getElementById('message').innerHTML = "Congratulations! You've earned $4.00.";

        await updateBalance(4.00);
    }

    async function updateBalance(amount) {
        const user = auth.currentUser;
        if (user) {
            const userId = user.uid;
            const userRef = ref(db, 'users/' + userId);

            try {
                const snapshot = await get(userRef);
                if (snapshot.exists()) {
                    const currentBalance = snapshot.val().balance;
                    const newBalance = currentBalance + amount;
                    await update(userRef, { balance: newBalance });
                    console.log('Balance updated successfully.');
                } else {
                    console.error('User data not found.');
                }
            } catch (error) {
                console.error('Error fetching or updating user data:', error);
            }
        } else {
            console.error('No user is currently authenticated.');
        }
    }

    document.getElementById('nextButton').addEventListener('click', nextQuestion);
    document.getElementById('backButton').addEventListener('click', goBack);
    displayQuestion();
});
