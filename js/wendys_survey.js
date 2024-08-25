document.addEventListener('DOMContentLoaded', () => {
    const q1Options = document.querySelectorAll('input[name="q1"]');
    const q2 = document.getElementById('q2');
    const q3 = document.getElementById('q3');
    const submitDiv = document.getElementById('submitDiv');
    const messageDiv = document.getElementById('message');

    q1Options.forEach(option => {
        option.addEventListener('change', () => {
            handleQ1Response(option.value);
        });
    });

    function handleQ1Response(value) {
        // Hide all questions initially
        hideAllQuestions();

        // Show questions based on the answer to Question 1
        if (value === 'Today') {
            q2.classList.remove('hidden');
        } else if (value === 'This week') {
            q2.classList.remove('hidden');
        } else if (value === 'This month') {
            q2.classList.remove('hidden');
        } else if (value === 'More than a month ago') {
            q2.classList.remove('hidden');
        }

        // Additional logic for more dynamic questions can be added here
        submitDiv.classList.remove('hidden');
    }

    function hideAllQuestions() {
        document.querySelectorAll('.question').forEach(question => {
            question.classList.add('hidden');
        });
    }

    function submitSurvey() {
        // Simulate form submission and display success message
        messageDiv.textContent = 'Thank you for completing the survey! Your responses have been recorded.';
        messageDiv.classList.add('success');
        messageDiv.classList.remove('hidden');

        // Hide the form after submission
        document.getElementById('surveyForm').reset();
    }

    document.querySelector('#submitDiv button').addEventListener('click', submitSurvey);
});