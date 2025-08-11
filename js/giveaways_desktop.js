// Initialize AOS
AOS.init({
    duration: 1500,
    once: true,
    easing: 'ease-in-out',
});

// Preloader
window.addEventListener('load', () => {
    const preloader = document.getElementById('preloader');
    setTimeout(() => {
        preloader.style.opacity = '0';
        setTimeout(() => preloader.style.display = 'none', 500);
    }, 1000);
    startCountdowns();
});

// Particles.js Config (Survey-Themed)
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
particlesJS('particles-js', particlesConfig);

// Theme Toggle
const themeToggle = document.getElementById('theme-toggle');
themeToggle.addEventListener('click', () => {
    document.body.classList.toggle('light-mode');
    themeToggle.innerHTML = document.body.classList.contains('light-mode') 
        ? '<i class="fas fa-sun"></i>' 
        : '<i class="fas fa-moon"></i>';
    localStorage.setItem('theme', document.body.classList.contains('light-mode') ? 'light' : 'dark');
});

if (localStorage.getItem('theme') === 'light') {
    document.body.classList.add('light-mode');
    themeToggle.innerHTML = '<i class="fas fa-sun"></i>';
}

// Navigation Toggle
const navToggle = document.querySelector('.nav-toggle');
const navMenu = document.querySelector('.nav-menu');
navToggle.addEventListener('click', () => {
    navMenu.classList.toggle('active');
});

document.querySelectorAll('.nav-btn').forEach(button => {
    button.addEventListener('click', () => {
        const href = button.getAttribute('data-href');
        if (href) window.location.href = href;
    });
});

// Countdown Timers
function startCountdowns() {
    const weeklyEnd = new Date('April 11, 2025 18:00:00').getTime();
    const monthlyEnd = new Date('April 26, 2025 20:00:00').getTime();

    const weeklyCountdown = document.getElementById('weekly-countdown');
    const monthlyCountdown = document.getElementById('monthly-countdown');

    const updateCountdown = (endTime, element) => {
        const interval = setInterval(() => {
            const now = new Date().getTime();
            const distance = endTime - now;

            const days = Math.floor(distance / (1000 * 60 * 60 * 24));
            const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
            const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
            const seconds = Math.floor((distance % (1000 * 60)) / 1000);

            if (distance < 0) {
                clearInterval(interval);
                element.textContent = 'Draw Live Now!';
            } else {
                element.textContent = `Time Remaining: ${days}d ${hours}h ${minutes}m ${seconds}s`;
            }
        }, 1000);
    };

    updateCountdown(weeklyEnd, weeklyCountdown);
    updateCountdown(monthlyEnd, monthlyCountdown);
}

// Poll Functionality (Simulated)
const pollSubmit = document.getElementById('poll-submit');
pollSubmit.addEventListener('click', () => {
    const selectedOption = document.querySelector('input[name="poll"]:checked');
    if (selectedOption) {
        showModal('Thank you for voting! Here are the current results:');
        // Simulate poll results
        const bar1 = document.getElementById('bar-option1');
        const bar2 = document.getElementById('bar-option2');
        const bar3 = document.getElementById('bar-option3');
        const result1 = Math.floor(Math.random() * 60) + 20; // Random between 20-80%
        const result2 = Math.floor(Math.random() * (80 - result1)) + 10; // Random between 10-(80-result1)%
        const result3 = 100 - result1 - result2; // Remaining percentage
        bar1.style.width = `${result1}%`;
        bar1.textContent = `${result1}%`;
        bar2.style.width = `${result2}%`;
        bar2.textContent = `${result2}%`;
        bar3.style.width = `${result3}%`;
        bar3.textContent = `${result3}%`;
        pollSubmit.disabled = true;
    } else {
        showModal('Please select an option to vote.');
    }
});

// Referral Button (Simulated)
const referButton = document.querySelector('.refer-button');
referButton.addEventListener('click', () => {
    showModal('Referral link copied! Share with friends to earn 50 tickets per referral.');
    const ticketCount = document.getElementById('ticket-count');
    ticketCount.textContent = parseInt(ticketCount.textContent) + 50; // Simulate adding tickets
});

// Modal
function showModal(message) {
    const modal = document.getElementById('alert-modal');
    const modalMessage = document.getElementById('modal-message');
    modalMessage.textContent = message;
    modal.style.display = 'block';
}

document.querySelector('.modal-close').addEventListener('click', () => {
    document.getElementById('alert-modal').style.display = 'none';
});

// Scroll-to-Top Button
const scrollTopBtn = document.createElement('button');
scrollTopBtn.innerHTML = '<i class="fas fa-arrow-up"></i>';
scrollTopBtn.className = 'scroll-top-btn';
document.body.appendChild(scrollTopBtn);

window.addEventListener('scroll', () => {
    scrollTopBtn.style.display = window.scrollY > 300 ? 'block' : 'none';
});

scrollTopBtn.addEventListener('click', () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
});

// Parallax Effect
const header = document.querySelector('.parallax-header');
window.addEventListener('scroll', () => {
    const scrollPos = window.scrollY;
    header.style.backgroundPositionY = `${scrollPos * 0.5}px`;
});

// Lazy Loading
document.querySelectorAll('img').forEach(img => {
    img.setAttribute('loading', 'lazy');
});