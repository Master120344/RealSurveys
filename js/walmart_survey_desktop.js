const questions = [
    {
        question: "How often do you shop at Walmart?",
        options: ["Weekly", "Monthly", "Rarely", "Never", "Type in Manual Answer"]
    },
    {
        question: "Would you like Walmart to go back to 24/7?",
        options: ["Yes", "No", "Doesn't matter", "Maybe", "Type in Manual Answer"]
    },
    {
        question: "Is it difficult to find people to help you at Walmart?",
        options: ["Yes", "No", "Sometimes", "Not Sure", "Type in Manual Answer"]
    },
    {
        question: "How would you rate Walmart's prices?",
        options: ["Very Satisfied", "Satisfied", "Neutral", "Dissatisfied", "Type in Manual Answer"]
    },
    {
        question: "How satisfied are you with the cleanliness of Walmart?",
        options: ["Very Satisfied", "Satisfied", "Neutral", "Dissatisfied", "Type in Manual Answer"]
    },
    // Add additional questions as needed
];

let currentQuestionIndex = 0;
let timerInterval;
let timeLeft = 10;

function startTimer() {
    const timerElem = document.getElementById('timer');
    timeLeft = 10;
    timerElem.textContent = timeLeft;

    timerInterval = setInterval(() => {
        timeLeft--;
        timerElem.textContent = timeLeft;

        if (timeLeft <= 0) {
            clearInterval(timerInterval);
            document.getElementById('next').disabled = false;  // Enable Next button
        }
    }, 1000);
}

function showQuestion(index) {
    const question = questions[index];
    const questionElem = document.getElementById('question');
    const optionsElem = document.getElementById('options');
    const manualAnswerElem = document.getElementById('manual-answer-container');
    
    questionElem.textContent = question.question;
    optionsElem.innerHTML = '';
    
    question.options.forEach(option => {
        const optionElem = document.createElement('div');
        optionElem.classList.add('option');

        const input = document.createElement('input');
        input.type = 'radio';
        input.name = 'option';
        input.value = option;
        input.id = option;

        const label = document.createElement('label');
        label.setAttribute('for', option);
        label.textContent = option;

        optionElem.appendChild(input);
        optionElem.appendChild(label);
        optionsElem.appendChild(optionElem);
    });

    // Display or hide manual answer field
    manualAnswerElem.style.display = document.querySelector('input[name="option"]:checked')?.value === "Type in Manual Answer" ? 'block' : 'none';

    document.getElementById('back').disabled = index === 0;
    document.getElementById('next').disabled = true; // Disable Next button initially
    startTimer(); // Start timer for new question
}

function nextQuestion() {
    const selected = document.querySelector('input[name="option"]:checked');
    if (selected) {
        if (selected.value === "Type in Manual Answer") {
            const manualAnswer = document.get
            if (selected.value === "Type in Manual Answer") {
            const manualAnswer = document.getElementById('manual-answer').value;
            if (manualAnswer.trim() === "") {
                alert("Please provide a manual answer.");
                return;
            }
        }
        currentQuestionIndex++;
        if (currentQuestionIndex >= questions.length) {
            showCompletionSection();
        } else {
            showQuestion(currentQuestionIndex);
        }
    }
}

function prevQuestion() {
    if (currentQuestionIndex > 0) {
        currentQuestionIndex--;
        showQuestion(currentQuestionIndex);
    }
}

function showCompletionSection() {
    // Hide the question and options section
    document.querySelector('.survey-question').style.display = 'none';
    document.querySelector('.survey-timer').style.display = 'none';
    document.querySelector('.survey-navigation').style.display = 'none';

    // Show the completion message
    document.getElementById('reward-section').style.display = 'block';
    document.getElementById('claim-reward').style.display = 'inline-block';
}

function claimReward() {
    alert("Congratulations! You've successfully completed the survey and earned your reward!");
    // You can also add logic to track the reward claiming process or integrate with a backend for reward distribution.
}

function handleManualAnswerChange() {
    const manualAnswerContainer = document.getElementById('manual-answer-container');
    const selectedOption = document.querySelector('input[name="option"]:checked');
    if (selectedOption && selectedOption.value === "Type in Manual Answer") {
        manualAnswerContainer.style.display = 'block';
    } else {
        manualAnswerContainer.style.display = 'none';
    }
}

// Initialize the survey
window.onload = function () {
    showQuestion(currentQuestionIndex);

    // Event listener for manual answer option change
    document.getElementById('options').addEventListener('change', handleManualAnswerChange);
};