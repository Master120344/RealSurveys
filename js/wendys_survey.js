document.addEventListener('DOMContentLoaded', () => {
    const surveyForm = document.getElementById('surveyForm');
    const message = document.getElementById('message');

    // Questions and their follow-up questions
    const questions = [
        {
            id: 'q1',
            text: 'When was the last time you visited Wendy’s?',
            type: 'radio',
            options: [
                { value: 'Today', text: 'Today' },
                { value: 'This week', text: 'This week' },
                { value: 'This month', text: 'This month' },
                { value: 'More than a month ago', text: 'More than a month ago' }
            ],
            followUp: {
                'Today': [
                    { id: 'q2', text: 'How was your experience today?', type: 'radio', options: ['Excellent', 'Good', 'Average', 'Poor'] }
                ],
                'This week': [
                    { id: 'q3', text: 'What did you order?', type: 'text' }
                ],
                'This month': [
                    { id: 'q4', text: 'Would you visit again soon?', type: 'radio', options: ['Yes', 'No'] }
                ],
                'More than a month ago': [
                    { id: 'q5', text: 'What made you visit Wendy’s again?', type: 'text' }
                ]
            }
        },
        {
            id: 'q6',
            text: 'How likely are you to recommend Wendy’s to a friend?',
            type: 'radio',
            options: [
                { value: 'Very Likely', text: 'Very Likely' },
                { value: 'Somewhat Likely', text: 'Somewhat Likely' },
                { value: 'Neutral', text: 'Neutral' },
                { value: 'Somewhat Unlikely', text: 'Somewhat Unlikely' },
                { value: 'Very Unlikely', text: 'Very Unlikely' }
            ]
        }
    ];

    function renderQuestions(questions) {
        surveyForm.innerHTML = '';

        questions.forEach(q => {
            const container = document.createElement('div');
            container.className = 'question-container';
            
            const title = document.createElement('h2');
            title.textContent = q.text;
            container.appendChild(title);

            q.options && q.options.forEach(option => {
                const label = document.createElement('label');
                const input = document.createElement('input');
                input.type = q.type;
                input.name = q.id;
                input.value = option.value;
                label.appendChild(input);
                label.appendChild(document.createTextNode(option.text));
                container.appendChild(label);
            });

            if (q.type === 'text') {
                const textarea = document.createElement('textarea');
                textarea.name = q.id;
                container.appendChild(textarea);
            }

            surveyForm.appendChild(container);
        });

        const submitButton = document.createElement('button');
        submitButton.textContent = 'Submit';
        submitButton.onclick = handleSubmit;
        surveyForm.appendChild(submitButton);
    }

    function handleSubmit() {
        const selectedValues = [...document.querySelectorAll('input[type="radio"]:checked')].map(input => input.value);
        const textResponses = [...document.querySelectorAll('textarea')].map(textarea => textarea.value);

        let messageText = 'Thank you for your feedback!';
        let messageType = 'success';

        // Add dynamic message logic based on responses
        // This is where you would implement custom logic based on answers
        // For simplicity, just show a success message here

        message.textContent = messageText;
        message.className = `message ${messageType}`;
    }

    // Initial render
    renderQuestions(questions);
});