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
        canvasConfetti({
            particleCount: 100,
            spread: 70,
            origin: { y: 0.6 }
        });
        setTimeout(() => {
            alert(`Survey completed! You have earned $${rewardAmount}.`);
            let user = JSON.parse(localStorage.getItem('user')) || {};
            user.balance = (user.balance || 0) + rewardAmount;
            localStorage.setItem('user', JSON.stringify(user));
            window.location.href = "surveys.html"; // Redirect back to surveys page
        }, 3000);
    });

    showQuestion(currentQuestion);
});