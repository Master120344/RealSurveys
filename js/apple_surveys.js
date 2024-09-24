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

    let currentQuestion = 0;
    let timer;
    let timeLeft = 10;

    function startTimer() {
        timeLeft = 10;
        document.getElementById('timer').innerText = timeLeft;
        document.getElementById('nextButton').disabled = true;
        clearInterval(timer);
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
            document.getElementById('message').innerHTML = "You've earned a reward! Redirecting...";
            setTimeout(() => {
                window.location.href = 'surveys.html'; // Redirect to surveys page
            }, 3000);
            return;
        }

        const question = questions[currentQuestion];
        let questionHTML = `<h2>${question.text}</h2>`;

        if (question.type === "multiple-choice") {
            question.options.forEach(option => {
                questionHTML += `
                    <div class="option">
                        <input type="radio" name="answer" id="${option}" value="${option}">
                        <label for="${option}">${option}</label>
                    </div>`;
            });
        } else if (question.type === "text") {
            questionHTML += `<textarea placeholder="Your answer here..."></textarea>`;
        }

        document.getElementById('questionContainer').innerHTML = questionHTML;
        startTimer();
        document.getElementById('backButton').style.display = currentQuestion === 0 ? 'none' : 'inline-block';
    }

    function nextQuestion() {
        if (timeLeft <= 0) {
            currentQuestion++;
            displayQuestion();
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
});
