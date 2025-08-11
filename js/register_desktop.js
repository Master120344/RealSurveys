document.addEventListener('DOMContentLoaded', () => {
    AOS.init({
        duration: 1500,
        once: true,
        easing: 'ease-in-out'
    });

    window.addEventListener('load', () => {
        const preloader = document.getElementById('preloader');
        setTimeout(() => {
            preloader.style.opacity = '0';
            setTimeout(() => preloader.style.display = 'none', 500);
        }, 1000);
    });

    const particlesConfig = {
        particles: {
            number: { value: window.innerWidth > 768 ? 120 : 60, density: { enable: true, value_area: 1400 } },
            color: { value: '#34d399' },
            shape: { type: ['circle', 'triangle', 'edge'], polygon: { nb_sides: 5 } },
            opacity: { value: 0.8, random: true },
            size: { value: 6, random: true },
            line_linked: { enable: false },
            move: { enable: true, speed: 5, direction: 'none', random: true }
        },
        interactivity: {
            detect_on: 'canvas',
            events: { onhover: { enable: true, mode: 'repulse' }, onclick: { enable: true, mode: 'push' } },
            modes: { repulse: { distance: 140 }, push: { particles_nb: 6 } }
        },
        retina_detect: true
    };

    if (document.getElementById('particles-js')) {
        particlesJS('particles-js', particlesConfig);
    }

    const header = document.querySelector('.parallax-header');
    window.addEventListener('scroll', () => {
        const scrollPos = window.scrollY;
        header.style.backgroundPositionY = `${scrollPos * 0.5}px`;
    });

    const themeToggleBtn = document.getElementById('theme-toggle');
    const body = document.body;

    function applyTheme(theme) {
        if (theme === 'light') {
            body.classList.add('light-mode');
            if (themeToggleBtn) themeToggleBtn.innerHTML = '<i class="fas fa-sun"></i>';
        } else {
            body.classList.remove('light-mode');
            if (themeToggleBtn) themeToggleBtn.innerHTML = '<i class="fas fa-moon"></i>';
        }
    }
    const savedTheme = localStorage.getItem('theme') || 'dark';
    applyTheme(savedTheme);
    if (themeToggleBtn) {
        themeToggleBtn.addEventListener('click', () => {
            const isLight = body.classList.toggle('light-mode');
            const newTheme = isLight ? 'light' : 'dark';
            applyTheme(newTheme);
            localStorage.setItem('theme', newTheme);
        });
    }

    document.querySelectorAll('.nav-btn').forEach(button => {
        button.addEventListener('click', (e) => {
            e.preventDefault();
            const href = button.getAttribute('data-href');
            if (href) window.location.href = href;
        });
    });

    document.querySelectorAll('.toggle-password').forEach(toggle => {
        toggle.addEventListener('click', () => {
            const input = toggle.previousElementSibling;
            const isPassword = input.type === 'password';
            input.type = isPassword ? 'text' : 'password';
            toggle.querySelector('i').classList.toggle('fa-eye', isPassword);
            toggle.querySelector('i').classList.toggle('fa-eye-slash', !isPassword);
        });
    });

    const passwordInput = document.getElementById('password');
    const confirmPasswordInput = document.getElementById('confirmPassword');
    const strengthLevel = document.querySelector('.strength-level');
    const passwordFeedback = document.getElementById('password-feedback');
    const confirmPasswordFeedback = document.getElementById('confirm-password-feedback');

    const passwordRequirements = {
        length: password => password.length >= 12,
        uppercase: password => /[A-Z]/.test(password),
        lowercase: password => /[a-z]/.test(password),
        number: password => /[0-9]/.test(password),
        special: password => /[!@#$%^&*(),.?":{}|<>]/.test(password)
    };

    function calculatePasswordStrength(password) {
        let score = 0;
        const requirementsMet = [];

        if (passwordRequirements.length(password)) {
            score++;
            requirementsMet.push('length');
        }
        if (passwordRequirements.uppercase(password)) {
            score++;
            requirementsMet.push('uppercase');
        }
        if (passwordRequirements.lowercase(password)) {
            score++;
            requirementsMet.push('lowercase');
        }
        if (passwordRequirements.number(password)) {
            score++;
            requirementsMet.push('number');
        }
        if (passwordRequirements.special(password)) {
            score++;
            requirementsMet.push('special');
        }

        return { score, requirementsMet };
    }

    function updatePasswordFeedback(password) {
        const { score, requirementsMet } = calculatePasswordStrength(password);

        if (password.length === 0) {
            strengthLevel.className = 'strength-level';
            passwordFeedback.style.display = 'none';
        } else if (score <= 2) {
            strengthLevel.className = 'strength-level weak';
            passwordFeedback.style.display = 'block';
            passwordFeedback.className = 'feedback-message';
            const missing = [];
            if (!requirementsMet.includes('length')) missing.push('at least 12 characters');
            if (!requirementsMet.includes('uppercase')) missing.push('an uppercase letter');
            if (!requirementsMet.includes('lowercase')) missing.push('a lowercase letter');
            if (!requirementsMet.includes('number')) missing.push('a number');
            if (!requirementsMet.includes('special')) missing.push('a special character');
            passwordFeedback.textContent = `Password must include ${missing.join(', ')}.`;
        } else if (score <= 4) {
            strengthLevel.className = 'strength-level medium';
            passwordFeedback.style.display = 'block';
            passwordFeedback.className = 'feedback-message';
            const missing = [];
            if (!requirementsMet.includes('length')) missing.push('at least 12 characters');
            if (!requirementsMet.includes('uppercase')) missing.push('an uppercase letter');
            if (!requirementsMet.includes('lowercase')) missing.push('a lowercase letter');
            if (!requirementsMet.includes('number')) missing.push('a number');
            if (!requirementsMet.includes('special')) missing.push('a special character');
            if (missing.length > 0) {
                passwordFeedback.textContent = `Password must include ${missing.join(', ')}.`;
            } else {
                passwordFeedback.textContent = 'Password is medium strength.';
            }
        } else {
            strengthLevel.className = 'strength-level strong';
            passwordFeedback.style.display = 'block';
            passwordFeedback.className = 'feedback-message success';
            passwordFeedback.textContent = 'Password is strong!';
        }
    }

    function updateConfirmPasswordFeedback() {
        const password = passwordInput.value;
        const confirmPassword = confirmPasswordInput.value;
        if (confirmPassword.length === 0) {
            confirmPasswordFeedback.style.display = 'none';
        } else if (password !== confirmPassword) {
            confirmPasswordFeedback.style.display = 'block';
            confirmPasswordFeedback.className = 'feedback-message';
            confirmPasswordFeedback.textContent = 'Passwords do not match.';
        } else {
            confirmPasswordFeedback.style.display = 'block';
            confirmPasswordFeedback.className = 'feedback-message success';
            confirmPasswordFeedback.textContent = 'Passwords match!';
        }
    }

    if (passwordInput && strengthLevel && passwordFeedback) {
        passwordInput.addEventListener('input', () => {
            updatePasswordFeedback(passwordInput.value);
            updateConfirmPasswordFeedback();
        });
    }

    if (confirmPasswordInput && confirmPasswordFeedback) {
        confirmPasswordInput.addEventListener('input', updateConfirmPasswordFeedback);
    }

    const registerForm = document.getElementById('registerForm');
    const registerMessage = document.getElementById('registerMessage');

    if (registerForm && registerMessage) {
        registerForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const email = document.getElementById('email').value.trim();
            const password = document.getElementById('password').value;
            const confirmPassword = document.getElementById('confirmPassword').value;
            const submitButton = registerForm.querySelector('.submit-btn');

            registerMessage.style.display = 'none';
            registerMessage.className = 'message';

            if (!email || !password || !confirmPassword) {
                showError('Please fill in all fields.');
                return;
            }

            const { score } = calculatePasswordStrength(password);
            if (score < 5) {
                showError('Please create a stronger password.');
                passwordInput.focus();
                return;
            }

            if (password !== confirmPassword) {
                showError('Passwords do not match.');
                confirmPasswordInput.focus();
                return;
            }

            submitButton.disabled = true;
            submitButton.textContent = 'Signing Up...';

            // Firebase configuration should be loaded from .env file on Bluehost server (public_html)
            try {
                console.log('User registered successfully (simulated)');
                showSuccess('Registration successful! Redirecting to login...');
                setTimeout(() => {
                    window.location.href = 'login_desktop.html';
                }, 1500);
            } catch (error) {
                console.error('Registration failed:', error);
                showError('An unexpected error occurred. Please try again.');
                submitButton.disabled = false;
                submitButton.textContent = 'Sign Up';
            }
        });
    }

    function showError(messageText) {
        registerMessage.textContent = messageText;
        registerMessage.className = 'message error';
        registerMessage.style.display = 'block';
    }

    function showSuccess(messageText) {
        registerMessage.textContent = messageText;
        registerMessage.className = 'message success';
        registerMessage.style.display = 'block';
    }
});

console.log("Register Desktop JS Initialized");