const questions = [
    {
        question: "How satisfied are you with the range of products available at GameStop?",
        options: ["Very Dissatisfied", "Dissatisfied", "Neutral", "Satisfied", "Very Satisfied"]
    },
    {
        question: "How would you rate the quality of customer service at GameStop?",
        options: ["Very Poor", "Poor", "Average", "Good", "Excellent"]
    },
    {
        question: "How easy was it to navigate the GameStop website?",
        options: ["Very Difficult", "Difficult", "Neutral", "Easy", "Very Easy"]
    },
    {
        question: "How do you rate the pricing of products at GameStop?",
        options: ["Very Poor", "Poor", "Average", "Good", "Excellent"]
    },
    {
        question: "Were you satisfied with the delivery speed of your purchase?",
        options: ["Very Unsatisfied", "Unsatisfied", "Neutral", "Satisfied", "Very Satisfied"]
    },
    {
        question: "How likely are you to shop at GameStop again?",
        options: ["Very Unlikely", "Unlikely", "Neutral", "Likely", "Very Likely"]
    },
    {
        question: "What improvements would you suggest for GameStop?",
        options: ["More Product Variety", "Faster Delivery", "Better Website Navigation", "Improved Customer Service", "Other"]
    }
];

let currentQuestion = 0;
let selectedAnswers = [];

function displayQuestion() {
    if (currentQuestion >= questions.length) {
        document.getElementById('questionContainer').innerHTML = "<p>Thank you for completing the survey!</p>";
        document.getElementById('nextButton').style.display = 'none';
        document.getElementById('backButton').style.display = 'none';
        return;
    }

    const q = questions[currentQuestion];
    const optionsHtml = q.options.map((option, index) => `
        <label>
            <input type="radio" name="question" value="${index}" required>
            ${option}
        </label>
    `).join('<br>');

    document.getElementById('questionContainer').innerHTML = `
        <h2>${q.question}</h2>
        ${optionsHtml}
    `;

    document.getElementById('backButton').style.display = currentQuestion > 0 ? 'inline-block' : 'none';
    document.getElementById('message').innerText = '';
}

function nextQuestion() {
    const selectedOption = document.querySelector('input[name="question"]:checked');
    if (selectedOption) {
        selectedAnswers[currentQuestion] = selectedOption.value;
        currentQuestion++;
        displayQuestion();
    } else {
        document.getElementById('message').innerText = 'Please select an option before proceeding.';
    }
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