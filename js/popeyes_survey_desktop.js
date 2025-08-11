const questions = [
    {
        question: "How often do you visit Popeyes?",
        options: ["Daily", "Weekly", "Monthly", "Rarely"],
        type: "radio",
        name: "visitFrequency"
    },
    {
        question: "What menu items do you order the most?",
        options: ["Chicken", "Biscuits", "Fries", "Drinks"],
        type: "checkbox",
        name: "menuItem"
    },
    {
        question: "How satisfied are you with the quality of the food?",
        options: ["Very Satisfied", "Satisfied", "Neutral", "Dissatisfied", "Very Dissatisfied"],
        type: "radio",
        name: "foodQuality"
    },
    {
        question: "Do you have any suggestions for improving our service?",
        type: "textarea",
        name: "suggestions"
    }
];

let currentQuestion = 0;

function displayQuestion() {
    if (currentQuestion >= questions.length) {
        document.getElementById('questionContainer').innerHTML = "<p>Thank you for completing the survey!</p>";
        document.getElementById('nextButton').style.display = 'none';
        document.getElementById('backButton').style.display = 'none';
        return;
    }

    const q = questions[currentQuestion];
    let optionsHtml = '';

    if (q.type === "radio" || q.type === "checkbox") {
        optionsHtml = q.options.map((option, index) => `
            <label>
                <input type="${q.type}" name="${q.name}" value="${option}" ${q.type === "radio" ? 'required' : ''}>
                ${option}
            </label>
        `).join('<br>');
    } else if (q.type === "textarea") {
        optionsHtml = `<textarea name="${q.name}" rows="4" cols="50"></textarea>`;
    }

    document.getElementById('questionContainer').innerHTML = `
        <h2>${q.question}</h2>
        ${optionsHtml}
    `;

    document.getElementById('backButton').style.display = currentQuestion > 0 ? 'inline-block' : 'none';
    document.getElementById('message').innerText = '';
}

function nextQuestion() {
    if (validateCurrentQuestion()) {
        currentQuestion++;
        displayQuestion();
    } else {
        document.getElementById('message').innerText = 'Please complete the current question before proceeding.';
    }
}

function validateCurrentQuestion() {
    const q = questions[currentQuestion];
    const inputs = document.querySelectorAll(`input[name="${q.name}"], textarea[name="${q.name}"]`);

    if (q.type === "radio") {
        return Array.from(inputs).some(input => input.checked);
    } else if (q.type === "checkbox") {
        return Array.from(inputs).some(input => input.checked);
    } else if (q.type === "textarea") {
        return inputs[0].value.trim() !== '';
    }
    return false;
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