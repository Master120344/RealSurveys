document.addEventListener("DOMContentLoaded", () => {
    let currentQuestion = 0;
    const questions = document.querySelectorAll(".survey-question");
    const totalQuestions = questions.length;
    const prevButton = document.getElementById("prevButton");
    const nextButton = document.getElementById("nextButton");
    const submitButton = document.getElementById("submitButton");
    const surveyForm = document.getElementById("mcdonaldsSurveyForm");
    const rewardAmount = 5; // Example reward amount

    function showQuestion(index) {
        questions.forEach((q, i) => {
            q.classList.toggle("active", i === index);
        });
        prevButton.style.display = index === 0 ? "none" : "inline-block";
        nextButton.style.display = index === totalQuestions - 1 ? "none" : "inline-block";
        submitButton.style.display = index === totalQuestions - 1 ? "inline-block" : "none";
    }

    prevButton.addEventListener("click", () => {
        if (currentQuestion > 0) {
            currentQuestion--;
            showQuestion(currentQuestion);
        }
    });

    nextButton.addEventListener("click", () => {
        if (currentQuestion < totalQuestions - 1) {
            currentQuestion++;
            showQuestion(currentQuestion);
        }
    });

    submitButton.addEventListener("click", (event) => {
        event.preventDefault();
        // Directly redirect to the surveys page to test if the redirection works.
        window.location.href = "https://master120344.github.io/RealSurveys/surveys.html";
    });

    showQuestion(currentQuestion);
});