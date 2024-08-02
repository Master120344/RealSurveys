document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('registerForm');
    form.addEventListener('submit', (event) => {
        event.preventDefault();
        const username = document.getElementById('username').value;
        const password = document.getElementById('password').value;
        const email = document.getElementById('email').value;
        const user = {
            username: username,
            password: password,
            email: email,
            balance: 0
        };
        console.log("User:", user); // Debugging
        localStorage.setItem('user', JSON.stringify(user));
        document.getElementById('confirmationMessage').style.display = 'block';
        setTimeout(() => {
            window.location.href = 'https://master120344.github.io/RealSurveys/welcome.html';
        }, 2000);
    });
});