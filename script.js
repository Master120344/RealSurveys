document.addEventListener('DOMContentLoaded', () => {
    const surveys = {
        1: {
            id: 1,
            title: "McDonald's Survey",
            questions: [
                { question: "How often do you eat at McDonald's?", options: ["Daily", "Weekly", "Monthly", "Rarely", "Never"] },
                { question: "What is your favorite item on the menu?", options: ["Big Mac", "McChicken", "Fries", "McFlurry"] },
                { question: "How do you rate the service?", options: ["Excellent", "Good", "Average", "Poor"] },
                { question: "Would you recommend McDonald's to a friend?", options: ["Yes", "No"] },
                { question: "How satisfied are you with the cleanliness?", options: ["Very Satisfied", "Satisfied", "Neutral", "Dissatisfied"] }
            ],
            reward: 5
        },
        2: {
            id: 2,
            title: "Subway Survey",
            questions: [
                { question: "How often do you eat at Subway?", options: ["Daily", "Weekly", "Monthly", "Rarely", "Never"] },
                { question: "What is your favorite sandwich?", options: ["Italian BMT", "Chicken Teriyaki", "Veggie Delight", "Tuna"] },
                { question: "How do you rate the freshness of ingredients?", options: ["Excellent", "Good", "Average", "Poor"] },
                { question: "Would you recommend Subway to a friend?", options: ["Yes", "No"] },
                { question: "How satisfied are you with the customer service?", options: ["Very Satisfied", "Satisfied", "Neutral", "Dissatisfied"] }
            ],
            reward: 4
        }
    };

    let currentSurveyId = 1; // This should be set dynamically based on user selection
    let currentQuestionIndex = 0;

    function showQuestion(index) {
        const survey = surveys[currentSurveyId];
        const questionData = survey.questions[index];
        document.getElementById('survey-title').innerText = survey.title;
        document.getElementById('question-number').innerText = `Question ${index + 1}/${survey.questions.length}`;
        document.getElementById('question').innerText = questionData.question;
        const optionsContainer = document.getElementById('options');
        optionsContainer.innerHTML = '';
        questionData.options.forEach(option => {
            const optionElement = document.createElement('div');
            optionElement.classList.add('option');
            optionElement.innerHTML = `<input type="radio" name="option" value="${option}"> <label>${option}</label>`;
            optionsContainer.appendChild(optionElement);
        });
        document.getElementById('prev').disabled = currentQuestionIndex === 0;
        document.getElementById('next').innerText = currentQuestionIndex === survey.questions.length - 1 ? 'Finish' : 'Next';
    }

    function nextQuestion() {
        const survey = surveys[currentSurveyId];
        const selectedOption = document.querySelector('input[name="option"]:checked');
        if (!selectedOption) {
            alert('Please select an option to proceed.');
            return;
        }
        if (currentQuestionIndex < survey.questions.length - 1) {
            currentQuestionIndex++;
            showQuestion(currentQuestionIndex);
        } else {
            completeSurvey();
        }
    }

    function prevQuestion() {
        if (currentQuestionIndex > 0) {
            currentQuestionIndex--;
            showQuestion(currentQuestionIndex);
        }
    }

    function completeSurvey() {
        const user = JSON.parse(localStorage.getItem('user')) || { username: 'Guest', balance: 0 };
        user.balance += surveys[currentSurveyId].reward;
        localStorage.setItem('user', JSON.stringify(user));
        confetti();
        alert(`Congratulations! You have completed the survey. Your new balance is $${user.balance}.`);
        window.location.href = 'surveys.html';
    }

    function confetti() {
        confetti({
            particleCount: 100,
            spread: 70,
            origin: { y: 0.6 }
        });
    }

    showQuestion(currentQuestionIndex);

    const user = JSON.parse(localStorage.getItem('user')) || { username: 'Guest', balance: 0 };
    document.getElementById('username').innerText = `Username: ${user.username}`;
    document.getElementById('balance').innerText = `Balance: $${user.balance}`;
});
