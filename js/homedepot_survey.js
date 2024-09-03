let currentQuestion = 1;
const totalQuestions = 10;
let timeLeft = 10;
let timerInterval;

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
    if (currentQuestion < totalQuestions) {
        currentQuestion++;
        document.getElementById('question-text').textContent = `Question ${currentQuestion}: ` + getQuestionText(currentQuestion);
        resetTimer();
    } else {
        submitSurvey(); // Submit the survey when completed
    }
}

function goBack() {
    if (currentQuestion > 1) {
        currentQuestion--;
        document.getElementById('question-text').textContent = `Question ${currentQuestion}: ` + getQuestionText(currentQuestion);
        resetTimer();
    }
}

function getQuestionText(questionNumber) {
    const questions = [
        "How would you rate your overall experience with Home Depot?",
        "How satisfied are you with the quality of products?",
        "How likely are you to recommend Home Depot to a friend?",
        "How was the customer service during your visit?",
        "Did you find everything you were looking for?",
        "How satisfied are you with the prices at Home Depot?",
        "How clean and organized was the store?",
        "How easy was it to navigate the store?",
        "How satisfied are you with the Home Depot website?",
        "Would you shop at Home Depot again?"
    ];
    return questions[questionNumber - 1];
}

function submitSurvey() {
    const email = document.getElementById('email').value;
    const answers = Array.from(document.querySelectorAll('input[type="radio"]:checked')).map(input => input.value);
    
    fetch('/complete-survey', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            email: email,
            surveyAnswers: answers,
        }),
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            alert('Survey submitted successfully!');
            window.location.href = 'surveys.html'; // Redirect after submission
        } else {
            alert('Error submitting survey.');
        }
    })
    .catch(error => {
        console.error('Error:', error);
    });
}

// Start the first question timer on page load
window.onload = resetTimer;
