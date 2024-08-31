document.addEventListener("DOMContentLoaded", () => {
    let currentQuestion = 0;
    const questions = document.querySelectorAll(".survey-question");
    const totalQuestions = questions.length;
    const prevButton = document.getElementById("prevButton");
    const nextButton = document.getElementById("nextButton");
    const submitButton = document.getElementById("submitButton");
    const rewardAmount = document.getElementById("survey-form") ? (document.querySelector(".survey-question").innerText.includes("McDonald's") ? 5 : 3) : 0;

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

    // Corporate form submission handling
    const form = document.getElementById('corporate-form');
    const formMessage = document.getElementById('form-message');

    form.addEventListener('submit', async (event) => {
        event.preventDefault();

        const companyName = document.getElementById('company-name').value.trim();
        const contactName = document.getElementById('contact-name').value.trim();
        const contactEmail = document.getElementById('contact-email').value.trim();
        const contactPhone = document.getElementById('contact-phone').value.trim();
        const donationAmount = document.getElementById('donation-amount').value.trim();
        const companyMessage = document.getElementById('company-message').value.trim();

        if (!validateEmail(contactEmail)) {
            formMessage.textContent = 'Please enter a valid email address.';
            return;
        }

        if (parseFloat(donationAmount) < 100) {
            formMessage.textContent = 'The minimum donation amount is $100.';
            return;
        }

        formMessage.textContent = '';

        try {
            const response = await fetch('/submit-corporate-form', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    companyName,
                    contactName,
                    contactEmail,
                    contactPhone,
                    donationAmount,
                    companyMessage
                })
            });

            const result = await response.json();

            if (response.ok) {
                form.reset();
                formMessage.textContent = 'Thank you for your registration! We will get back to you soon.';
                formMessage.style.color = 'green';
            } else {
                formMessage.textContent = result.message || 'An error occurred. Please try again.';
            }
        } catch (error) {
            formMessage.textContent = 'An error occurred. Please try again.';
        }
    });

    function validateEmail(email) {
        const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return re.test(email);
    }
});
