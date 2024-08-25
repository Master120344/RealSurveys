const questions = [
    {
        id: 1,
        text: 'When was the last time you visited Wendy\'s?',
        options: [
            { value: 'Today', text: 'Today' },
            { value: 'This week', text: 'This week' },
            { value: 'This month', text: 'This month' },
            { value: 'More than a month ago', text: 'More than a month ago' }
        ],
        next: {
            'Today': 2,
            'This week': 2,
            'This month': 3,
            'More than a month ago': 4
        }
    },
    {
        id: 2,
        text: 'How satisfied are you with the service?',
        options: [
            { value: 'Very satisfied', text: 'Very satisfied' },
            { value: 'Somewhat satisfied', text: 'Somewhat satisfied' },
            { value: 'Neutral', text: 'Neutral' },
            { value: 'Somewhat dissatisfied', text: 'Somewhat dissatisfied' },
            { value: 'Very dissatisfied', text: 'Very dissatisfied' }
        ],
        next: {
            'Very satisfied': 5,
            'Somewhat satisfied': 5,
            'Neutral': 5,
            'Somewhat dissatisfied': 5,
            'Very dissatisfied': 6
        }
    },
    {
        id: 3,
        text: 'What was the main reason for your visit?',
        options: [
            { value: 'Lunch', text: 'Lunch' },
            { value: 'Dinner', text: 'Dinner' },
            { value: 'Snacks', text: 'Snacks' },
            { value: 'Other', text: 'Other' }
        ],
        next: {
            'Lunch': 7,
            'Dinner': 7,
            'Snacks': 7,
            'Other': 7
        }
    },
    {
        id: 4,
        text: 'What would make you visit Wendy\'s more often?',
        options: [
            { value: 'Better prices', text: 'Better prices' },
            { value: 'More variety', text: 'More variety' },
            { value: 'Better quality', text: 'Better quality' },
            { value: 'Other', text: 'Other' }
        ],
        next: {
            'Better prices': 7,
            'More variety': 7,
            'Better quality': 7,
            'Other': 7
        }
    },
    {
        id: 5,
        text: 'How likely are you to recommend Wendy\'s to a friend?',
        options: [
            { value: 'Very likely', text: 'Very likely' },
            { value: 'Somewhat likely', text: 'Somewhat likely' },
            { value: 'Not sure', text: 'Not sure' },
            { value: 'Somewhat unlikely', text: 'Somewhat unlikely' },
            { value: 'Very unlikely', text: 'Very unlikely' }
        ],
        next: {
            'Very likely': 8,
            'Somewhat likely': 8,
            'Not sure': 8,
            'Somewhat unlikely': 8,
            'Very unlikely': 9
        }
    },
    {
        id: 6,
        text: 'What can Wendy\'s do to improve your experience?',
        options: [
            { value: 'Improve food quality', text: 'Improve food quality' },
            { value: 'Improve service speed', text: 'Improve service speed' },
            { value: 'Add more menu items', text: 'Add more menu items' },
            { value: 'Other', text: 'Other' }
        ],
        next: {
            'Improve food quality': 9,
            'Improve service speed': 9,
            'Add more menu items': 9,
            'Other': 9
        }
    },
    {
        id: 7,
        text: 'Would you like to provide any additional feedback?',
        options: [
            { value: 'Yes', text: 'Yes' },
            { value: 'No', text: 'No' }
        ],
        next: {
            'Yes': 10,
            'No': 11
        }
    },
    {
        id: 8,
        text: 'Thank you for your feedback! Would you like to leave your email for further communication?',
        options: [
            { value: 'Yes', text: 'Yes' },
            { value: 'No', text: 'No' }
        ],
        next: {
            'Yes': 12,
            'No': 13
        }
    },
    {
        id: 9,
        text: 'Thank you for your feedback!',
        options: [],
        next: {}
    },
    {
        id: 10,
        text: 'Please enter your email for further communication:',
        options: [],
        next: {}
    },
    {
        id: 11,
        text: 'Thank you for your time!',
        options: [],
        next: {}
    },
    {
        id: 12,
        text: 'A confirmation email has been sent to you.',
        options: [],
        next: {}
    },
    {
        id: 13,
        text: 'Thank you for your feedback!',
        options: [],
        next: {}
    }
];

document.addEventListener('DOMContentLoaded', () => {
    const questionContainer = document.getElementById('questionContainer');
    const backButton = document.getElementById('backButton');
    const nextButton = document.getElementById('nextButton');
    const message = document.getElementById('message');
    let currentQuestion = 1;
    let previousQuestion = [];

    function renderQuestion(questionId) {
        const question = questions.find(q => q.id === questionId);
        questionContainer.innerHTML = '';
        message.innerHTML = '';
        message.style.display = 'none';
        
        const questionElement = document.createElement('div');
        questionElement.classList.add('question');
        
        const questionText = document.createElement('p');
        questionText.textContent = question.text;
        questionElement.appendChild(questionText);

        question.options.forEach(option => {
            const label = document.createElement('label');
            const input = document.createElement('input');
            input.type = 'radio';
            input.name = 'option';
            input.value = option.value;
            input.id = option.value;
            
            const span = document.createElement('span');
            span.textContent = option.text;
            
            label.appendChild(input);
            label.appendChild(span);
            questionElement.appendChild(label);
        });

        questionContainer.appendChild(questionElement);
        
        if (questionId === 10) {
            // Email input for further communication
            const emailInput = document.createElement('input');
            emailInput.type = 'email';
            emailInput.id = 'emailInput';
            emailInput.placeholder = 'Enter your email address';
            emailInput.style.width = '100%';
            emailInput.style.padding = '10px';
            emailInput.style.marginTop = '10px';
            questionContainer.appendChild(emailInput);
        }
        
        if (questionId === 9 || questionId === 11 || questionId === 12) {
            nextButton.style.display = 'none';
        } else {
            nextButton.style.display = 'inline-block';
        }
    }

    function showMessage(text, type) {
        message.textContent = text;
        message.style.color = type === 'success' ? 'green' : 'red';
        message.style.display = 'block';
    }

    nextButton.addEventListener('click', () => {
        const selectedOption = document.querySelector('input[name="option"]:checked');
        if (selectedOption) {
            const selectedValue = selectedOption.value;
            const question = questions.find(q => q.id === currentQuestion);
            previousQuestion.push(currentQuestion);

            if (question.next[selectedValue]) {
                currentQuestion = question.next[selectedValue];
                renderQuestion(currentQuestion);
                backButton.style.display = previousQuestion.length > 0 ? 'inline-block' : 'none';
            } else {
                showMessage('Survey completed. Thank you for your feedback!', 'success');
                nextButton.style.display = 'none';
            }
        } else {
            showMessage('Please select an option before proceeding.', 'error');
        }
    });

    backButton.addEventListener('click', () => {
        if (previousQuestion.length > 0) {
            currentQuestion = previousQuestion.pop();
            renderQuestion(currentQuestion);
            backButton.style.display = previousQuestion.length > 0 ? 'inline-block' : 'none';
        }
    });

    renderQuestion(currentQuestion);
});