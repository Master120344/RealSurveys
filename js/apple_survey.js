document.addEventListener('DOMContentLoaded', () => {
    const questions = [
        {
            text: "Do you prefer iPhone over Android?",
            options: ["Android", "Apple"],
            type: "multiple-choice",
            followUp: {
                Android: "What do you find most appealing about Android devices?",
                Apple: "What features do you love most about your iPhone?"
            }
        },
        {
            text: "How would you rate the quality of your iPhone?",
            options: ["1 Star", "2 Stars", "3 Stars", "4 Stars", "5 Stars"],
            type: "multiple-choice"
        },
        {
            text: "Will you be interested in purchasing the new iPhone?",
            options: ["Yes", "No", "Maybe"],
            type: "multiple-choice"
        },
        {
            text: "What do you think about the pricing of Apple devices?",
            type: "text"
        },
        {
            text: "Does the pricing of new Apple products steer you away from their products?",
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
    const userResponses = {};

    displayQuestion();
    updateProgressBar();

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
                document.getElementById('message').innerText = "Time is up! Please select an answer.";
            }
        }, 1000);
    }

    function updateTimerDisplay() {
        document.getElementById('timer').innerText = `Time left: ${timeLeft}s`;
    }

    function toggleNextButton(state) {
        const nextButton = document.getElementById('nextButton');
        nextButton.disabled = !state;
        nextButton.classList.toggle('enabled', state);
    }

    function displayQuestion() {
        if (currentQuestionIndex >= questions.length) {
            endSurvey();
            return;
        }

        const question = questions[currentQuestionIndex];
        const questionHTML = createQuestionHTML(question);
        const questionContainer = document.getElementById('questionContainer');

        // Add fade out effect
        questionContainer.classList.add('fade-out');
        setTimeout(() => {
            questionContainer.innerHTML = questionHTML;
            questionContainer.classList.remove('fade-out');
            startTimer();
            document.getElementById('backButton').style.display = currentQuestionIndex === 0 ? 'none' : 'inline-block';
            document.getElementById('message').innerText = ''; // Clear previous messages
        }, 500);
    }

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

    function endSurvey() {
        clearInterval(timerInterval); // Stop the timer
        document.getElementById('questionContainer').innerHTML = "<p>Thank you for completing the survey!</p>";
        toggleNextButton(false);
        document.getElementById('backButton').style.display = 'none';
        document.getElementById('message').innerText = "You've earned a reward! Redirecting...";

        // Store responses in local storage
        localStorage.setItem('userResponses', JSON.stringify(userResponses));

        setTimeout(() => {
            window.location.href = 'surveys.html'; // Redirect to surveys page
        }, 3000);
    }

    function nextQuestion() {
        if (validateAnswer()) {
            recordUserResponse();

            const question = questions[currentQuestionIndex];

            // Check for follow-up questions based on responses
            if (question.followUp) {
                const selectedOption = document.querySelector('input[name="answer"]:checked').value;
                if (selectedOption in question.followUp) {
                    questions.splice(currentQuestionIndex + 1, 0, {
                        text: question.followUp[selectedOption],
                        type: "text"
                    });
                }
            }

            currentQuestionIndex++;
            displayQuestion();
            updateProgressBar();
        } else {
            document.getElementById('message').innerText = "Please answer the question before proceeding.";
        }
    }

    function recordUserResponse() {
        const question = questions[currentQuestionIndex];
        if (question.type === "multiple-choice") {
            const selectedOption = document.querySelector('input[name="answer"]:checked').value;
            userResponses[question.text] = selectedOption;
        } else if (question.type === "text") {
            const textAnswer = document.getElementById('textAnswer').value.trim();
            userResponses[question.text] = textAnswer;
        }
    }

    function goBack() {
        if (currentQuestionIndex > 0) {
            currentQuestionIndex--;
            displayQuestion();
            updateProgressBar();
        }
    }

    function validateAnswer() {
        const question = questions[currentQuestionIndex];
        if (question.type === "multiple-choice") {
            return document.querySelector('input[name="answer"]:checked') !== null;
        } else if (question.type === "text") {
            return document.getElementById('textAnswer').value.trim() !== "";
        }
        return false;
    }

    function updateProgressBar() {
        const progress = ((currentQuestionIndex + 1) / questions.length) * 100;
        document.getElementById('progressBar').style.width = `${progress}%`;
    }

    // Event listeners
    document.getElementById('nextButton').addEventListener('click', nextQuestion);
    document.getElementById('backButton').addEventListener('click', goBack);
});
