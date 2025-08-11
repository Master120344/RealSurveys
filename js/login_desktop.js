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
            themeToggleBtn.innerHTML = '<i class="fas fa-sun"></i>';
        } else {
            body.classList.remove('light-mode');
            themeToggleBtn.innerHTML = '<i class="fas fa-moon"></i>';
        }
    }
    const savedTheme = localStorage.getItem('theme') || 'dark';
    applyTheme(savedTheme);
    if (themeToggleBtn) {
        themeToggleBtn.addEventListener('click', (e) => {
            e.preventDefault();
            const isCurrentlyLight = body.classList.contains('light-mode');
            const newTheme = isCurrentlyLight ? 'dark' : 'light';
            applyTheme(newTheme);
            localStorage.setItem('theme', newTheme);
        });
    }

    const navButtons = document.querySelectorAll('.nav-btn');
    navButtons.forEach(button => {
        button.addEventListener('click', (e) => {
            e.preventDefault();
            const href = button.getAttribute('data-href');
            if (href) {
                window.location.href = href;
            }
        });
    });

    const loginSection = document.getElementById('loginSection');
    const forgotPasswordSection = document.getElementById('forgotPasswordSection');
    const forgotPasswordLink = document.getElementById('forgotPasswordLink');
    const backToLoginLink = document.getElementById('backToLoginLink');
    const loginForm = document.getElementById('loginForm');
    const resetPasswordBtn = document.getElementById('resetPasswordBtn');
    const loginMessage = document.getElementById('loginMessage');
    const resetMessage = document.getElementById('resetMessage');
    const resetError = document.getElementById('resetError');

    if (!loginSection || !forgotPasswordSection || !loginForm) {
        return;
    }

    if (forgotPasswordLink && backToLoginLink && loginSection && forgotPasswordSection) {
        forgotPasswordLink.addEventListener('click', (e) => {
            e.preventDefault();
            loginSection.classList.add('hidden');
            setTimeout(() => {
                loginSection.style.display = 'none';
                forgotPasswordSection.style.display = 'block';
                setTimeout(() => {
                    forgotPasswordSection.classList.add('active');
                }, 10);
            }, 300);
            if (resetMessage) resetMessage.style.display = 'none';
            if (resetError) resetError.style.display = 'none';
        });

        backToLoginLink.addEventListener('click', (e) => {
            e.preventDefault();
            forgotPasswordSection.classList.remove('active');
            setTimeout(() => {
                forgotPasswordSection.style.display = 'none';
                loginSection.style.display = 'block';
                setTimeout(() => {
                    loginSection.classList.remove('hidden');
                }, 10);
            }, 300);
            if (loginMessage) loginMessage.style.display = 'none';
        });
    }

    if (loginForm) {
        loginForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const email = document.getElementById('email').value.trim();
            const password = document.getElementById('password').value.trim();
            const submitButton = loginForm.querySelector('.submit-btn');

            loginMessage.style.display = 'none';
            loginMessage.className = 'message';

            if (!email || !password) {
                loginMessage.textContent = 'Please fill in all fields.';
                loginMessage.className = 'message error';
                loginMessage.style.display = 'block';
                return;
            }

            submitButton.disabled = true;
            submitButton.textContent = 'Logging In...';

            setTimeout(() => {
                loginMessage.textContent = 'Login successful! Redirecting...';
                loginMessage.className = 'message success';
                loginMessage.style.display = 'block';
                setTimeout(() => {
                    window.location.href = 'index_desktop.html';
                }, 1500);
            }, 1000);
        });
    }

    if (resetPasswordBtn) {
        resetPasswordBtn.addEventListener('click', (e) => {
            e.preventDefault();
            const resetEmail = document.getElementById('resetEmail').value.trim();

            resetMessage.style.display = 'none';
            resetError.style.display = 'none';

            if (!resetEmail) {
                resetError.textContent = 'Please enter your email.';
                resetError.className = 'message error';
                resetError.style.display = 'block';
                return;
            }

            setTimeout(() => {
                resetMessage.textContent = 'Reset link sent! Check your email.';
                resetMessage.className = 'message success';
                resetMessage.style.display = 'block';
            }, 1000);
        });
    }
});

console.log("Login Desktop JS Initialized");