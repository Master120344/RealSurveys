document.addEventListener('DOMContentLoaded', () => {
    const questions = [
        {
            id: 1,
            text: 'When is the last time you visited Wendy\'s?',
            options: [
                { value: 'today', text: 'Today' },
                { value: 'this_week', text: 'This Week' },
                { value: 'this_month', text: 'This Month' },
                { value: 'longer', text: 'More Than a Month Ago' }
            ],
            next: {
                today: 2,
                this_week: 2,
                this_month: 2,
                longer: 3
            }
        },
        {
            id: 2,
            text: 'How would you rate your last experience?',
            options: [
                { value: 'excellent', text: 'Excellent' },
                { value: 'good', text: 'Good' },
                { value: 'average', text: 'Average' },
                { value: 'poor', text: 'Poor' }
            ],
            next: {
                excellent: 4,
                good: 4,
                average: 4,
                poor: 5
            }
        },
        {
            id: 3,
            text: 'What was the reason for your last visit?',
            options: [
                { value: 'dining_in', text: 'Dining In' },
                { value: 'drive_thru', text: 'Drive-Thru' },
                { value: 'delivery', text: 'Delivery' }
            ],
            next: {
                dining_in: 6,
                drive_thru: 6,
                delivery: 6
            }
        },
        {
            id: 4,
            text: 'Would you recommend Wendy\'s to a friend?',
            options: [
                { value: 'yes', text: 'Yes' },
                { value: 'no', text: 'No' }
            ],
            next: {
                yes: 7,
                no: 7
            }
        },
        {
            id: 5,
            text: 'Please provide details on your poor experience:',
            options: [],
            next: {}
        },
        {
            id: 6,
            text: 'How satisfied are you with the service?',
            options: [
                { value: 'very_satisfied', text: 'Very Satisfied' },
                { value: 'satisfied', text: 'Satisfied' },
                { value: 'neutral', text: 'Neutral' },
                { value: 'dissatisfied', text: 'Dissatisfied' }
            ],
            next: {
                very_satisfied: 7,
                satisfied: 7,
                neutral: 7,
                dissatisfied: 7
            }
        },
        {
            id: 7,
            text: 'Do you have any suggestions for improvement?',
            options: [
                { value: 'yes', text: 'Yes' },
                { value: 'no', text: 'No' }
            ],
            next: {
                yes: 8,
                no: 9
            }
        },
        {
            id: 8,
            text: 'Please provide your suggestions:',
            options: [],
            next: {}
        },
        {
            id: 9,
            text: 'Thank you for completing the survey!',
            options: [],
            next: {}
        }
    ];

    const questionContainer = document.getElementById('questionContainer');
    const nextButton = document.getElementById('nextButton');
    const backButton = document.getElementById('backButton');
    const message = document.getElementById('message');

    let currentQuestion = 1;
    let previousQuestion = [];

    function renderQuestion(questionId) {
        questionContainer.innerHTML = '';
        const question = questions.find(q => q.id === questionId);
        const questionElement = document.createElement('div');
        questionElement.classList.add('question');
        questionElement.innerHTML = `<p>${question.text}</p>`;

        if (question.options.length > 0) {
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
        } else {
            const textarea = document.createElement('textarea');
            textarea.id = 'details';
            textarea.placeholder = 'Enter your details here...';
            textarea.style.width = '100%';
            textarea.style.padding = '10px';
            textarea.style.marginTop = '10px';
            questionElement.appendChild(textarea);
        }

        questionContainer.appendChild(questionElement);

        if (questionId === 9) {
            const emailInput = document.createElement('input');
            emailInput.type = 'email';
            emailInput.id = 'emailInput';
            emailInput.placeholder = 'Enter your email address';
            emailInput.style.width = '100%';
            emailInput.style.padding = '10px';
            emailInput.style.marginTop = '10px';
            questionContainer.appendChild(emailInput);
        }

        if (questionId === 7) {
            nextButton.style.display = 'none';
        } else {
            nextButton.style.display = 'inline-block';
        }

        backButton.style.display = previousQuestion.length > 0 ? 'inline-block' : 'none';
    }

    function showMessage(text, type) {
        message.textContent = text;
        message.style.color = type === 'success' ? 'green' : 'red';
        message.style.display = 'block';
    }

    nextButton.addEventListener('click', () => {
        const selectedOption = document.querySelector('input[name="option"]:checked');
        if (selectedOption || currentQuestion === 9) {
            const question = questions.find(q => q.id === currentQuestion);
            previousQuestion.push(currentQuestion);

            if (question.id === 9 && document.getElementById('emailInput')) {
                const email = document.getElementById('emailInput').value;
                showMessage(`A password reset link has been sent to ${email}`, 'success');
                nextButton.style.display = 'none';
            } else {
                const selectedValue = selectedOption ? selectedOption.value : 'details';
                const nextQuestion = question.next[selectedValue];
                if (nextQuestion) {
                    currentQuestion = nextQuestion;
                    renderQuestion(currentQuestion);
                } else {
                    showMessage('Survey completed. Thank you for your feedback!', 'success');
                    nextButton.style.display = 'none';
                }
            }
        } else {
            showMessage('Please select an option before proceeding.', 'error');
        }
document.addEventListener('DOMContentLoaded', () => {
    const questions = [
        {
            id: 1,
            text: 'When is the last time you visited Wendy\'s?',
            options: [
                { value: 'today', text: 'Today' },
                { value: 'this_week', text: 'This Week' },
                { value: 'this_month', text: 'This Month' },
                { value: 'longer', text: 'More Than a Month Ago' }
            ],
            next: {
                today: 2,
                this_week: 2,
                this_month: 2,
                longer: 3
            }
        },
        {
            id: 2,
            text: 'How would you rate your last experience?',
            options: [
                { value: 'excellent', text: 'Excellent' },
                { value: 'good', text: 'Good' },
                { value: 'average', text: 'Average' },
                { value: 'poor', text: 'Poor' }
            ],
            next: {
                excellent: 4,
                good: 4,
                average: 4,
                poor: 5
            }
        },
        {
            id: 3,
            text: 'What was the reason for your last visit?',
            options: [
                { value: 'dining_in', text: 'Dining In' },
                { value: 'drive_thru', text: 'Drive-Thru' },
                { value: 'delivery', text: 'Delivery' }
            ],
            next: {
                dining_in: 6,
                drive_thru: 6,
                delivery: 6
            }
        },
        {
            id: 4,
            text: 'Would you recommend Wendy\'s to a friend?',
            options: [
                { value: 'yes', text: 'Yes' },
                { value: 'no', text: 'No' }
            ],
            next: {
                yes: 7,
                no: 7
            }
        },
        {
            id: 5,
            text: 'Please provide details on your poor experience:',
            options: [],
            next: {}
        },
        {
            id: 6,
            text: 'How satisfied are you with the service?',
            options: [
                { value: 'very_satisfied', text: 'Very Satisfied' },
                { value: 'satisfied', text: 'Satisfied' },
                { value: 'neutral', text: 'Neutral' },
                { value: 'dissatisfied', text: 'Dissatisfied' }
            ],
            next: {
                very_satisfied: 7,
                satisfied: 7,
                neutral: 7,
                dissatisfied: 7
            }
        },
        {
            id: 7,
            text: 'Do you have any suggestions for improvement?',
            options: [
                { value: 'yes', text: 'Yes' },
                { value: 'no', text: 'No' }
            ],
            next: {
                yes: 8,
                no: 9
            }
        },
        {
            id: 8,
            text: 'Please provide your suggestions:',
            options: [],
            next: {}
        },
        {
            id: 9,
            text: 'Thank you for completing the survey!',
            options: [],
            next: {}
        }
    ];

    const questionContainer = document.getElementById('questionContainer');
    const nextButton = document.getElementById('nextButton');
    const backButton = document.getElementById('backButton');
    const message = document.getElementById('message');

    let currentQuestion = 1;
    let previousQuestion = [];

    function renderQuestion(questionId) {
        questionContainer.innerHTML = '';
        const question = questions.find(q => q.id === questionId);
        const questionElement = document.createElement('div');
        questionElement.classList.add('question');
        questionElement.innerHTML = `<p>${question.text}</p>`;

        if (question.options.length > 0) {
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
        } else {
            const textarea = document.createElement('textarea');
            textarea.id = 'details';
            textarea.placeholder = 'Enter your details here...';
            textarea.style.width = '100%';
            textarea.style.padding = '10px';
            textarea.style.marginTop = '10px';
            questionElement.appendChild(textarea);
        }

        questionContainer.appendChild(questionElement);

        if (questionId === 9) {
            const emailInput = document.createElement('input');
            emailInput.type = 'email';
            emailInput.id = 'emailInput';
            emailInput.placeholder = 'Enter your email address';
            emailInput.style.width = '100%';
            emailInput.style.padding = '10px';
            emailInput.style.marginTop = '10px';
            questionContainer.appendChild(emailInput);
        }

        if (questionId === 7) {
            nextButton.style.display = 'none';
        } else {
            nextButton.style.display = 'inline-block';
        }

        backButton.style.display = previousQuestion.length > 0 ? 'inline-block' : 'none';
    }

    function showMessage(text, type) {
        message.textContent = text;
        message.style.color = type === 'success' ? 'green' : 'red';
        message.style.display = 'block';
    }

    nextButton.addEventListener('click', () => {
        const selectedOption = document.querySelector('input[name="option"]:checked');
        if (selectedOption || currentQuestion === 9) {
            const question = questions.find(q => q.id === currentQuestion);
            previousQuestion.push(currentQuestion);

            if (question.id === 9 && document.getElementById('emailInput')) {
                const email = document.getElementById('emailInput').value;
                showMessage(`A password reset link has been sent to ${email}`, 'success');
                nextButton.style.display = 'none';
            } else {
                const selectedValue = selectedOption ? selectedOption.value : 'details';
                const nextQuestion = question.next[selectedValue];
                if (nextQuestion) {
                    currentQuestion = nextQuestion;
                    renderQuestion(currentQuestion);
                } else {
                    showMessage('Survey completed. Thank you for your feedback!', 'success');
                    nextButton.style.display = 'none';
                }
            }
        } else {
            showMessage('Please select an option before proceeding.', 'error');
        }