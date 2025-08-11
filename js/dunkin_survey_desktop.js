document.addEventListener('DOMContentLoaded', () => {
    const welcomeScreen = document.getElementById('welcome-screen');
    const startButton = document.getElementById('startButton');
    const surveyForm = document.getElementById('dunkinSurveyForm');
    const questionContainer = document.getElementById('question-container');
    const backButton = document.getElementById('backButton');
    const nextButton = document.getElementById('nextButton');
    const timerDisplay = document.getElementById('timeLeft');
    const timerContainer = document.getElementById('timer');
    const progressBar = document.getElementById('progressBar');
    const feedbackSection = document.getElementById('feedback-section');
    const finalFeedbackInput = document.getElementById('finalFeedback');
    const charCountDisplay = document.getElementById('char-count');
    const skipFeedbackButton = document.getElementById('skipFeedbackButton');
    const submitSurveyButton = document.getElementById('submitSurveyButton');
    const completionScreen = document.getElementById('completion-screen');
    const completionMessage = document.getElementById('completion-message');
    const themeSwitch = document.getElementById('theme-switch');
    const themeSwitchLabel = document.querySelector('.theme-switch-label');

    const TIME_PER_QUESTION = 10; // 10-second timer per question
    const MAX_FEEDBACK_CHARS = 500;
    let currentQuestionId = null;
    let userAnswers = {};
    let questionHistory = [];
    let timerInterval = null;
    let timeLeft = TIME_PER_QUESTION;
    let surveyStartTime = null;

    const surveyQuestions = {
        'START': { next: 'Q1_VISIT_FREQUENCY' },
        'Q1_VISIT_FREQUENCY': {
            text: "How often do you visit Dunkin' amid staffing shortages?",
            type: 'radio',
            required: true,
            options: [
                { value: 'daily', label: 'Daily (despite delays)' },
                { value: 'weekly', label: 'Weekly (hoping for better service)' },
                { value: 'monthly', label: 'Monthly (when staffing improves)' },
                { value: 'rarely', label: 'Rarely (due to staffing issues)' },
                { value: 'never', label: 'Never (staffing drove me away)' }
            ],
            next: 'Q2_ORDER_METHOD'
        },
        'Q2_ORDER_METHOD': {
            text: "How did you order with recent app reliability issues?",
            type: 'radio',
            required: true,
            options: [
                { value: 'instore_counter', label: 'In-Store Counter (avoiding app)' },
                { value: 'drive_thru', label: 'Drive-Thru (app failed)' },
                { value: 'mobile_app', label: 'Mobile App (worked this time)' },
                { value: 'delivery_app', label: 'Third-Party Delivery (app unreliable)' }
            ],
            next: 'Q3_DELIVERY_EXPERIENCE'
        },
        'Q3_DELIVERY_EXPERIENCE': {
            text: "How was your experience with delivery delays?",
            type: 'rating',
            required: true,
            options: [
                { value: 5, label: 'Very Satisfied (on time)' },
                { value: 4, label: 'Satisfied (minor delay)' },
                { value: 3, label: 'Neutral' },
                { value: 2, label: 'Dissatisfied (significant delay)' },
                { value: 1, label: 'Very Dissatisfied (unacceptable delay)' },
                { value: 0, label: 'N/A (no delivery)' }
            ],
            next: 'Q4_DRINK_QUALITY'
        },
        'Q4_DRINK_QUALITY': {
            text: "How was the quality of your drink with inconsistent staffing?",
            type: 'rating',
            required: true,
            options: [
                { value: 5, label: 'Very Satisfied' },
                { value: 4, label: 'Satisfied' },
                { value: 3, label: 'Neutral' },
                { value: 2, label: 'Dissatisfied' },
                { value: 1, label: 'Very Dissatisfied' },
                { value: 0, label: 'N/A (no drink)' }
            ],
            next: 'Q5_FOOD_QUALITY'
        },
        'Q5_FOOD_QUALITY': {
            text: "How was the freshness of your food with staffing challenges?",
            type: 'rating',
            required: true,
            options: [
                { value: 5, label: 'Very Satisfied' },
                { value: 4, label: 'Satisfied' },
                { value: 3, label: 'Neutral' },
                { value: 2, label: 'Dissatisfied' },
                { value: 1, label: 'Very Dissatisfied' },
                { value: 0, label: 'N/A (no food)' }
            ],
            next: 'Q6_SERVICE_SPEED'
        },
        'Q6_SERVICE_SPEED': {
            text: "How was the service speed with current staffing shortages?",
            type: 'rating',
            required: true,
            options: [
                { value: 5, label: 'Very Satisfied (Very Fast)' },
                { value: 4, label: 'Satisfied (Fast Enough)' },
                { value: 3, label: 'Neutral' },
                { value: 2, label: 'Dissatisfied (Too Slow)' },
                { value: 1, label: 'Very Dissatisfied (Extremely Slow)' }
            ],
            next: 'Q7_ORDER_ACCURACY'
        },
        'Q7_ORDER_ACCURACY': {
            text: "Was your order accurate despite staffing issues?",
            type: 'radio',
            required: true,
            options: [
                { value: 'yes', label: 'Yes, perfectly accurate' },
                { value: 'mostly', label: 'Mostly accurate, minor issue' },
                { value: 'no', label: 'No, there were mistakes' }
            ],
            next: (ans) => ans['Q7_ORDER_ACCURACY'] === 'no' ? 'Q8_ACCURACY_ISSUE' : 'Q9_STAFF_INTERACTION'
        },
        'Q8_ACCURACY_ISSUE': {
            text: "What was inaccurate about your order?",
            type: 'checkbox',
            required: true,
            maxSelection: 2,
            options: [
                { value: 'wrong_item', label: 'Received wrong item(s)' },
                { value: 'missing_item', label: 'Missing item(s)' },
                { value: 'wrong_customization', label: 'Incorrect customization' },
                { value: 'other', label: 'Other issue' }
            ],
            next: 'Q9_STAFF_INTERACTION'
        },
        'Q9_STAFF_INTERACTION': {
            text: "How was staff interaction with reported shortages?",
            type: 'rating',
            required: true,
            options: [
                { value: 5, label: 'Very Friendly' },
                { value: 4, label: 'Friendly' },
                { value: 3, label: 'Neutral' },
                { value: 2, label: 'Unfriendly' },
                { value: 1, label: 'Very Unfriendly' },
                { value: 0, label: 'N/A (no interaction)' }
            ],
            next: 'Q10_RECOMMENDATION'
        },
        'Q10_RECOMMENDATION': {
            text: "Would you recommend Dunkin' despite current challenges?",
            type: 'rating',
            required: true,
            options: [
                { value: 5, label: 'Very Likely' },
                { value: 4, label: 'Likely' },
                { value: 3, label: 'Neutral' },
                { value: 2, label: 'Unlikely' },
                { value: 1, label: 'Very Unlikely' }
            ],
            next: 'FEEDBACK'
        },
        'FEEDBACK': { type: 'textarea', next: 'COMPLETE' },
        'COMPLETE': { type: 'completion' }
    };

    function startTimer() {
        stopTimer();
        timeLeft = TIME_PER_QUESTION;
        updateTimerDisplay();
        timerContainer.classList.remove('low-time');
        timerInterval = setInterval(() => {
            timeLeft--;
            updateTimerDisplay();
            if (timeLeft <= 3) timerContainer.classList.add('low-time');
            if (timeLeft <= 0) {
                stopTimer();
                handleAutoAdvance();
            }
        }, 1000);
    }

    function stopTimer() {
        clearInterval(timerInterval);
        timerInterval = null;
        timerContainer.classList.remove('low-time');
    }

    function updateTimerDisplay() {
        if (!timerDisplay) return;
        timerDisplay.textContent = `00:${String(timeLeft).padStart(2, '0')}`;
    }

    function handleAutoAdvance() {
        collectAnswer(currentQuestionId);
        handleNextQuestion(true);
    }

    function renderQuestion(questionId) {
        const question = surveyQuestions[questionId];
        if (!question || question.type === 'textarea' || question.type === 'completion' || !questionContainer) {
            console.error("Invalid question/render state:", questionId);
            showFeedbackSection();
            return;
        }
        stopTimer();
        questionContainer.innerHTML = '';
        const fieldset = document.createElement('fieldset');
        fieldset.id = `q_${questionId}`;
        fieldset.classList.add('question-card');
        fieldset.setAttribute('aria-labelledby', `legend_${questionId}`);
        const legend = document.createElement('legend');
        legend.id = `legend_${questionId}`;
        legend.innerHTML = question.text;
        fieldset.appendChild(legend);
        const optionsList = document.createElement('ul');
        optionsList.classList.add('options-list');
        if (question.type === 'radio' || question.type === 'rating') optionsList.setAttribute('role', 'radiogroup');
        else if (question.type === 'checkbox') {
            optionsList.setAttribute('role', 'group');
            if (question.maxSelection) optionsList.setAttribute('aria-describedby', `info_${questionId}`);
        }
        if (question.options) {
            question.options.forEach((option, index) => {
                const li = document.createElement('li');
                const id = `q_${questionId}_opt${index}`;
                const input = document.createElement('input');
                input.type = question.type === 'checkbox' ? 'checkbox' : 'radio';
                input.id = id;
                input.name = `q_${questionId}`;
                input.value = option.value;
                const ans = userAnswers[questionId];
                if (ans) {
                    if (input.type === 'radio' && String(ans) === String(option.value)) input.checked = true;
                    else if (input.type === 'checkbox' && Array.isArray(ans) && ans.includes(String(option.value))) input.checked = true;
                }
                const label = document.createElement('label');
                label.htmlFor = id;
                const span = document.createElement('span');
                span.textContent = option.label;
                label.appendChild(input);
                label.appendChild(span);
                input.addEventListener('change', (e) => handleInputChange(questionId, question, e));
                li.appendChild(label);
                optionsList.appendChild(li);
            });
            fieldset.appendChild(optionsList);
            if (question.type === 'checkbox' && question.maxSelection) {
                const help = document.createElement('p');
                help.id = `info_${questionId}`;
                help.classList.add('checkbox-help-text');
                help.textContent = `(Select up to ${question.maxSelection})`;
                fieldset.appendChild(help);
            }
        }
        questionContainer.appendChild(fieldset);
        updateNavigationButtons();
        updateProgressBar();
        validateCurrentQuestion();
        startTimer();
    }

    function handleInputChange(questionId, questionDef, event = null) {
        if (questionDef.type === 'checkbox' && questionDef.maxSelection && event?.target.checked) {
            const count = questionContainer.querySelectorAll(`input[name="q_${questionId}"]:checked`).length;
            if (count > questionDef.maxSelection) {
                event.target.checked = false;
                alert(`Select up to ${questionDef.maxSelection} options.`);
                return;
            }
        }
        validateCurrentQuestion();
    }

    function validateCurrentQuestion(isAutoAdvance = false) {
        if (!currentQuestionId || !nextButton) return false;
        const question = surveyQuestions[currentQuestionId];
        let isRequired = question?.required;
        if (typeof isRequired === 'function') isRequired = isRequired(userAnswers);
        if (!question || !isRequired) {
            nextButton.disabled = false;
            return true;
        }
        let isValid = false;
        if (questionContainer) {
            if (question.type === 'radio' || question.type === 'rating') isValid = questionContainer.querySelector(`input[name="q_${currentQuestionId}"]:checked`) !== null;
            else if (question.type === 'checkbox') isValid = questionContainer.querySelectorAll(`input[name="q_${currentQuestionId}"]:checked`).length > 0;
            else isValid = true;
        }
        nextButton.disabled = !isValid;
        return isValid;
    }

    function collectAnswer(questionId) {
        if (!questionId || !questionContainer) return;
        const question = surveyQuestions[questionId];
        if (!question || question.type === 'textarea' || question.type === 'completion') return;
        let answer;
        if (question.type === 'radio' || question.type === 'rating') answer = questionContainer.querySelector(`input[name="q_${questionId}"]:checked`)?.value;
        else if (question.type === 'checkbox') {
            const ch = Array.from(questionContainer.querySelectorAll(`input[name="q_${currentQuestionId}"]:checked`));
            answer = ch.length > 0 ? ch.map(cb => cb.value) : undefined;
        }
        if (answer !== undefined) userAnswers[questionId] = answer;
        else delete userAnswers[questionId];
    }

    function getNextQuestionId() {
        if (!currentQuestionId) return surveyQuestions['START'].next;
        const question = surveyQuestions[currentQuestionId];
        if (!question || !question.next) return 'FEEDBACK';
        if (typeof question.next === 'string') return question.next;
        if (typeof question.next === 'function') return question.next(userAnswers);
        return 'FEEDBACK';
    }

    function handleNextQuestion(isAutoAdvance = false) {
        if (!isAutoAdvance && !validateCurrentQuestion()) {
            questionContainer.querySelector('.question-card').style.animation = 'shake 0.3s ease-in-out';
            setTimeout(() => questionContainer.querySelector('.question-card').style.animation = '', 300);
            return;
        }
        if (currentQuestionId !== 'START') collectAnswer(currentQuestionId);
        stopTimer();
        const nextId = getNextQuestionId();
        if (currentQuestionId && currentQuestionId !== 'START') questionHistory.push(currentQuestionId);
        currentQuestionId = nextId;
        if (currentQuestionId === 'FEEDBACK') showFeedbackSection();
        else if (currentQuestionId === 'COMPLETE') submitSurvey();
        else if (surveyQuestions[currentQuestionId]) renderQuestion(currentQuestionId);
        else showFeedbackSection();
    }

    function handlePreviousQuestion() {
        if (questionHistory.length === 0) return;
        stopTimer();
        currentQuestionId = questionHistory.pop();
        if (surveyQuestions[currentQuestionId]) renderQuestion(currentQuestionId);
        else startSurvey();
    }

    function updateNavigationButtons() {
        backButton.classList.toggle('visible', questionHistory.length > 0);
    }

    function updateProgressBar() {
        if (!progressBar) return;
        const qIds = Object.keys(surveyQuestions).filter(id => !['START', 'FEEDBACK', 'COMPLETE'].includes(id));
        const total = qIds.length;
        let currentIdx = questionHistory.length;
        if (currentQuestionId && currentQuestionId !== 'START' && !questionHistory.includes(currentQuestionId)) {
            const qIdx = qIds.indexOf(currentQuestionId);
            if (qIdx !== -1) currentIdx = qIdx;
        }
        const progress = total > 0 ? Math.min((currentIdx / total) * 100, 100) : 0;
        progressBar.style.width = `${progress}%`;
    }

    function showFeedbackSection() {
        stopTimer();
        surveyForm.style.display = 'none';
        feedbackSection.style.display = 'block';
        welcomeScreen.style.display = 'none';
        completionScreen.style.display = 'none';
        if (finalFeedbackInput) {
            finalFeedbackInput.value = userAnswers['FEEDBACK'] || '';
            updateCharCount();
        }
    }

    function updateCharCount() {
        if (!finalFeedbackInput || !charCountDisplay) return;
        const len = finalFeedbackInput.value.length;
        charCountDisplay.textContent = `${len} / ${MAX_FEEDBACK_CHARS} characters`;
        const isOver = len > MAX_FEEDBACK_CHARS;
        charCountDisplay.classList.toggle('limit-exceeded', isOver);
        submitSurveyButton.disabled = isOver;
    }

    function startSurvey() {
        if (!startButton) {
            console.error("Start button not found!");
            return;
        }
        surveyStartTime = new Date();
        userAnswers = {};
        questionHistory = [];
        currentQuestionId = 'START';
        welcomeScreen.style.display = 'none';
        surveyForm.style.display = 'block';
        feedbackSection.style.display = 'none';
        completionScreen.style.display = 'none';
        backButton.classList.remove('visible');
        handleNextQuestion();
    }

    function submitSurvey() {
        stopTimer();
        if (finalFeedbackInput && feedbackSection.style.display === 'block') {
            userAnswers['FEEDBACK'] = finalFeedbackInput.value.trim();
            if (userAnswers['FEEDBACK'].length > MAX_FEEDBACK_CHARS) {
                alert(`Feedback exceeds ${MAX_FEEDBACK_CHARS} characters.`);
                return;
            }
        }
        const endTime = new Date();
        const duration = Math.round((endTime - surveyStartTime) / 1000);
        userAnswers['meta'] = {
            start: surveyStartTime.toISOString(),
            end: endTime.toISOString(),
            durationS: duration,
            ua: navigator.userAgent
        };

        console.log("Dunkin' Survey Results:", JSON.stringify(userAnswers, null, 2));
        surveyForm.style.display = 'none';
        feedbackSection.style.display = 'none';
        completionScreen.style.display = 'block';
        completionMessage.textContent = `Reward $1.00 processed. Redirecting to Surveys...`;
        if (window.confetti) {
            confetti({
                particleCount: 150,
                spread: 90,
                origin: { y: 0.6 },
                colors: ['#FF679A', '#F29021', '#FFFFFF']
            });
        }
        setTimeout(() => {
            window.location.href = 'surveys_desktop.html';
        }, 6000);
    }

    // Theme Toggle
    if (themeSwitch && themeSwitchLabel) {
        themeSwitch.addEventListener('change', () => {
            document.body.dataset.theme = themeSwitch.checked ? 'light' : 'dark';
            themeSwitchLabel.classList.toggle('light', themeSwitch.checked);
            localStorage.setItem('theme', themeSwitch.checked ? 'light' : 'dark');
        });
        if (localStorage.getItem('theme') === 'light') {
            themeSwitch.checked = true;
            document.body.dataset.theme = 'light';
            themeSwitchLabel.classList.add('light');
        }
    }

    // Event Listeners
    if (startButton) {
        startButton.addEventListener('click', startSurvey);
    } else {
        console.error("Start button element not found in DOM!");
    }
    if (nextButton) nextButton.addEventListener('click', () => handleNextQuestion(false));
    if (backButton) backButton.addEventListener('click', handlePreviousQuestion);
    if (finalFeedbackInput) finalFeedbackInput.addEventListener('input', updateCharCount);
    if (skipFeedbackButton) skipFeedbackButton.addEventListener('click', () => {
        userAnswers['FEEDBACK'] = 'skipped';
        submitSurvey();
    });
    if (submitSurveyButton) submitSurveyButton.addEventListener('click', submitSurvey);
    if (surveyForm) surveyForm.addEventListener('submit', (e) => e.preventDefault());

    // Initial State
    if (surveyForm) surveyForm.style.display = 'none';
    if (feedbackSection) feedbackSection.style.display = 'none';
    if (completionScreen) completionScreen.style.display = 'none';
    if (backButton) backButton.classList.remove('visible');
    console.log("Dunkin' Survey Initialized.");
});

// Shake Animation
Element.prototype.shake = function() {
    this.style.animation = 'shake 0.3s ease-in-out';
    setTimeout(() => this.style.animation = '', 300);
};
try {
    const sheet = document.styleSheets[0];
    sheet.insertRule(`@keyframes shake { 0%, 100% { transform: translateX(0); } 25% { transform: translateX(-3px); } 75% { transform: translateX(3px); } }`, sheet.cssRules.length);
} catch (e) {
    console.warn("Shake animation insert failed:", e);
}