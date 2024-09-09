const questions = [
    "Question 1: How satisfied are you with the performance of your Apple device?",
    "Question 2: How would you rate the customer service provided by Apple?",
    "Question 3: How easy is it to use the Apple ecosystem of products and services?",
    "Question 4: How do you rate the value for money of Apple products?",
    "Question 5: Were you satisfied with the ease of purchasing from Apple's website or store?",
    "Question 6: How likely are you to recommend Apple products to others?",
    "Question 7: What improvements would you suggest for Apple products or services?"
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
    document.getElementById('questionContainer').innerHTML = `<h2>${questions[currentQuestion]}</h2>`;
    startTimer();
    document.getElementById('backButton').style.display = currentQuestion === 0 ? 'none' : 'block';
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
