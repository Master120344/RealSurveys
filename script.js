document.addEventListener("DOMContentLoaded", () => {
    let currentQuestion = 0;
    const questions = document.querySelectorAll(".survey-question");
    const totalQuestions = questions.length;
    const prevButton = document.getElementById("prevButton");
    const nextButton = document.getElementById("nextButton");
    const submitButton = document.getElementById("submitButton");
    const rewardAmount = document.getElementById("mcdonaldsSurveyForm") ? 5 : 3; // $5 for McDonald's, $3 for Taco Bell

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
        console.log("Claim Reward button clicked!");

        try {
            // Trigger confetti if available
            if (typeof confetti === "function") {
                confetti({
                    particleCount: 100,
                    spread: 70,
                    origin: { y: 0.6 }
                });
            }

            // Show a congratulatory message
            setTimeout(() => {
                alert(`Congratulations! You've earned $${rewardAmount}.`);
                let user = JSON.parse(localStorage.getItem('user')) || {};
                user.balance = (user.balance || 0) + rewardAmount;
                localStorage.setItem('user', JSON.stringify(user));
                // Redirect to the surveys page
                window.location.href = "https://master120344.github.io/RealSurveys/surveys.html"; // Redirect back to surveys page
            }, 2000); // 2 seconds delay for the confetti and alert

        } catch (error) {
            console.error("Error detected:", error);
            alert(`Error: ${error.message}`);
        }
    });

    showQuestion(currentQuestion);
});