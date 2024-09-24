document.addEventListener('DOMContentLoaded', () => {
    // Array of survey questions
    const questions = [
        "Do you like Android or Apple devices better?",
        "How would you rate the customer service provided by Apple?",
        "Will you be interested in purchasing the new iPhone when it releases?",
        "What do you think about the pricing of Apple devices?",
        "Were you satisfied with the ease of purchasing from Apple's website or store?",
        "How likely are you to recommend Apple products to others?",
        "What improvements would you suggest for Apple products or services?"
    ];

    let currentQuestion = 0;
    let timer;
    let timeLeft = 10;

    // Function to start the timer
    function startTimer() {
        timeLeft = 10;
        document.getElementById('timer').innerText = timeLeft;
        document.getElementById('nextButton').disabled = true; // Disable the next button until the timer is up
        clearInterval(timer); // Clear any previous timers
        timer = setInterval(() => {
            timeLeft--;
            document.getElementById('timer').innerText = timeLeft;
            if (timeLeft <= 0) {
                clearInterval(timer); // Stop the timer when it reaches 0
                document.getElementById('nextButton').disabled = false; // Re-enable the next button
            }
        }, 1000); // 1-second intervals
    }

    // Function to display the current question
    function displayQuestion() {
        // If all questions have been answered
        if (currentQuestion >= questions.length) {
            document.getElementById('questionContainer').innerHTML = "<p>Thank you for completing the survey!</p>";
            document.getElementById('nextButton').style.display = 'none'; // Hide the next button
            document.getElementById('backButton').style.display = 'none'; // Hide the back button
            document.getElementById('message').innerHTML = "Congratulations! You've earned a reward. <a href='surveys.html'>Go back to surveys</a>";
            return; // Exit the function
        }

        // Display the current question
        const questionText = questions[currentQuestion];
        document.getElementById('questionContainer').innerHTML = `
            <div class="question-box">
                <h2>${questionText}</h2>
                <div>
                    <label>
                        <input type="radio" name="answer" value="Yes"> Yes
                    </label>
                    <label>
                        <input type="radio" name="answer" value="No"> No
                    </label>
                </div>
            </div>
        `;

        // Start the timer for this question
        startTimer();

        // Show or hide the back button depending on the current question
        document.getElementById('backButton').style.display = currentQuestion === 0 ? 'none' : 'inline-block';
    }

    // Function to move to the next question
    function nextQuestion() {
        if (timeLeft <= 0) { // Ensure time has expired before moving to the next question
            currentQuestion++;
            displayQuestion();
        }
    }

    // Function to go back to the previous question
    function goBack() {
        if (currentQuestion > 0) {
            currentQuestion--;
            displayQuestion();
        }
    }

    // Event listeners for the Next and Back buttons
    document.getElementById('nextButton').addEventListener('click', nextQuestion);
    document.getElementById('backButton').addEventListener('click', goBack);

    // Start by displaying the first question
    displayQuestion();
});
