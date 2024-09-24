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

    // Initialize the survey display
    displayQuestion();

    // Start the timer for the current question
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

    // Update the timer display
    function updateTimerDisplay() {
        document.getElementById('timer').innerText = timeLeft;
    }

    // Enable or disable the Next button
    function toggleNextButton(state) {
        document.getElementById('nextButton').disabled = !state;
    }

    // Display the current question
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

    // Create HTML for the question and its options
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
            html += `<textarea placeholder="Your answer here..."></textarea>`;
        }
        
        return html;
    }

    // Handle the end of the survey
    function endSurvey() {
        document.getElementById('questionContainer').innerHTML = "<p>Thank you for completing the survey!</p>";
        toggleNextButton(false);
        document.getElementById('backButton').style.display = 'none';
        document.getElementById('message').innerHTML = "You've earned a reward! Redirecting...";
        
        setTimeout(() => {
            window.location.href = 'surveys.html'; // Redirect to surveys page
        }, 3000);
    }

    // Move to the next question
    function nextQuestion() {
        if (timeLeft <= 0) {
            currentQuestionIndex++;
            displayQuestion();
        }
    }

    // Go back to the previous question
    function goBack() {
        if (currentQuestionIndex > 0) {
            currentQuestionIndex--;
            displayQuestion();
        }
    }

    // Event listeners for buttons
    document.getElementById('nextButton').addEventListener('click', nextQuestion);
    document.getElementById('backButton').addEventListener('click', goBack);
});
