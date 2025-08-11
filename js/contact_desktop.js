// js/contact_desktop.js
document.addEventListener('DOMContentLoaded', () => {
    // AOS Initialization
    try {
        AOS.init({
            duration: 1500,
            once: true,
            easing: 'ease-in-out'
        });
    } catch (error) {
        console.error('AOS initialization failed:', error);
    }

    // Preloader
    window.addEventListener('load', () => {
        const preloader = document.getElementById('preloader');
        setTimeout(() => {
            preloader.style.opacity = '0';
            setTimeout(() => preloader.style.display = 'none', 500);
        }, 1000);
    });

    // Particles.js Configuration (Survey-Themed)
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
        try {
            particlesJS('particles-js', particlesConfig);
        } catch (error) {
            console.error('Particles.js for header failed:', error);
        }
    }

    // Parallax Effect
    const header = document.querySelector('.parallax-header');
    window.addEventListener('scroll', () => {
        const scrollPos = window.scrollY;
        header.style.backgroundPositionY = `${scrollPos * 0.5}px`;
    });

    // Theme Toggle Logic
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

    // Navigation Button Handlers
    document.querySelectorAll('.nav-btn').forEach(button => {
        button.addEventListener('click', (e) => {
            e.preventDefault();
            const href = button.getAttribute('data-href');
            if (href) window.location.href = href;
        });
    });

    // Contact Form Submission (Bluehost SMTP via PHP)
    const contactForm = document.getElementById('contactForm');
    const contactMessage = document.getElementById('contactMessage');

    if (contactForm && contactMessage) {
        contactForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const name = document.getElementById('name').value.trim();
            const email = document.getElementById('email').value.trim();
            const message = document.getElementById('message').value.trim();
            const submitButton = contactForm.querySelector('.submit-btn');

            contactMessage.style.display = 'none';
            contactMessage.className = 'message';
            submitButton.disabled = true;
            submitButton.textContent = 'Sending...';

            // Basic validation
            if (!name || !email || !message) {
                contactMessage.textContent = 'Please fill in all fields.';
                contactMessage.className = 'message error';
                contactMessage.style.display = 'block';
                submitButton.disabled = false;
                submitButton.textContent = 'Send Message';
                return;
            }

            // AJAX request to PHP
            const formData = new FormData(contactForm);
            fetch('send_email.php', {
                method: 'POST',
                body: formData
            })
            .then(response => response.json())
            .then(data => {
                if (data.success) {
                    contactMessage.textContent = data.message;
                    contactMessage.className = 'message success';
                    contactMessage.style.display = 'block';
                    contactForm.reset();
                    setTimeout(() => {
                        contactMessage.style.opacity = '0';
                        setTimeout(() => contactMessage.style.display = 'none', 300);
                    }, 5000);
                } else {
                    throw new Error(data.message);
                }
            })
            .catch(error => {
                console.error('Form submission failed:', error);
                contactMessage.textContent = 'Failed to send message. Please try again or email support@myrealsurveys.com directly.';
                contactMessage.className = 'message error';
                contactMessage.style.display = 'block';
            })
            .finally(() => {
                submitButton.disabled = false;
                submitButton.textContent = 'Send Message';
            });
        });
    } else {
        console.error('Contact form or message element not found.');
    }

    // Live Chat Widget Toggle
    const chatToggle = document.getElementById('chatToggle');
    const chatWindow = document.getElementById('chatWindow');
    const chatMinimize = document.getElementById('chatMinimize');

    if (chatToggle && chatWindow && chatMinimize) {
        chatToggle.addEventListener('click', () => {
            chatWindow.style.display = 'block';
            chatToggle.style.display = 'none';
        });

        chatMinimize.addEventListener('click', () => {
            chatWindow.style.display = 'none';
            chatToggle.style.display = 'flex';
        });
    }

    // Live Chat Form Submission (Placeholder)
    const chatForm = document.getElementById('chatForm');
    const chatMessages = document.getElementById('chatMessages');
    const chatInput = document.getElementById('chatInput');

    if (chatForm && chatMessages && chatInput) {
        chatForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const message = chatInput.value.trim();
            if (message) {
                const messageElement = document.createElement('p');
                messageElement.textContent = `You: ${message}`;
                chatMessages.appendChild(messageElement);
                chatMessages.scrollTop = chatMessages.scrollHeight;
                chatInput.value = '';
                // Placeholder auto-reply
                setTimeout(() => {
                    const autoReply = document.createElement('p');
                    autoReply.textContent = 'Support: Thanks for your message! We’ll get back to you soon.';
                    chatMessages.appendChild(autoReply);
                    chatMessages.scrollTop = chatMessages.scrollHeight;
                }, 1000);
            }
        });
    }
});

console.log("Contact Desktop JS Initialized");