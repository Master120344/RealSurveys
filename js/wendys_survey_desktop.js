document.addEventListener('DOMContentLoaded', () => {
    // --- DOM Elements ---
    const welcomeScreen = document.getElementById('welcome-screen');
    const startButton = document.getElementById('startButton');
    const surveyForm = document.getElementById('wendysSurveyForm');
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

    // --- Config & State ---
    const TIME_PER_QUESTION = 10;
    const MAX_FEEDBACK_CHARS = 500;
    const SURVEY_ID = 'wendysSurvey'; // Unique identifier for local storage
    let currentQuestionId = null;
    let userAnswers = {};
    let questionHistory = [];
    let timerInterval = null;
    let timeLeft = TIME_PER_QUESTION;
    let surveyStartTime = null;
    let hasTakenSurvey = localStorage.getItem(`${SURVEY_ID}_taken`) === 'true';

    // --- Survey Questions (Wendy's Focus) ---
    const surveyQuestions = {
        'START': { next: 'Q1_VISIT_TYPE' },
        'Q1_VISIT_TYPE': {
            text: "What type of visit was this?",
            type: 'radio',
            required: true,
            options: [
                { value: 'dine_in', label: 'Dine-In' },
                { value: 'drive_thru', label: 'Drive-Thru' },
                { value: 'carry_out', label: 'Carry-Out' },
                { value: 'delivery_app', label: 'Delivery App (DoorDash, Uber Eats, etc.)' },
                { value: 'other', label: 'Other' }
            ],
            next: 'Q2_FOOD_QUALITY'
        },
        'Q2_FOOD_QUALITY': {
            text: "How would you rate the overall quality of the food you ordered?",
            type: 'rating',
            required: true,
            options: [
                { value: 5, label: 'Excellent' },
                { value: 4, label: 'Good' },
                { value: 3, label: 'Okay' },
                { value: 2, label: 'Poor' },
                { value: 1, label: 'Terrible' }
            ],
            next: 'Q3_ORDER_ACCURACY'
        },
        'Q3_ORDER_ACCURACY': {
            text: "Was your order accurate?",
            type: 'radio',
            required: true,
            options: [
                { value: 'yes', label: 'Yes, completely accurate' },
                { value: 'no', label: 'No, there were errors' }
            ],
            next: (ans) => ans['Q3_ORDER_ACCURACY'] === 'no' ? 'Q4_ACCURACY_ISSUE' : 'Q5_SERVICE_SPEED'
        },
        'Q4_ACCURACY_ISSUE': {
            text: "What errors were in your order? (Select all that apply)",
            type: 'checkbox',
            required: true,
            options: [
                { value: 'wrong_item', label: 'Wrong item(s)' },
                { value: 'missing_item', label: 'Missing item(s)' },
                { value: 'incorrect_mods', label: 'Incorrect modifications (e.g., no mayo)' }
            ],
            next: 'Q5_SERVICE_SPEED'
        },
        'Q5_SERVICE_SPEED': {
            text: "How satisfied were you with the speed of service?",
            type: 'rating',
            required: true,
            options: [
                { value: 5, label: 'Very Satisfied' },
                { value: 4, label: 'Satisfied' },
                { value: 3, label: 'Neutral' },
                { value: 2, label: 'Dissatisfied' },
                { value: 1, label: 'Very Dissatisfied' }
            ],
            next: 'Q6_STAFF_FRIENDLINESS'
        },
        'Q6_STAFF_FRIENDLINESS': {
            text: "How would you rate the friendliness of the staff?",
            type: 'rating',
            required: true,
            options: [
                { value: 5, label: 'Very Friendly' },
                { value: 4, label: 'Friendly' },
                { value: 3, label: 'Neutral' },
                { value: 2, label: 'Unfriendly' },
                { value: 1, label: 'Very Unfriendly' }
            ],
            next: 'Q7_MOBILE_APP'
        },
        'Q7_MOBILE_APP': {
            text: "Do you use the Wendy's mobile app?",
            type: 'radio',
            required: true,
            options: [
                { value: 'yes', label: 'Yes' },
                { value: 'no', label: 'No' }
            ],
            next: (ans) => ans['Q7_MOBILE_APP'] === 'yes' ? 'Q8_APP_SATISFACTION' : 'Q9_RECOMMENDATION'
        },
        'Q8_APP_SATISFACTION': {
            text: "How satisfied are you with the Wendy's mobile app?",
            type: 'rating',
            required: true,
            options: [
                { value: 5, label: 'Very Satisfied' },
                { value: 4, label: 'Satisfied' },
                { value: 3, label: 'Neutral' },
                { value: 2, label: 'Dissatisfied' },
                { value: 1, label: 'Very Dissatisfied' }
            ],
            next: 'Q9_RECOMMENDATION'
        },
        'Q9_RECOMMENDATION': {
            text: "How likely are you to recommend Wendy's to a friend or family member?",
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

     // --- Helper Functions ---
    function log(message, ...args) { console.log(`[Wendy's Survey]: ${message}`, ...args); }
    function error(message, ...args) { console.error(`[Wendy's Survey] ERROR: ${message}`, ...args); }

    // --- Timer Functions ---
    function startTimer() {
        stopTimer();
        timeLeft = TIME_PER_QUESTION;
        updateTimerDisplay();
        timerContainer?.classList.remove('low-time');
        timerInterval = setInterval(() => {
            timeLeft--;
            updateTimerDisplay();
            if (timeLeft <= 3 && timerContainer) timerContainer.classList.add('low-time');
            if (timeLeft <= 0) {
                stopTimer();
                handleAutoAdvance();
            }
        }, 1000);
        log("Timer started.");
    }

    function stopTimer() {
        clearInterval(timerInterval);
        timerInterval = null;
        timerContainer?.classList.remove('low-time');
        log("Timer stopped.");
    }

    function updateTimerDisplay() {
        if (!timerDisplay) {
            error("Timer display element not found.");
            return;
        }
        timerDisplay.textContent = `00:${String(timeLeft).padStart(2, '0')}`;
    }

    function handleAutoAdvance() {
        log(`Auto-advancing: ${currentQuestionId}`);
        collectAnswer(currentQuestionId);
        handleNextQuestion(true);
    }

    // --- Rendering Functions ---
    function renderQuestion(questionId) {
        log(`Rendering question: ${questionId}`);
        const question = surveyQuestions[questionId];

        if (!question) {
            error(`Invalid question ID: ${questionId}`);
            showFeedbackSection();
            return;
        }

        if (question.type === 'textarea' || question.type === 'completion') {
            error(`Attempted to render non-question type: ${question.type}`);
            showFeedbackSection();
            return;
        }

        if (!questionContainer) {
            error("Question container element not found.");
            return;
        }

        stopTimer();
        questionContainer.innerHTML = ''; // Clear previous question

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

        if (question.type === 'radio' || question.type === 'rating') {
            optionsList.setAttribute('role', 'radiogroup');
        } else if (question.type === 'checkbox') {
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

                // Check if the answer was previously given
                const ans = userAnswers[questionId];
                if (ans) {
                    if (input.type === 'radio' && String(ans) === String(option.value)) {
                        input.checked = true;
                    } else if (input.type === 'checkbox' && Array.isArray(ans) && ans.includes(String(option.value))) {
                        input.checked = true;
                    }
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
        log(`Question ${questionId} rendered successfully.`);
    }

    // --- Input Handling and Validation ---
    function handleInputChange(questionId, questionDef, event = null) {
        log(`Input changed for question: ${questionId}`);
        if (questionDef.type === 'checkbox' && questionDef.maxSelection && event?.target.checked) {
            const count = questionContainer?.querySelectorAll(`input[name="q_${questionId}"]:checked`)?.length ?? 0;
            if (count > questionDef.maxSelection) {
                event.target.checked = false;
                alert(`Select up to ${questionDef.maxSelection} options.`);
                return;
            }
        }
        validateCurrentQuestion();
    }

    function validateCurrentQuestion(isAutoAdvance = false) {
        if (!currentQuestionId) {
            error("No current question ID to validate.");
            return false;
        }

        if (!nextButton) {
            error("Next button element not found.");
            return false;
        }

        const question = surveyQuestions[currentQuestionId];
        if (isAutoAdvance) {
            nextButton.disabled = false;
            return true;
        }

        let isRequired = question?.required;
        if (typeof isRequired === 'function') {
            isRequired = isRequired(userAnswers);
        }

        if (!question || !isRequired) {
            nextButton.disabled = false;
            return true;
        }

        let isValid = false;
        if (questionContainer) {
            if (question.type === 'radio' || question.type === 'rating') {
                isValid = questionContainer.querySelector(`input[name="q_${currentQuestionId}"]:checked`) !== null;
            } else if (question.type === 'checkbox') {
                isValid = questionContainer.querySelectorAll(`input[name="q_${currentQuestionId}"]:checked`).length > 0;
            } else {
                isValid = true;
            }
        }

        nextButton.disabled = !isValid;
        log(`Question ${currentQuestionId} validation: ${isValid}`);
        return isValid;
    }

    // --- Data Collection ---
    function collectAnswer(questionId) {
        log(`Collecting answer for question: ${questionId}`);
        if (!questionId || !questionContainer) {
            error("Question ID or question container not found.");
            return;
        }

        const question = surveyQuestions[questionId];
        if (!question || question.type === 'textarea' || question.type === 'completion') {
            error("Invalid question type for answer collection.");
            return;
        }

        let answer;
        if (question.type === 'radio' || question.type === 'rating') {
            answer = questionContainer.querySelector(`input[name="q_${questionId}"]:checked`)?.value;
        } else if (question.type === 'checkbox') {
            const checkedBoxes = Array.from(questionContainer.querySelectorAll(`input[name="q_${currentQuestionId}"]:checked`));
            answer = checkedBoxes.length > 0 ? checkedBoxes.map(cb => cb.value) : undefined;
        }

        if (answer !== undefined) {
            userAnswers[questionId] = answer;
            log(`Answer collected: ${questionId} = ${answer}`);
        } else {
            delete userAnswers[questionId];
            log(`Answer deleted: ${questionId}`);
        }
    }

    // --- Survey Flow Control ---
    function getNextQuestionId() {
        if (!currentQuestionId) {
            log("Starting survey, getting first question ID.");
            return surveyQuestions['START'].next;
        }

        const question = surveyQuestions[currentQuestionId];
        if (!question || !question.next) {
            log("No more questions, transitioning to feedback.");
            return 'FEEDBACK';
        }

        if (typeof question.next === 'string') {
            log(`Next question ID is a string: ${question.next}`);
            return question.next;
        }

        if (typeof question.next === 'function') {
            const nextId = question.next(userAnswers);
            log(`Next question ID is determined by function: ${nextId}`);
            return nextId;
        }

        if (typeof question.next === 'object') {
            const ans = userAnswers[currentQuestionId];
            if (ans !== undefined && question.next[String(ans)]) {
                log(`Next question ID is based on answer: ${ans} -> ${question.next[String(ans)]}`);
                return question.next[String(ans)];
            } else if (question.next['default']) {
                log(`Using default next question ID: ${question.next['default']}`);
                return question.next['default'];
            }
        }

        error("Could not determine next question ID, transitioning to feedback.");
        return 'FEEDBACK';
    }

    function handleNextQuestion(isAutoAdvance = false) {
        log(`Handling next question. Auto advance: ${isAutoAdvance}`);
        if (!isAutoAdvance && !validateCurrentQuestion()) {
            console.warn("Validation failed.");
            questionContainer?.querySelector('.question-card')?.shake?.();
            return;
        }

        if (currentQuestionId !== 'START') {
            collectAnswer(currentQuestionId);
        }

        stopTimer();
        const nextId = getNextQuestionId();

        if (currentQuestionId && currentQuestionId !== 'START') {
            questionHistory.push(currentQuestionId);
        }

        currentQuestionId = nextId;

        if (currentQuestionId === 'FEEDBACK') {
            showFeedbackSection();
        } else if (currentQuestionId === 'COMPLETE') {
            submitSurvey();
        } else if (surveyQuestions[currentQuestionId]) {
            renderQuestion(currentQuestionId);
        } else {
            error(`Invalid next ID: ${currentQuestionId}`);
            showFeedbackSection();
        }
    }

    function handlePreviousQuestion() {
        log("Handling previous question.");
        if (questionHistory.length === 0) {
            log("No previous questions in history.");
            return;
        }

        stopTimer();
        currentQuestionId = questionHistory.pop();
        if (surveyQuestions[currentQuestionId]) {
            renderQuestion(currentQuestionId);
        } else {
            error(`Invalid previous ID: ${currentQuestionId}`);
            startSurvey();
        }
    }

    function updateNavigationButtons() {
        if (backButton) {
            backButton.classList.toggle('visible', questionHistory.length > 0);
        }
    }

    function updateProgressBar() {
        if (!progressBar) {
            error("Progress bar element not found.");
            return;
        }

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

    // --- Section Display Functions ---
    function showFeedbackSection() {
        log("Showing feedback section.");
        stopTimer();
        if (surveyForm) surveyForm.style.display = 'none';
        if (feedbackSection) feedbackSection.style.display = 'block';
        if (welcomeScreen) welcomeScreen.style.display = 'none';
        if (finalFeedbackInput) {
            finalFeedbackInput.value = userAnswers['FEEDBACK'] || '';
            updateCharCount();
        }
    }

    function updateCharCount() {
        if (!finalFeedbackInput || !charCountDisplay) {
            error("Final feedback input or char count display element not found.");
            return;
        }

        const len = finalFeedbackInput.value.length;
        charCountDisplay.textContent = `${len} / ${MAX_FEEDBACK_CHARS} chars`;
        const isOver = len > MAX_FEEDBACK_CHARS;
        charCountDisplay.classList.toggle('limit-exceeded', isOver);
        if (submitSurveyButton) submitSurveyButton.disabled = isOver;
    }

    // --- Survey Start and End ---
    function startSurvey() {
        log("Starting Wendy's survey...");

        // Prevent survey from running again if already taken
        if (hasTakenSurvey) {
            alert("You have already completed this survey.");
            log("User attempted to retake survey but was blocked.");
            return; // Stop survey from beginning
        }

        surveyStartTime = new Date();
        userAnswers = {};
        questionHistory = [];
        currentQuestionId = 'START';

        if (welcomeScreen) welcomeScreen.style.display = 'none';
        if (surveyForm) surveyForm.style.display = 'block';
        if (feedbackSection) feedbackSection.style.display = 'none';
        if (completionScreen) completionScreen.style.display = 'none';
        handleNextQuestion();
    }

    function submitSurvey() {
        log("Submitting Wendy's survey...");
        stopTimer();

        if (finalFeedbackInput && feedbackSection?.style.display === 'block') {
            userAnswers['FEEDBACK'] = finalFeedbackInput.value.trim();
            if (userAnswers['FEEDBACK'].length > MAX_FEEDBACK_CHARS) {
                alert(`Feedback > ${MAX_FEEDBACK_CHARS} chars.`);
                return;
            }
        }

        const endTime = new Date();
        const duration = Math.round(((endTime - surveyStartTime) || 0) / 1000);
        userAnswers['meta'] = {
            start: surveyStartTime?.toISOString(),
            end: endTime.toISOString(),
            durationS: duration,
            ua: navigator.userAgent
        };

        log("---- WENDY'S SURVEY RESULTS ----");
        log(JSON.stringify(userAnswers, null, 2));
        log("---- SIMULATING BACKEND ----");

        const email = "wendys_fan_" + Math.random().toString(36).substring(2, 9) + "@realsurveys-example.com";
        log(`User: ${email}`);
        const reward = 0.75;
        log(`Updating balance: +$${reward.toFixed(2)}...`);

        setTimeout(() => {
            log(`Balance update OK.`);
            if (completionMessage) completionMessage.textContent = `Reward $${reward.toFixed(2)} processed for ${email}.`;
        }, 1000);

        if (surveyForm) surveyForm.style.display = 'none';
        if (feedbackSection) feedbackSection.style.display = 'none';
        if (completionScreen) completionScreen.style.display = 'block';

        if (window.confetti) {
            confetti({
                particleCount: 150,
                spread: 90,
                origin: { y: 0.6 },
                colors: ['#BF0D3E', '#F4B400', '#FFFFFF']
            });
        }

        //Set local storage flag when survey has been succesfully submitted.
        localStorage.setItem(`${SURVEY_ID}_taken`, 'true');
        hasTakenSurvey = true;
        log("Survey complete flag set.");

        setTimeout(() => {
            log("Redirecting...");
            window.location.href = 'surveys.html';
        }, 6000);
    }

    // --- Initial Setup and Event Listeners ---
    function initializeSurvey() {

        // Check if survey has already been taken and handle the startButton
        if (hasTakenSurvey) {
            log("Survey already taken, disabling start button.");
            if (startButton) {
                startButton.disabled = true;
                startButton.textContent = "Survey Completed";  // Change the button text
                startButton.style.backgroundColor = "#6c757d";  // Grey out the button
                startButton.style.cursor = "not-allowed";      // Change the cursor
            }
        } else {
            log("Survey not taken, enabling the start button.");
            if (startButton) {
                 startButton.addEventListener('click', startSurvey); // Only add listener if not taken
            } else {
                error("Start Button missing");
            }
        }

        if (nextButton) nextButton.addEventListener('click', () => handleNextQuestion(false)); else error("Next Button missing");
        if (backButton) backButton.addEventListener('click', handlePreviousQuestion); else error("Back Button missing");
        if (finalFeedbackInput) finalFeedbackInput.addEventListener('input', updateCharCount);
        if (skipFeedbackButton) skipFeedbackButton.addEventListener('click', () => { userAnswers['FEEDBACK'] = 'skipped'; submitSurvey(); }); else error("Skip Button missing");
        if (submitSurveyButton) submitSurveyButton.addEventListener('click', submitSurvey); else error("Submit Button missing");

        if (surveyForm) surveyForm.addEventListener('submit', (e) => e.preventDefault());

        if (surveyForm) surveyForm.style.display = 'none';
        if (feedbackSection) feedbackSection.style.display = 'none';
        if (completionScreen) completionScreen.style.display = 'none';
        if (backButton) backButton.classList.remove('visible');

        log("Wendy's Survey Initialized.");
    }

    // --- Shake Helper (Optional) ---
    Element.prototype.shake = function () {
        this.style.animation = 'shake 0.3s ease-in-out';
        setTimeout(() => this.style.animation = '', 300);
    };

    try {
        const sheet = document.styleSheets[0];
        sheet.insertRule(`@keyframes shake { 0%, 100% { transform: translateX(0); } 25% { transform: translateX(-3px); } 75% { transform: translateX(3px); } }`, sheet.cssRules.length);
    } catch (e) {
        console.warn("Shake animation insert failed:", e);
    }

    initializeSurvey();
}); // End DOMContentLoaded