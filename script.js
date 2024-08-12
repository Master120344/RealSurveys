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
        window.location.href = "https://master120344.github.io/RealSurveys/surveys.html"; // Use the absolute URL
    }, 3000);
});