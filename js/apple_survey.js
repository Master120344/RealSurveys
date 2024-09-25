document.addEventListener('DOMContentLoaded', () => {
    const questions = [
        {
            text: "Do you like Android or Apple devices better?",
            options: ["Android", "Apple"],
            type: "multiple-choice"
        },
        {
            text: "How would you rate the customer service provided by Apple?",
            options: ["1 Star", "2 Stars", "3 Stars", "4 Stars", "5 Stars"],
            type: "multiple-choice"
        },
        {
            text: "Will you be interested in purchasing the new iPhone when it releases?",
            options: ["Yes", "No", "Maybe"],
            type: "multiple-choice"
        },
        {
            text: "What do you think about the pricing of Apple devices?",
            type: "text"
        },
        {
            text: "Were you satisfied with the ease of purchasing from Apple's website or store?",
            options: ["Yes", "No"],
            type: "multiple-choice"
        },
        {
            text: "How likely are you to recommend Apple products to others?",
            options: ["Very Unlikely", "Unlikely", "Neutral", "Likely", "Very Likely"],
            type: "multiple-choice"
        },
        {
            text: "What improvements would you suggest for Apple products or services?",
            type: "text"
        }
    ];

    let currentQuestionIndex = 0;
    let timerInterval;
    let timeLeft = 10;

    // Initialize the survey
    displayQuestion();
    updateProgressBar();

    // Timer for each question
    function startTimer() {
        timeLeft = 10;
        updateTimerDisplay();
        toggleNextButton(false);

        clearInterval(timerInterval);
        timerInterval = setInterval(() => {
            timeLeft--;
            updateTimerDisplay();
            if (timeLeft <= 0) {
                clearInterval(timerInterval);
                toggleNextButton(true);
            }
        }, 1000);
    }

    // Update timer display
    function updateTimerDisplay() {
        document.getElementById('timer').innerText = `Time left: ${timeLeft}s`;
    }

    // Toggle next button enable/disable
    function toggleNextButton(state) {
        document.getElementById('nextButton').disabled = !state;
    }

    // Display current question
    function displayQuestion() {
        if (currentQuestionIndex >= questions.length) {
            endSurvey();
            return;
        }

        const question = questions[currentQuestionIndex];
        const questionHTML = createQuestionHTML(question);
        document.getElementById('questionContainer').innerHTML = questionHTML;

        startTimer();
        document.getElementById('backButton').style.display = currentQuestionIndex === 0 ? 'none' : 'inline-block';
    }

    // Create HTML for question
    function createQuestionHTML(question) {
        let html = `<h2>${question.text}</h2>`;
        
        if (question.type === "multiple-choice") {
            question.options.forEach(option => {
                html += `
                    <div class="option">
                        <input type="radio" name="answer" id="${option}" value="${option}">
                        <label for="${option}">${option}</label>
                    </div>`;
            });
        } else if (question.type === "text") {
            html += `<textarea id="textAnswer" placeholder="Your answer here..."></textarea>`;
        }

        return html;
    }

    // End the survey and show the completion message
    function endSurvey() {
        document.getElementById('questionContainer').innerHTML = "<p>Thank you for completing the survey!</p>";
        toggleNextButton(false);
        document.getElementById('backButton').style.display = 'none';
        document.getElementById('message').innerHTML = "You've earned a reward! Redirecting...";
        
        setTimeout(() => {
            window.location.href = 'surveys.html'; // Redirect to surveys page
        }, 3000);
    }

    // Move to next question
    function nextQuestion() {
        if (validateAnswer()) {
            currentQuestionIndex++;
            displayQuestion();
            updateProgressBar();
        } else {
            alert("Please answer the question before proceeding.");
        }
    }

    // Go back to previous question
    function goBack() {
        if (currentQuestionIndex > 0) {
            currentQuestionIndex--;
            displayQuestion();
            updateProgressBar();
        }
    }

    // Validate if the user has answered the question
    function validateAnswer() {
        const question = questions[currentQuestionIndex];
        if (question.type === "multiple-choice") {
            return document.querySelector('input[name="answer"]:checked') !== null;
        } else if (question.type === "text") {
            return document.getElementById('textAnswer').value.trim() !== "";
        }
        return false;
    }

    // Update the progress bar
    function updateProgressBar() {
        const progress = ((currentQuestionIndex + 1) / questions.length) * 100;
        document.getElementById('progressBar').style.width = `${progress}%`;
    }

    // Event listeners
    document.getElementById('nextButton').addEventListener('click', nextQuestion);
    document.getElementById('backButton').addEventListener('click', goBack);
});