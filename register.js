document.addEventListener('DOMContentLoaded', () => {
    generateUniqueCode();
    const form = document.getElementById('registerForm');
    form.addEventListener('submit', (event) => {
        event.preventDefault();
        const username = document.getElementById('username').value;
        const uniqueCode = document.getElementById('uniqueCode').value;
        const user = {
            username: username,
            uniqueCode: uniqueCode,
            balance: 0
        };
        localStorage.setItem('user', JSON.stringify(user));
        document.getElementById('confirmationMessage').style.display = 'block';
        setTimeout(() => {
            window.location.href = 'welcome.html';
        }, 2000);
    });
});

function generateUniqueCode() {
    const code = generateRandomString(16);
    document.getElementById('uniqueCode').value = code;
}

function generateRandomString(length) {
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let result = '';
    for (let i = 0; i < length; i++) {
        result += characters.charAt(Math.floor(Math.random() * characters.length));
    }
    return result;
}

function copyToClipboard() {