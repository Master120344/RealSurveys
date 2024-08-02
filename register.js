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

        .hero {
            background-color: #ff0000;
            height: 200px;
            display: flex;
            justify-content: center;
            align-items: center;
            text-align: center;
            color: #fff;
            position: relative;
        }

        .hero h2 {
            position: relative;
            font-size: 36px;
            margin: 0;
            z-index: 1;
        }

        .register {
            padding: 60px 20px;
            max-width: 1000px;
            margin: 0 auto;
            text-align: center;
            background-color: #fff;
            box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
            border-radius: 10px;
            border: 4px solid #ff0000;
            margin-top: -50px;
            position: relative;
            z-index: 2;
        }

        .register h2 {
            font-size: 36px;
            margin-bottom: 20px;
            color: #ff0000;
        }

        .register form {
            background: #333;
            padding: 20px;
            border-radius: 10px;
            display: inline-block;
            text-align: left;
            width: 100%;
        }

        .register label {
            display: block;
            text-align: left;
            margin: 10px 0 5px;
            color: #ff0000;
        }

        .register input {
            width: calc(100% - 20px);
            padding: 10px;
            margin: 10px 0;
            border: none;
            border-radius: 5px;
            box-sizing: border-box;
        }

        .register button {
            padding: 10px 20px;
            background: #ff0000;
            border: none;
            border-radius: 5px;
            cursor: pointer;
            width: 100%;
            margin-top: 10px;
        }

        .register button:hover {
            background: darkred;
        }

        .confirmation-message {
            display: none;
            background-color: #d4edda;
            color: #155724;
            border: 1px solid #c3e6cb;
            padding: 15px;
            border-radius: 5px;
            margin-top: 20px;
        }

        footer {
            background-color: #1a1a1a;
            color: #fff;
            padding: 20px 0;
            text-align: center;
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

            .register {
                padding: 20px;
            }

            .register h2 {
                font-size: 28px;
            }

            .register form {
                padding: 20px;
            }

            .register label,
            .register input,
            .register button {
                font-size: 16px;
            }

            footer .container {
                padding: 0 20px;
            }
        }
    </style>
    <script src="register.js" defer></script>
    <script src="https://kit.fontawesome.com/a076d05399.js" crossorigin="anonymous"></script>
    <meta http-equiv="Content-Security-Policy" content="default-src 'self'; script-src 'self' https://kit.fontawesome.com; style-src 'self' 'unsafe-inline'; img-src 'self' data:; font-src 'self' https://kit.fontawesome.com;">
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

    <div class="hero">
        <h2>Register</h2>
    </div>

    <section class="register">
        <div class="container">
            <h2>Register</h2>
            <form id="registerForm">
                <label for="username">Username</label>
                <input type="text" id="username" name="username" required>
                <label for="password">Password</label>
                <input type="password" id="password" name="password" required>
                <label for="email">Email</label>
                <input type="email" id="email" name="email" required>
                <button type="submit">Register</button>
            </form>
            <div class="confirmation-message" id="confirmationMessage">
                Registration successful! Redirecting to the welcome page...
            </div>
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
</body>
</html>