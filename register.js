function registerUser(event) {
    event.preventDefault();
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;
    const email = document.getElementById('email').value;
    const user = {
        username,
        password,
        email,
        balance: 0
    };
    localStorage.setItem('user', JSON.stringify(user));
    document.querySelector('.redirecting').style.display = 'block';
    setTimeout(() => {
        window.location.href = 'welcome.html';
    }, 2000);
}