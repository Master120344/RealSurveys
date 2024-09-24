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
        options: ["Very Fair", "Fair", "Average", "Expensive", "Very Expensive"]
    },
    {
        question: "How likely are you to visit Burger King again?",
        options: ["Very Likely", "Likely", "Neutral", "Unlikely", "Very Unlikely"]
    },
    {
        question: "How easy was it to place your order at Burger King?",
        options: ["Very Easy", "Easy", "Average", "Difficult", "Very Difficult"]
    },
    {
        question: "What improvements would you suggest for Burger King?",
        options: ["More Menu Options", "Lower Prices", "Better Service", "Cleaner Environment", "Other"]
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
    if (currentQuestion >= questions.length) {
        document.getElementById('questionContainer').innerHTML = "<p>Thank you for completing the survey!</p>";
        document.getElementById('nextButton').style.display = 'none';
        document.getElementById('backButton').style.display = 'none';
        rewardUser();
        return;
    }
    const { question, options } = questions[currentQuestion];
    const optionsHtml = options.map((option, index) =>
        `<label><input type="radio" name="question${currentQuestion}" value="${option}"> ${option}</label>`
    ).join('');
    
    document.getElementById('questionContainer').innerHTML = `<h2>${question}</h2>${optionsHtml}`;
    startTimer();
}

function nextQuestion() {
    currentQuestion++;
    displayQuestion();
}

function goBack() {
    if (currentQuestion > 0) {
        currentQuestion--;
        displayQuestion();
    }
}

function rewardUser() {
    // This function assumes you have a balance.js module to update the balance
    // Call to a hypothetical updateBalance function
    updateBalance(2); // Adds $2 to the user's balance
}

document.getElementById('nextButton').addEventListener('click', nextQuestion);
document.getElementById('backButton').addEventListener('click', goBack);

displayQuestion();
