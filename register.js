<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Register - RealSurveys</title>
    <style>
        /* Base Styles */
        body {
            margin: 0;
            font-family: 'Arial', sans-serif;
            background-color: #f0f2f5;
            color: #333;
        }

        header {
            background-color: #1a1a1a;
            color: #fff;
            padding: 20px 0;
            position: sticky;
            top: 0;
            z-index: 1000;
            box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
        }

        header .container {
            display: flex;
            justify-content: space-between;
            align-items: center;
            max-width: 1200px;
            margin: 0 auto;
            padding: 0 20px;
        }

        header h1 {
            margin: 0;
            font-size: 28px;
            color: #ff0000;
            text-align: left;
        }

        header h1 a {
            color: inherit;
            text-decoration: none;
        }

        header nav ul {
            list-style: none;
            margin: 0;
            padding: 0;
            display: flex;
            flex-wrap: wrap;
            justify-content: flex-end;
        }

        header nav ul li {
            margin: 0 10px;
        }

        header nav ul li a {
            color: #fff;
            text-decoration: none;
            font-size: 14px;
            padding: 10px 20px;
            border-radius: 5px;
            transition: background-color 0.3s, transform 0.3s;
        }

        header nav ul li a:hover {
            background-color: #ff0000;
            transform: scale(1.05);
        }

        .content {
            padding: 60px 20px;
            max-width: 500px;
            margin: 0 auto;
            text-align: center;
            background-color: #fff;
            box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
            border-radius: 10px;
            border: 4px solid #ff0000;
            margin-top: 50px;
        }

        .content h2 {
            font-size: 36px;
            margin-bottom: 20px;
            color: #ff0000;
        }

        .content p {
            font-size: 18px;
            line-height: 1.6;
            margin-bottom: 20px;
        }

        .content form {
            display: flex;
            flex-direction: column;
            align-items: center;
        }

        .content form input {
            width: 80%;
            padding: 10px;
            margin: 10px 0;
            border: 1px solid #ccc;
            border-radius: 5px;
            font-size: 16px;
        }

        .content form button {
            padding: 10px 20px;
            background-color: #ff0000;
            color: #fff;
            border: none;
            border-radius: 5px;
            cursor: pointer;
            transition: background-color 0.3s, transform 0.3s;
        }

        .content form button:hover {
            background-color: darkred;
            transform: scale(1.05);
        }

        .warning {
            color: red;
            font-size: 14px;
        }

        .confirmation-message {
            display: none;
            color: green;
            margin-top: 20px;
        }

        .copy-box {
            display: flex;
            align-items: center;
            margin-top: 10px;
        }

        .copy-box input {
            flex: 1;
            margin-right: 10px;
        }

        footer {
            background-color: #1a1a1a;
            color: #fff;
            padding: 20px 0;
            text-align: center;
            margin-top: 50px;
        }

        footer .container {
            display: flex;
            flex-direction: column;
            align-items: center;
        }

        footer p {
            margin: 0;
        }

        footer .social {
            margin-top: 10px;
        }

        footer .social a {
            color: #fff;
            margin: 0 10px;
            font-size: 18px;
            text-decoration: none;
            transition: color 0.3s;
        }

        footer .social a:hover {
            color: #ff0000;
        }

        /* Mobile Styles */
        @media (max-width: 768px) {
            header .container {
                flex-direction: column;
            }

            header nav ul {
                justify-content: center;
                flex-wrap: wrap;
            }

            header nav ul li {
                margin: 5px;
            }

            .content {
                padding: 20px;
            }

            .content h2 {
                font-size: 28px;
            }

            .content p {
                font-size: 16px;
            }

            footer .container {
                padding: 0 20px;
            }
        }
    </style>
    <meta http-equiv="Content-Security-Policy" content="default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline'; img-src 'self' data:; font-src 'self';">
</head>
<body>
    <header>
        <div class="container">
            <h1><a href="index.html">RealSurveys</a></h1>
            <nav>
                <ul class="nav">
                    <li><a href="index.html">Home</a></li>
                    <li><a href="about.html">About Us</a></li>
                    <li><a href="contact.html">Contact</a></li>
                    <li><a href="daily-giveaways.html">Daily Giveaways</a></li>
                    <li><a href="leading-platform.html">Leading Platform</a></li>
                    <li><a href="referral-program.html">Referral Program</a></li>
                    <li><a href="register.html">Register</a></li>
                </ul>
            </nav>
        </div>
    </header>

    <section class="content">
        <div class="container">
            <h2>Register</h2>
            <p>Choose a username and save your unique login code. This is the only way to log in, and it is unrecoverable if lost!</p>
            <form id="registerForm">
                <input type="text" id="username" placeholder="Enter your username" required oninput="checkUsernameAvailability()">
                <div id="usernameStatus"></div>
                <div class="copy-box">
                    <input type="text" id="uniqueCode" readonly>
                    <button type="button" onclick="copyToClipboard()">Copy</button>
                </div>
                <p class="warning">Warning: This code is your only way to log in. It is unrecoverable if lost.</p>
                <button type="submit">Save Code</button>
            </form>
            <p id="confirmationMessage" class="confirmation-message">Registration successful! Redirecting to the welcome page...</p>
        </div>
    </section>

    <footer>
        <div class="container">
            <p>&copy; 2024 RealSurveys. All rights reserved.</p>
            <div class="social">
                <a href="#"><i class="fab fa-facebook-f"></i></a>
                <a href="#"><i class="fab fa-twitter"></i></a>
                <a href="#"><i class="fab fa-instagram"></i></a>
                <a href="#"><i class="fab fa-linkedin-in"></i></a>
            </div>
        </div>
    </footer>

    <script>
        document.addEventListener('DOMContentLoaded', () => {
            generateUniqueCode();
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
            const copyText = document.getElementById('uniqueCode');
            copyText.select();
            copyText.setSelectionRange(0, 99999); // For mobile devices
            document.execCommand('copy');
            alert('Unique code copied to clipboard.');
        }

        function checkUsernameAvailability() {
            const username = document.getElementById('username').value;
            const usernameStatus = document.getElementById('usernameStatus');

            // Simulate an API call to check username availability
            const availableUsernames = ['user1', 'user2', 'user3']; // Example list
            if (availableUsernames.includes(username)) {
                usernameStatus.innerHTML = '<