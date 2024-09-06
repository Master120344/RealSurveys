const questions = [
    {
        question: "How often do you use Chase Bank services?",
        options: ["Daily", "Weekly", "Monthly", "Rarely"]
    },
    {
        question: "What type of account do you hold with Chase Bank?",
        options: ["Checking Account", "Savings Account", "Credit Card", "Loan Account"]
    },
    {
        question: "How satisfied are you with Chase Bank's customer service?",
        options: ["Very Satisfied", "Satisfied", "Neutral", "Dissatisfied"]
    },
    {
        question: "Which of the following services do you use most often?",
        options: ["Online Banking", "Mobile App", "In-branch Services", "ATMs"]
    }
];

let currentQuestion = 0;

function showQuestion(index) {
    const questionElem = document.getElementById('question');
    const optionsElem = document.getElementById('options');
    questionElem.innerText = questions[index].question;
    optionsElem.innerHTML = '';
    questions[index].options.forEach(option => {
        const optionElem = document.createElement('div');
        optionElem.classList.add('option');
        const input = document.createElement('input');
        input.type = 'radio';
        input.name = 'option';
        input.value = option;
        input.id = option;
        input.onclick = enableNextButton;
        const label = document.createElement('label');
        label.setAttribute('for', option);
        label.innerText = option;
        optionElem.appendChild(input);
        optionElem.appendChild(label);
        optionsElem.appendChild(optionElem);
    });

    document.getElementById('back').disabled = index === 0;
    document.getElementById('next').disabled = true;
}

function enableNextButton() {
    document.getElementById('next').disabled = false;
}

function nextQuestion() {
    const selected = document.querySelector('input[name="option"]:checked');
    if (selected) {
        if (currentQuestion < questions.length - 1) {
            currentQuestion++;
            showQuestion(currentQuestion);
        } else {
            showReward();
        }
    }
}

function prevQuestion() {
    if (currentQuestion > 0) {
        currentQuestion--;
        showQuestion(currentQuestion);
    }
}

function showReward() {
    document.querySelector('.survey-question').innerHTML = '<h3>Congratulations! You have completed the survey.</h3><p>Your reward: $8</p>';
    document.getElementById('claim-reward').style.display = 'inline-block';
    document.querySelector('.survey-navigation').style.display = 'none';
    confetti({ particleCount: 100, spread: 70, origin: { y: 0.6 } });
}

function claimReward() {
    alert("You've claimed your $8 reward!");
    window.location.href = 'surveys.html'; // Redirects to a page or link for rewards, adjust as needed
}

document.addEventListener('DOMContentLoaded', () => {
    showQuestion(currentQuestion);
});
