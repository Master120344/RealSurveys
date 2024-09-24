document.addEventListener('DOMContentLoaded', () => {
    const questions = [
        {
            text: "Do you like Android or Apple devices better?",
            type: "radio",
            options: ["Android", "Apple"]
        },
        {
            text: "How would you rate the customer service provided by Apple?",
            type: "select",
            options: ["Excellent", "Good", "Average", "Poor"]
        },
        {
            text: "Will you be interested in purchasing the new iPhone when it releases?",
            type: "radio",
            options: ["Yes", "No", "Maybe"]
        },
        {
            text: "What do you think about the pricing of Apple devices?",
            type: "textarea"
        },
        {
            text: "Were you satisfied with the ease of purchasing from Apple's website or store?",
            type: "radio",
            options: ["Very Satisfied", "Satisfied", "Dissatisfied", "Very Dissatisfied"]
        },
        {
            text: "How likely are you to recommend Apple products to others?",
            type: "select",
            options: ["Very Likely", "Likely", "Unlikely", "Very Unlikely"]
        },
        {
            text: "What improvements would you suggest for Apple products or services?",
            type: "textarea"
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
            document.getElementById('message').innerHTML = "Congratulations! You've earned a reward. <a href='surveys.html'>Go back to surveys</a>";
            return;
        }

        const question = questions[currentQuestion];
        let questionHtml = `<h2>${question.text}</h2>`;

        if (question.type === "radio") {
            question.options.forEach(option => {
                questionHtml += `<label><input type="radio" name="question${currentQuestion}" value="${option}"> ${option}</label><br>`;
            });
        } else if (question.type === "select") {
            questionHtml += `<select name="question${currentQuestion}">`;
            question.options.forEach(option => {
                questionHtml += `<option value="${option}">${option}</option>`;
            });
            questionHtml += `</select>`;
        } else if (question.type === "textarea") {
            questionHtml += `<textarea name="question${currentQuestion}" rows="4" cols="50"></textarea>`;
        }

        document.getElementById('questionContainer').innerHTML = questionHtml;
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
