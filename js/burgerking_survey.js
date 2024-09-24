const questions = [
    {
        question: "How satisfied are you with the quality of food at Burger King?",
        options: ["Very Satisfied", "Satisfied", "Neutral", "Dissatisfied", "Very Dissatisfied"]
    },
    {
        question: "How would you rate the customer service at Burger King?",
        options: ["Excellent", "Good", "Average", "Poor", "Very Poor"]
    },
    {
        question: "How clean and comfortable is the Burger King location you visited?",
        options: ["Very Clean", "Clean", "Average", "Dirty", "Very Dirty"]
    },
    {
        question: "How do you rate the pricing of the menu items at Burger King?",
        options: ["Very Reasonable", "Reasonable", "Average", "Expensive", "Very Expensive"]
    },
    {
        question: "How likely are you to visit Burger King again?",
        options: ["Very Likely", "Likely", "Unsure", "Unlikely", "Very Unlikely"]
    },
    {
        question: "How easy was it to place your order at Burger King?",
        options: ["Very Easy", "Easy", "Neutral", "Difficult", "Very Difficult"]
    },
    {
        question: "What improvements would you suggest for Burger King?",
        options: [], // Text box for suggestions
        isTextBox: true
    }
];

let currentQuestion = 0;
let timer;

function startTimer() {
    let timeLeft = 10;
    document.getElementById('timer').innerText = timeLeft;
    document.getElementById('nextButton').disabled = true;
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
    const questionData = questions[currentQuestion];
    document.getElementById('questionContainer').innerHTML = `
        <h2>${questionData.question}</h2>
        ${questionData.options.map((option, index) => `
            <label>
                <input type="${questionData.isTextBox ? 'text' : 'radio'}" name="question${currentQuestion}" value="${option}" />
                ${option}
            </label>
        `).join('')}
        ${questionData.isTextBox ? '<textarea placeholder="Your suggestions..."></textarea>' : ''}
    `;
    startTimer();
    document.getElementById('backButton').style.display = currentQuestion > 0 ? 'inline-block' : 'none';
}

function nextQuestion() {
    currentQuestion++;
    if (currentQuestion < questions.length) {
        displayQuestion();
    } else {
        endSurvey();
    }
}

function goBack() {
    if (currentQuestion > 0) {
        currentQuestion--;
        displayQuestion();
    }
}

function endSurvey() {
    clearInterval(timer);
    document.getElementById('questionContainer').innerHTML = "<p>Thank you for completing the survey!</p>";
    document.getElementById('nextButton').style.display = 'none';
    document.getElementById('backButton').style.display = 'none';
    rewardUser();
}

function rewardUser() {
    const rewardAmount = 2; // Amount to reward
    console.log(`Rewarding $${rewardAmount} to the user.`);
    // Call to balance.js to add the reward, e.g., addReward(rewardAmount);
}

document.getElementById('nextButton').addEventListener('click', nextQuestion);
document.getElementById('backButton').addEventListener('click', goBack);

displayQuestion();
