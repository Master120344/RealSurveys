Thank you for confirming—the `surveys_desktop.js` file in Cloud Shell is empty, which explains why the file on Bluehost is also empty or incomplete after the `scp` upload. This likely happened because the `cat > ~/surveys_desktop.js << 'EOF'` command didn’t complete properly during the last attempt, possibly due to an issue with pasting the code or terminating the command with `EOF`. Let’s recreate the file in Cloud Shell with the full, corrected JavaScript code.

---

### Step 67: Recreate `js/surveys_desktop.js` in Cloud Shell

#### Command 1: Create the Corrected `js/surveys_desktop.js` File
- In Cloud Shell (at the prompt `john [ ~ ]$`), run:
  ```bash
  cat > ~/surveys_desktop.js << 'EOF'
  ```
- Paste the following JavaScript code, press Enter to ensure there’s a new line, then type `EOF` on its own line and press Enter:
  ```
document.addEventListener('DOMContentLoaded', () => {
    const themeToggle = document.getElementById('theme-toggle');
    const userEmail = document.getElementById('user-email');
    const currentBalance = document.getElementById('current-balance');
    const logoutBtn = document.getElementById('logout-btn');
    const surveysContainer = document.querySelector('.surveys-container');
    const paginationContainer = document.querySelector('.pagination');

    // AOS Initialization
    AOS.init({
        duration: 1000,
        once: true,
        easing: 'ease-in-out'
    });

    // Particles.js Configuration
    particlesJS('particles-js', {
        particles: {
            number: { value: 80, density: { enable: true, value_area: 800 } },
            color: { value: '#34d399' },
            shape: { type: 'circle' },
            opacity: { value: 0.5, random: true },
            size: { value: 3, random: true },
            line_linked: { enable: true, distance: 150, color: '#34d399', opacity: 0.4, width: 1 },
            move: { enable: true, speed: 2, direction: 'none', random: false }
        },
        interactivity: {
            detect_on: 'canvas',
            events: { onhover: { enable: true, mode: 'repulse' }, onclick: { enable: true, mode: 'push' } },
            modes: { repulse: { distance: 100 }, push: { particles_nb: 4 } }
        },
        retina_detect: true
    });

    // Theme Toggle
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

    // Static User Data (since Firebase is removed)
    userEmail.textContent = 'Guest User'; // Placeholder, no auth now
    currentBalance.textContent = '0.00'; // Static balance, no dynamic fetch

    // Logout Functionality (simplified, no Firebase)
    logoutBtn.addEventListener('click', () => {
        localStorage.clear(); // Clear any stored data
        window.location.href = 'login.html'; // Redirect to login page
    });

    // Navigation Button Handlers
    document.querySelectorAll('.nav-btn').forEach(button => {
        button.addEventListener('click', () => {
            const href = button.getAttribute('data-href');
            if (href) window.location.href = href;
        });
    });

    // Fetch Survey Catalog from Azure Blob Storage
    const surveyCatalogUrl = 'https://myrealsurveysstorage.blob.core.windows.net/surveys/survey-catalog.json';
    const surveysPerPage = 10; // Number of surveys per page
    let currentPage = 1;
    let allSurveys = [];

    async function fetchSurveyCatalog() {
        try {
            const response = await fetch(surveyCatalogUrl, {
                method: 'GET',
                mode: 'cors', // Explicitly set CORS mode
                headers: {
                    'Accept': 'application/json',
                },
                cache: 'no-store', // Avoid caching to bypass potential proxy issues
            });
            if (!response.ok) {
                console.error('Fetch failed with status: ' + response.status + ', statusText: ' + response.statusText);
                throw new Error('Failed to fetch survey catalog: ' + response.status + ' ' + response.statusText);
            }
            allSurveys = await response.json();
            renderSurveys();
            renderPagination();
        } catch (error) {
            console.error('Detailed error fetching survey catalog:', error);
            surveysContainer.innerHTML = '<p style="color: red;">Failed to load surveys: ' + error.message + '. Please try again later or contact support.</p>';
        }
    }

    function renderSurveys() {
        surveysContainer.innerHTML = ''; // Clear existing content
        const start = (currentPage - 1) * surveysPerPage;
        const end = start + surveysPerPage;
        const surveysToShow = allSurveys.slice(start, end);

        surveysToShow.forEach(survey => {
            const card = document.createElement('div');
            card.classList.add('survey-card');
            card.setAttribute('data-aos', 'zoom-in');
            card.innerHTML = `
                <img src="${survey.image || 'https://via.placeholder.com/250x150'}" alt="${survey.title}" loading="lazy">
                <div class="card-content">
                    <h3>${survey.title}</h3>
                    <p>Earn $${survey.reward.toFixed(2)}</p>
                    <button class="survey-link" data-amount="${survey.reward}" data-file="${survey.file}">Take Survey</button>
                </div>
            `;
            surveysContainer.appendChild(card);
        });

        // Add event listeners to survey buttons
        const surveyButtons = document.querySelectorAll('.survey-link');
        surveyButtons.forEach(button => {
            button.addEventListener('click', async () => {
                const amount = button.getAttribute('data-amount');
                const file = button.getAttribute('data-file');
                if (amount && !isNaN(parseFloat(amount))) {
                    sessionStorage.setItem('currentSurveyReward', parseFloat(amount).toFixed(2));
                    console.log('Survey button clicked, potential reward: $' + parseFloat(amount).toFixed(2) + ' stored in sessionStorage.');
                } else {
                    console.warn("Survey button clicked, but data-amount attribute is missing or invalid.", button);
                }
                // Fetch the full survey content
                try {
                    const surveyUrl = "https://myrealsurveysstorage.blob.core.windows.net/surveys/" + file;
                    const response = await fetch(surveyUrl, {
                        method: 'GET',
                        mode: 'cors',
                        headers: {
                            'Accept': 'application/json',
                        },
                        cache: 'no-store',
                    });
                    if (!response.ok) {
                        console.error('Fetch failed with status: ' + response.status + ', statusText: ' + response.statusText);
                        throw new Error('Failed to fetch survey: ' + response.status + ' ' + response.statusText);
                    }
                    const surveyData = await response.json();
                    sessionStorage.setItem('currentSurveyData', JSON.stringify(surveyData));
                    window.location.href = 'survey.html';
                } catch (error) {
                    console.error('Detailed error fetching survey:', error);
                    alert('Failed to load survey: ' + error.message);
                }
            });
        });
    }

    function renderPagination() {
        const totalPages = Math.ceil(allSurveys.length / surveysPerPage);
        paginationContainer.innerHTML = '';
        for (let i = 1; i <= totalPages; i++) {
            const pageBtn = document.createElement('a');
            pageBtn.classList.add('page-btn');
            pageBtn.setAttribute('data-page', i);
            pageBtn.textContent = i;
            if (i === currentPage) {
                pageBtn.classList.add('active');
            }
            pageBtn.addEventListener('click', (e) => {
                e.preventDefault();
                currentPage = parseInt(pageBtn.getAttribute('data-page'));
                renderSurveys();
                renderPagination();
                window.scrollTo({ top: 0, behavior: 'smooth' });
            });
            paginationContainer.appendChild(pageBtn);
        }
    }

    // Fetch surveys on page load
    fetchSurveyCatalog();
});
