let currentQuestionIndex = 0;
const totalQuestions = 100; // Update this to match the number of questions you have
let timeLeft = 10;
let timerInterval;

// Define your questions and possible options
const questions = [
    {
        text: "Have you ever been to Home Depot before?",
        options: [
            { text: "Yes", next: 1 },
            { text: "No", next: 2 }
        ]
    },
    {
        text: "How would you rate your overall experience with Home Depot?",
        options: [
            { text: "1 - Very Poor", next: 3 },
            { text: "2 - Poor", next: 3 },
            { text: "3 - Average", next: 3 },
            { text: "4 - Good", next: 3 },
            { text: "5 - Excellent", next: 3 }
        ]
    },
    {
        text: "What could Home Depot do to improve your experience?",
        options: [
            { text: "Better customer service", next: 4 },
            { text: "Lower prices", next: 4 },
            { text: "More product variety", next: 4 }
        ]
    },
    // Add more questions here, and specify branching logic as needed
];

function startTimer() {
    timerInterval = setInterval(() => {
        timeLeft--;
        document.getElementById('timer').textContent = timeLeft;

        if (timeLeft <= 0) {
            clearInterval(timerInterval);
            document.getElementById('next-button').disabled = false;
        }
    }, 1000);
}

function resetTimer() {
    timeLeft = 10;
    document.getElementById('timer').textContent = timeLeft;
    document.getElementById('next-button').disabled = true;
    startTimer();
}

function nextQuestion() {
    currentQuestionIndex = getNextQuestionIndex();
    if (currentQuestionIndex < totalQuestions) {
        displayQuestion(currentQuestionIndex);
        resetTimer();
    } else {
        window.location.href = 'surveys.html'; // Redirect when survey is complete
    }
}

function goBack() {
    // Add logic for going back if needed
}

function displayQuestion(index) {
    const question = questions[index];
    document.getElementById('question-text').textContent = `Question ${index + 1}: ${question.text}`;
    
    const optionsContainer = document.getElementById('question-options');
    optionsContainer.innerHTML = ''; // Clear previous options

    question.options.forEach((option, i) => {
        const optionElement = document.createElement('div');
        optionElement.innerHTML = `<input type="radio" name="question${index}" id="q${index}a${i}" value="${i}"> ${option.text}<br>`;
        optionsContainer.appendChild(optionElement);
    });
}

function getNextQuestionIndex() {
    const selectedOption = document.querySelector('input[name="question' + currentQuestionIndex + '"]:checked');
    if (selectedOption) {
        const nextQuestion = questions[currentQuestionIndex].options[selectedOption.value].next;
        return nextQuestion;
    }
    return currentQuestionIndex; // Stay on current question if no option is selected
}

// Initialize the first question on page load
window.onload = function() {
    displayQuestion(currentQuestionIndex);
    resetTimer();
};
