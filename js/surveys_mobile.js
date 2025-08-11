// AOS Initialization - Mobile Friendly
AOS.init({ duration: 800, once: true, offset: 50 });

// Particles.js for Header Background - Mobile Optimized
const particlesHeaderConfigMobile = {
    particles: {
        number: { value: 35, density: { enable: true, value_area: 800 } },
        color: { value: '#66bb6a' },
        shape: { type: 'circle' },
        opacity: { value: 0.35, random: true },
        size: { value: 2, random: true },
        line_linked: { enable: true, distance: 90, color: '#66bb6a', opacity: 0.2, width: 1 },
        move: { enable: true, speed: 1.2, direction: 'none', random: false }
    },
    interactivity: {
        events: { onhover: { enable: false }, onclick: { enable: false } },
        modes: { push: { particles_nb: 1 } }
    },
    retina_detect: true
};
if (document.getElementById('particles-js')) {
    particlesJS('particles-js', particlesHeaderConfigMobile);
}

// Preloader
window.addEventListener('load', () => {
    const preloader = document.getElementById('preloader');
    setTimeout(() => {
        preloader.style.opacity = '0';
        setTimeout(() => preloader.style.display = 'none', 500);
    }, 1000);
});

// Theme Toggle Logic
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
const savedTheme = localStorage.getItem('theme');
applyTheme(savedTheme || 'dark');
themeToggleBtn.addEventListener('click', () => {
    const isLight = body.classList.toggle('light-mode');
    const newTheme = isLight ? 'light' : 'dark';
    applyTheme(newTheme);
    localStorage.setItem('theme', newTheme);
});

// Mobile Navigation Toggle
const navToggleBtn = document.querySelector('.nav-toggle');
const navMenu = document.querySelector('.nav-menu');
if (navToggleBtn && navMenu) {
    navToggleBtn.addEventListener('click', () => {
        const isActive = navMenu.classList.toggle('active');
        navToggleBtn.setAttribute('aria-expanded', isActive);
        navToggleBtn.innerHTML = isActive ? '<i class="fas fa-times"></i> Menu' : '<i class="fas fa-ellipsis-v"></i> Menu';
    });

    document.addEventListener('click', (event) => {
        if (!navMenu.contains(event.target) && !navToggleBtn.contains(event.target) && navMenu.classList.contains('active')) {
            navMenu.classList.remove('active');
            navToggleBtn.setAttribute('aria-expanded', 'false');
            navToggleBtn.innerHTML = '<i class="fas fa-ellipsis-v"></i> Menu';
        }
    });
}

// Navigation Button Handlers
document.querySelectorAll('.nav-btn').forEach(button => {
    button.addEventListener('click', () => {
        const href = button.getAttribute('data-href');
        if (href) {
            window.location.href = href;
        }
    });
});

// Fetch Survey Catalog from Azure Blob Storage
const surveysContainer = document.querySelector('.surveys-container');
// Simplified URL since the container is public
const surveyCatalogUrl = 'https://myrealsurveysstorage.blob.core.windows.net/surveys/survey-catalog.json';

async function fetchSurveyCatalog() {
    try {
        const response = await fetch(surveyCatalogUrl);
        if (!response.ok) {
            throw new Error(`Failed to fetch survey catalog: ${response.statusText}`);
        }
        const surveys = await response.json();
        renderSurveys(surveys);
    } catch (error) {
        console.error('Error fetching survey catalog:', error.message);
        surveysContainer.innerHTML = '<p style="color: red;">Failed to load surveys. Please try again later.</p>';
    }
}

function renderSurveys(surveys) {
    surveysContainer.innerHTML = ''; // Clear any existing content
    surveys.forEach(survey => {
        const card = document.createElement('div');
        card.classList.add('survey-card');
        card.setAttribute('data-survey-id', survey.surveyId);
        card.setAttribute('data-category', survey.category);
        card.innerHTML = `
            <img src="${survey.image || 'https://via.placeholder.com/250x120'}" alt="${survey.title}" loading="lazy">
            <div class="card-content">
                <h3>${survey.title}</h3>
                <p class="spots-remaining">${survey.spotsRemaining} spots left</p>
                <button class="survey-btn" data-amount="${survey.reward}" data-file="${survey.file}">Earn $${survey.reward.toFixed(2)}</button>
            </div>
        `;
        surveysContainer.appendChild(card);
    });

    // Reattach event listeners to survey buttons
    const surveyButtons = document.querySelectorAll('.survey-btn');
    surveyButtons.forEach(button => {
        button.addEventListener('click', async () => {
            const amount = button.getAttribute('data-amount');
            const file = button.getAttribute('data-file');
            if (amount && !isNaN(parseFloat(amount))) {
                sessionStorage.setItem('currentSurveyReward', parseFloat(amount).toFixed(2));
                console.log(`Survey button clicked, potential reward: $${parseFloat(amount).toFixed(2)} stored in sessionStorage.`);
            } else {
                console.warn("Survey button clicked, but data-amount attribute is missing or invalid.", button);
            }
            // Fetch the full survey content
            try {
                const surveyUrl = `https://myrealsurveysstorage.blob.core.windows.net/surveys/${file}`;
                const response = await fetch(surveyUrl);
                if (!response.ok) {
                    throw new Error(`Failed to fetch survey: ${response.statusText}`);
                }
                const surveyData = await response.json();
                sessionStorage.setItem('currentSurveyData', JSON.stringify(surveyData));
                window.location.href = '/survey.html';
            } catch (error) {
                console.error('Error fetching survey:', error.message);
                alert('Failed to load survey. Please try again later.');
            }
        });
    });
}

// Fetch surveys on page load
fetchSurveyCatalog();

// Category Filtering
const categoryItems = document.querySelectorAll('.category-list li');
categoryItems.forEach(item => {
    item.addEventListener('click', () => {
        categoryItems.forEach(i => i.classList.remove('active'));
        item.classList.add('active');
        const category = item.getAttribute('data-category');
        filterSurveysByCategory(category);
    });
});

function filterSurveysByCategory(category) {
    const surveyCards = document.querySelectorAll('.survey-card');
    surveyCards.forEach(card => {
        const cardCategory = card.getAttribute('data-category');
        if (category === 'all' || cardCategory === category) {
            card.style.display = 'flex';
        } else {
            card.style.display = 'none';
        }
    });
}

console.log("Surveys Mobile JS Initialized with Client-Side Data Fetching");
