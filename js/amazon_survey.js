const questions = [
    {
        question: "How satisfied are you with the variety of products on Amazon?",
        options: ["Very Dissatisfied", "Dissatisfied", "Neutral", "Satisfied", "Very Satisfied"]
    },
    {
        question: "How would you rate the shipping speed for your orders?",
        options: ["Very Poor", "Poor", "Average", "Good", "Excellent"]
    },
    {
        question: "How easy was it to navigate the Amazon website?",
        options: ["Very Difficult", "Difficult", "Neutral", "Easy", "Very Easy"]
    },
    {
        question: "Were you satisfied with the customer service you received?",
        options: ["Very Unsatisfied", "Unsatisfied", "Neutral", "Satisfied", "Very Satisfied"]
    },
    {
        question: "How likely are you to recommend Amazon to others?",
        options: ["Very Unlikely", "Unlikely", "Neutral", "Likely", "Very Likely"]
    },
    {
        question: "How do you feel about the return and refund process?",
        options: ["Very Negative", "Negative", "Neutral", "Positive", "Very Positive"]
    },
    {
        question: "What improvements would you suggest for Amazon?",
        options: ["More Product Variety", "Faster Shipping", "Better Website Navigation", "Improved Customer Service", "Other"]
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
        document.getElementById('message').innerHTML = "Congratulations! You've earned a reward. <a href='surveys.html'>Go back to surveys</a>";
        return;
    }

    const q = questions[currentQuestion];
    let optionsHtml = q.options.map((option, index) => `
        <label>
            <input type="radio" name="question" value="${index}">
            ${option}
        </label>
    `).join('<br>');

    document.getElementById('questionContainer').innerHTML = `
        <h2>${q.question}</h2>
        ${optionsHtml}
    `;

    startTimer();
    document.getElementById('backButton').style.display = currentQuestion > 0 ? 'inline-block' : 'none';
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

document.getElementById('nextButton').addEventListener('click', nextQuestion);
document.getElementById('backButton').addEventListener('click', goBack);

displayQuestion();
