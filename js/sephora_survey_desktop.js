// Wrap everything in a function to ensure strict mode and avoid global scope pollution
(function() {
    'use strict'; // Enforce stricter parsing and error handling

    document.addEventListener('DOMContentLoaded', () => {
        // --- Constants ---
        const TIME_PER_QUESTION = 10;
        const MAX_FEEDBACK_CHARS = 500;
        const SURVEY_ID = 'sephoraSurvey';
        const SURVEY_TAKEN_KEY = `${SURVEY_ID}_taken`;

        // --- DOM Elements (Checked & Assigned in initializeSurvey) ---
        let welcomeScreen, startButton, surveyForm, questionContainer, backButton, nextButton,
            timerDisplay, timerContainer, progressBar, feedbackSection, finalFeedbackInput,
            charCountDisplay, skipFeedbackButton, submitSurveyButton, completionScreen,
            completionMessage, initErrorMessage;

        // --- State Variables ---
        let currentQuestionId = null;
        let userAnswers = {};
        let questionHistory = [];
        let timerInterval = null;
        let timeLeft = TIME_PER_QUESTION;
        let surveyStartTime = null;
        let hasTakenSurvey = false;
        let isInitialized = false; // Flag to track successful initialization

        // --- Logging Helpers ---
        const logPrefix = `[Sephora Survey]:`;
        function log(message, ...args) { console.log(`${logPrefix} ${message}`, ...args); }
        function warn(message, ...args) { console.warn(`${logPrefix} WARN: ${message}`, ...args); }
        function error(message, ...args) { console.error(`${logPrefix} ERROR: ${message}`, ...args); }

        // --- Survey Questions (Sephora Focus) ---
        const surveyQuestions = {
            'START': { next: 'Q1_SHOPPING_METHOD' },
            'Q1_SHOPPING_METHOD': {
                text: "How did you shop with Sephora most recently?",
                type: 'radio', required: true,
                options: [
                    { value: 'in_store', label: 'In a Sephora store' },
                    { value: 'online_website', label: 'Online at Sephora.com' },
                    { value: 'online_app', label: 'Using the Sephora App' },
                    { value: 'instore_pickup', label: 'Ordered online/app for In-Store Pickup' }
                ],
                next: 'Q2_PURPOSE'
            },
            'Q2_PURPOSE': {
                text: "What was the main purpose of your visit/purchase? (Select one)",
                type: 'radio', required: true,
                options: [
                    { value: 'makeup', label: 'Makeup' },
                    { value: 'skincare', label: 'Skincare' },
                    { value: 'fragrance', label: 'Fragrance' },
                    { value: 'haircare', label: 'Haircare' },
                    { value: 'bath_body', label: 'Bath & Body' },
                    { value: 'browsing', label: 'Just Browsing / Exploring' },
                    { value: 'gift', label: 'Buying a Gift' },
                    { value: 'other', label: 'Other' }
                ],
                next: 'Q3_PRODUCT_FINDABILITY'
            },
            'Q3_PRODUCT_FINDABILITY': {
                text: "How easy was it to find the products or information you were looking for?",
                type: 'rating', required: true,
                options: [
                    { value: 5, label: 'Very Easy' }, { value: 4, label: 'Easy' },
                    { value: 3, label: 'Neutral' }, { value: 2, label: 'Difficult' },
                    { value: 1, label: 'Very Difficult' }
                ],
                next: 'Q4_PRODUCT_SELECTION'
            },
            'Q4_PRODUCT_SELECTION': {
                text: "How satisfied were you with the selection of brands and products available?",
                type: 'rating', required: true,
                options: [
                    { value: 5, label: 'Very Satisfied' }, { value: 4, label: 'Satisfied' },
                    { value: 3, label: 'Neutral' }, { value: 2, label: 'Dissatisfied' },
                    { value: 1, label: 'Very Dissatisfied' }
                ],
                next: 'Q5_TESTERS_SAMPLES' // Relevant to Sephora
            },
            'Q5_TESTERS_SAMPLES': {
                text: "If you shopped in-store, how satisfied were you with the availability and condition of product testers?",
                type: 'rating',
                required: (ans) => ['in_store', 'instore_pickup'].includes(ans['Q1_SHOPPING_METHOD']), // Ask if in store
                options: [
                    { value: 5, label: 'Very Satisfied' }, { value: 4, label: 'Satisfied' },
                    { value: 3, label: 'Neutral' }, { value: 2, label: 'Dissatisfied' },
                    { value: 1, label: 'Very Dissatisfied' },
                    { value: 0, label: 'N/A - Did not use testers / Did not shop in store' }
                ],
                next: 'Q6_STAFF_ASSISTANCE'
            },
            'Q6_STAFF_ASSISTANCE': {
                text: "If you interacted with a Sephora Beauty Advisor (in-store or online chat), how helpful were they?",
                type: 'rating', required: true, // Always ask, can select N/A
                options: [
                    { value: 5, label: 'Very Helpful & Knowledgeable' }, { value: 4, label: 'Helpful' },
                    { value: 3, label: 'Neutral' }, { value: 2, label: 'Unhelpful' },
                    { value: 1, label: 'Very Unhelpful' },
                    { value: 0, label: 'N/A - Did not interact with staff' }
                ],
                next: 'Q7_CHECKOUT_EXPERIENCE'
            },
            'Q7_CHECKOUT_EXPERIENCE': {
                text: "How would you rate your checkout experience (speed, ease, friendliness)?",
                type: 'rating', required: true,
                options: [
                    { value: 5, label: 'Excellent' }, { value: 4, label: 'Good' },
                    { value: 3, label: 'Average' }, { value: 2, label: 'Poor' },
                    { value: 1, label: 'Very Poor' }
                ],
                next: 'Q8_BEAUTY_INSIDER'
            },
            'Q8_BEAUTY_INSIDER': {
                text: "Are you a Sephora Beauty Insider member?",
                type: 'radio', required: true,
                options: [
                    { value: 'yes', label: 'Yes' },
                    { value: 'no', label: 'No' },
                    { value: 'not_sure', label: 'Not Sure' }
                ],
                next: (ans) => ans['Q8_BEAUTY_INSIDER'] === 'yes' ? 'Q9_INSIDER_BENEFITS' : 'Q10_RECOMMENDATION'
            },
            'Q9_INSIDER_BENEFITS': {
                text: "How satisfied are you with the benefits and rewards of the Beauty Insider program?",
                type: 'rating', required: true,
                options: [
                    { value: 5, label: 'Very Satisfied' }, { value: 4, label: 'Satisfied' },
                    { value: 3, label: 'Neutral' }, { value: 2, label: 'Dissatisfied' },
                    { value: 1, label: 'Very Dissatisfied' }
                ],
                next: 'Q10_RECOMMENDATION'
            },
            'Q10_RECOMMENDATION': {
                text: "How likely are you to recommend Sephora to a friend or family member?",
                type: 'rating', required: true,
                options: [
                    { value: 5, label: 'Very Likely' }, { value: 4, label: 'Likely' },
                    { value: 3, label: 'Neutral' }, { value: 2, label: 'Unlikely' },
                    { value: 1, label: 'Very Unlikely' }
                ],
                next: 'FEEDBACK'
            },
            'FEEDBACK': { type: 'textarea', next: 'COMPLETE' },
            'COMPLETE': { type: 'completion' }
        };

        // --- Core Survey Logic Functions ---
        // Includes Timer, Render, Validation, Navigation, etc.
        // Adding extra logging and checks, especially around start-up.

        function startTimer() {
            stopTimer();
            timeLeft = TIME_PER_QUESTION;
            updateTimerDisplay();
            timerContainer?.classList.remove('low-time');
            timerInterval = setInterval(() => {
                timeLeft--; updateTimerDisplay();
                if (timeLeft <= 3) timerContainer?.classList.add('low-time');
                if (timeLeft <= 0) { log("Timer expired."); stopTimer(); handleAutoAdvance(); }
            }, 1000);
            log(`Timer started for ${currentQuestionId}.`);
        }

        function stopTimer() {
            if (timerInterval) { clearInterval(timerInterval); timerInterval = null; timerContainer?.classList.remove('low-time'); log("Timer stopped."); }
        }

        function updateTimerDisplay() { if (timerDisplay) timerDisplay.textContent = `00:${String(timeLeft).padStart(2, '0')}`; }

        function handleAutoAdvance() { log(`Auto-advancing from: ${currentQuestionId}`); collectAnswer(currentQuestionId); handleNextQuestion(true); }

        function renderQuestion(questionId) {
            log(`Attempting render: ${questionId}`);
            const question = surveyQuestions[questionId];
            if (!question || !questionContainer) { error(`Cannot render: Missing definition or container for ${questionId}.`); showFeedbackSection(); return; }
            if (question.type === 'textarea' || question.type === 'completion') { error(`Cannot render non-question type: ${question.type}`); showFeedbackSection(); return; }

            stopTimer();
            questionContainer.innerHTML = ''; // Clear

            const fieldset = document.createElement('fieldset'); /* ... create fieldset ... */
            fieldset.id = `q_${questionId}`;
            fieldset.classList.add('question-card');
            fieldset.setAttribute('aria-labelledby', `legend_${questionId}`);

            const legend = document.createElement('legend'); /* ... create legend ... */
            legend.id = `legend_${questionId}`;
            legend.innerHTML = typeof question.text === 'function' ? question.text(userAnswers) : question.text;
            fieldset.appendChild(legend);

            const optionsList = document.createElement('ul'); /* ... create options list ... */
            optionsList.classList.add('options-list');
            if (question.type === 'radio' || question.type === 'rating') optionsList.setAttribute('role', 'radiogroup');
            else if (question.type === 'checkbox') optionsList.setAttribute('role', 'group');


            if (question.options && Array.isArray(question.options)) {
                question.options.forEach((option, index) => { /* ... create options (li, input, label, span) ... */
                    const li = document.createElement('li');
                    const id = `q_${questionId}_opt${index}`;
                    const input = document.createElement('input');
                    input.type = question.type === 'checkbox' ? 'checkbox' : 'radio';
                    input.id = id;
                    input.name = `q_${questionId}`;
                    input.value = option.value;

                    const ans = userAnswers[questionId]; // Pre-check
                    if (ans !== undefined) {
                        if(input.type === 'radio' && String(ans) === String(option.value)) input.checked = true;
                        else if (input.type === 'checkbox' && Array.isArray(ans) && ans.map(String).includes(String(option.value))) input.checked = true;
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

                // Help text logic
                 const helpTextContent = question.maxSelection ? `(Select up to ${question.maxSelection})` : question.helpText;
                 if (helpTextContent) {
                     const help = document.createElement('p');
                     help.id = `info_${questionId}`;
                     help.classList.add('checkbox-help-text');
                     help.textContent = helpTextContent;
                     fieldset.appendChild(help);
                     optionsList.setAttribute('aria-describedby', `info_${questionId}`);
                 }

            } else { warn(`No options for ${questionId}.`); }

            questionContainer.appendChild(fieldset);
            log(`Rendered ${questionId}.`);

            updateNavigationButtons();
            updateProgressBar();
            validateCurrentQuestion(); // Validate after render
            startTimer(); // Start timer for the new question
        }

        function handleInputChange(questionId, questionDef, event = null) {
            // log(`Input change: ${questionId}`); // Can be noisy
            // Checkbox max selection
            if (questionDef.type === 'checkbox' && questionDef.maxSelection && event?.target.checked) {
                const fieldset = document.getElementById(`q_${questionId}`);
                if(fieldset){
                    const count = fieldset.querySelectorAll(`input[name="q_${questionId}"]:checked`).length;
                    if (count > questionDef.maxSelection) {
                        event.target.checked = false; alert(`Max ${questionDef.maxSelection} options.`); return;
                    }
                }
            }
            validateCurrentQuestion(); // Validate on change
        }

        function validateCurrentQuestion(isAutoAdvance = false) {
            if (!currentQuestionId || !surveyQuestions[currentQuestionId] || ['START', 'FEEDBACK', 'COMPLETE'].includes(currentQuestionId)) {
                 if(nextButton) nextButton.disabled = true; return false;
            }
            if (!nextButton) { error("Validation check failed: Next button missing."); return false; }

            const question = surveyQuestions[currentQuestionId];
            if (isAutoAdvance) { nextButton.disabled = false; return true; }

            let isRequired = question.required;
            if (typeof isRequired === 'function') {
                try { isRequired = isRequired(userAnswers); }
                catch (e) { error(`Error in 'required' fn for ${currentQuestionId}:`, e); isRequired = false; }
            }
            if (!isRequired) { nextButton.disabled = false; return true; }

            let isValid = false;
            const fieldset = document.getElementById(`q_${currentQuestionId}`);
            if (fieldset) {
                if (question.type === 'radio' || question.type === 'rating') isValid = fieldset.querySelector(`input[name="q_${currentQuestionId}"]:checked`) !== null;
                else if (question.type === 'checkbox') isValid = fieldset.querySelectorAll(`input[name="q_${currentQuestionId}"]:checked`).length > 0;
                else isValid = true; // Assume valid for other required types
            } else { error(`Validation failed: Fieldset missing for ${currentQuestionId}.`); }

            nextButton.disabled = !isValid;
            // log(`Validation ${currentQuestionId}: ${isValid} (Req: ${isRequired})`); // Can be noisy
            return isValid;
        }

        function collectAnswer(questionId) {
             if (!questionId || questionId === 'START' || !surveyQuestions[questionId]) return;
             const question = surveyQuestions[questionId];
             const fieldset = document.getElementById(`q_${questionId}`);
             if (!fieldset || question.type === 'textarea' || question.type === 'completion') return;

             let answer;
             try {
                 if (question.type === 'radio' || question.type === 'rating') answer = fieldset.querySelector(`input[name="q_${questionId}"]:checked`)?.value;
                 else if (question.type === 'checkbox') {
                     const checked = Array.from(fieldset.querySelectorAll(`input[name="q_${questionId}"]:checked`));
                     answer = checked.length > 0 ? checked.map(cb => cb.value) : undefined;
                 }
                 // else handle other types

                 if (answer !== undefined) userAnswers[questionId] = answer;
                 else if (userAnswers.hasOwnProperty(questionId)) delete userAnswers[questionId]; // Clear if previously set
                 // log(`Answer for ${questionId}: ${JSON.stringify(answer)}`); // Noisy
            } catch (e) { error(`Collect answer error for ${questionId}:`, e); if(userAnswers.hasOwnProperty(questionId)) delete userAnswers[questionId]; }
        }

        function getNextQuestionId() {
             if (!currentQuestionId) return surveyQuestions['START']?.next || 'FEEDBACK';
             const question = surveyQuestions[currentQuestionId];
             if (!question) { error(`GetNext failed: Def missing for ${currentQuestionId}`); return 'FEEDBACK'; }
             const nextLogic = question.next;
             if (!nextLogic) return 'FEEDBACK';
             if (typeof nextLogic === 'string') return nextLogic;
             if (typeof nextLogic === 'function') {
                 try { return nextLogic(userAnswers) || 'FEEDBACK'; }
                 catch (e) { error(`'Next' fn error for ${currentQuestionId}:`, e); return 'FEEDBACK'; }
             }
             warn(`Unsupported 'next' type for ${currentQuestionId}`); return 'FEEDBACK';
        }

        function handleNextQuestion(isAutoAdvance = false) {
            log(`HandleNext. Current: ${currentQuestionId}, Auto: ${isAutoAdvance}`);
            if (currentQuestionId && currentQuestionId !== 'START') collectAnswer(currentQuestionId);
            if (!isAutoAdvance && !validateCurrentQuestion()) {
                warn(`Validation failed for ${currentQuestionId}.`); try { questionContainer?.querySelector('.question-card')?.shake?.(); } catch(e){ error("Shake error:", e);} return;
            }
            stopTimer();
            const nextId = getNextQuestionId();
            if (currentQuestionId && currentQuestionId !== 'START') questionHistory.push(currentQuestionId);
            currentQuestionId = nextId;
            log(`Transitioning to: ${currentQuestionId}`);
            if (!currentQuestionId) { error("Next ID invalid."); showFeedbackSection(); return; }
            switch (currentQuestionId) {
                case 'FEEDBACK': showFeedbackSection(); break;
                case 'COMPLETE': submitSurvey(); break;
                default: surveyQuestions[currentQuestionId] ? renderQuestion(currentQuestionId) : (error(`Invalid next ID: ${currentQuestionId}`), showFeedbackSection()); break;
            }
        }

        function handlePreviousQuestion() {
            log("HandlePrevious."); if (questionHistory.length === 0) { log("No history."); return; }
            stopTimer(); currentQuestionId = questionHistory.pop(); log(`Going back to: ${currentQuestionId}`);
            if (surveyQuestions[currentQuestionId]) renderQuestion(currentQuestionId);
            else { error(`Invalid prev ID: ${currentQuestionId}`); if(questionHistory.length > 0) handlePreviousQuestion(); else initializeSurvey(); }
        }

        function updateNavigationButtons() {
            if(backButton) backButton.classList.toggle('visible', questionHistory.length > 0);
            if (nextButton) {
                 const isQStep = currentQuestionId && surveyQuestions[currentQuestionId] && !['START','FEEDBACK','COMPLETE'].includes(currentQuestionId);
                 nextButton.style.display = isQStep ? '' : 'none';
                 if (!isQStep) nextButton.disabled = true;
                 // Validation handles enabled state if visible
            }
        }

        function updateProgressBar() {
            /* ... progress bar logic (similar to previous examples) ... */
             if (!progressBar) return;
             const qKeys = Object.keys(surveyQuestions).filter(id => !['START', 'FEEDBACK', 'COMPLETE'].includes(id) && surveyQuestions[id].type !== 'textarea');
             const total = qKeys.length; if(total === 0) { progressBar.style.width = '0%'; return; }
             let currentIdx = qKeys.indexOf(currentQuestionId);
             const stepsDone = (currentIdx >= 0) ? currentIdx + 1 : questionHistory.length + 1; // Estimate
             const progress = Math.min((stepsDone / total) * 100, 100);
             progressBar.style.width = `${progress}%`;
        }

        function showFeedbackSection() {
            log("Showing feedback section."); stopTimer();
            if(surveyForm) surveyForm.style.display = 'none';
            if(welcomeScreen) welcomeScreen.style.display = 'none';
            if(completionScreen) completionScreen.style.display = 'none';
            if(feedbackSection) feedbackSection.style.display = 'block'; else error("Feedback section missing.");
            if(finalFeedbackInput){ finalFeedbackInput.value = userAnswers['FEEDBACK'] || ''; updateCharCount(); }
            if(backButton) backButton.classList.remove('visible'); if(nextButton) nextButton.style.display = 'none';
        }

        function updateCharCount() {
            if (!finalFeedbackInput || !charCountDisplay) return;
            const len = finalFeedbackInput.value.length;
            charCountDisplay.textContent = `${len}/${MAX_FEEDBACK_CHARS} chars`;
            const isOver = len > MAX_FEEDBACK_CHARS;
            charCountDisplay.classList.toggle('limit-exceeded', isOver);
            if(submitSurveyButton) submitSurveyButton.disabled = isOver;
        }

        function submitSurvey() {
            log("Attempting survey submission..."); stopTimer();
            if (feedbackSection?.style.display === 'block' && finalFeedbackInput) {
                const fb = finalFeedbackInput.value.trim();
                if (fb.length > MAX_FEEDBACK_CHARS) { alert(`Feedback too long.`); return; }
                userAnswers['FEEDBACK'] = fb;
            } else if (userAnswers.hasOwnProperty('FEEDBACK') && userAnswers['FEEDBACK'] !== 'skipped') delete userAnswers['FEEDBACK'];

            const endTime = new Date(); const duration = surveyStartTime ? Math.round((endTime-surveyStartTime)/1000) : 0;
            userAnswers['meta'] = { surveyId: SURVEY_ID, start: surveyStartTime?.toISOString(), end: endTime.toISOString(), durationS: duration, ua: navigator.userAgent };
            log("---- SEPHORA SURVEY RESULTS ----"); try{ log(JSON.stringify(userAnswers, null, 2)); } catch(e){ error("Stringify failed:", e); log("Raw:", userAnswers); } log("---- END RESULTS ----");

            log("Simulating backend..."); const email = "sephora_user_" + Math.random().toString(16).slice(2, 8) + "@realsurveys-example.com"; const reward = 0.70;
            setTimeout(() => { log(`Reward $${reward.toFixed(2)} for ${email}.`); if (completionMessage) completionMessage.textContent = `Reward $${reward.toFixed(2)} processed for ${email}.`; }, 1250);

            if(surveyForm) surveyForm.style.display = 'none'; if(feedbackSection) feedbackSection.style.display = 'none'; if(completionScreen) completionScreen.style.display = 'block'; else error("Completion screen missing.");

            if (typeof confetti === 'function') { try { confetti({ particleCount: 140, spread: 80, origin: { y: 0.6 }, colors: [var(--sephora-black), var(--sephora-white), '#DDDDDD'] }); } catch (e) { warn("Confetti failed:", e); confetti({ particleCount: 100, spread: 70, origin: { y: 0.6 }, colors: ['#000000', '#FFFFFF', '#DDDDDD'] }); } } else log("Confetti unavailable.");

            try { localStorage.setItem(SURVEY_TAKEN_KEY, 'true'); hasTakenSurvey = true; log("Survey marked taken."); } catch (e) { error("localStorage failed:", e); }

            const redirectDelay = 6000; log(`Redirecting in ${redirectDelay/1000}s...`); setTimeout(() => { window.location.href = 'surveys.html'; }, redirectDelay);
        }

        // --- Initialization ---
        function initializeSurvey() {
            log("----- INITIALIZING SURVEY -----");
            isInitialized = false; // Reset flag

            // --- Element Selection & Validation ---
            log("Selecting DOM elements...");
            welcomeScreen = document.getElementById('welcome-screen');
            startButton = document.getElementById('startButton');
            surveyForm = document.getElementById('sephoraSurveyForm');
            questionContainer = document.getElementById('question-container');
            backButton = document.getElementById('backButton');
            nextButton = document.getElementById('nextButton');
            timerDisplay = document.getElementById('timeLeft');
            timerContainer = document.getElementById('timer');
            progressBar = document.getElementById('progressBar');
            feedbackSection = document.getElementById('feedback-section');
            finalFeedbackInput = document.getElementById('finalFeedback');
            charCountDisplay = document.getElementById('char-count');
            skipFeedbackButton = document.getElementById('skipFeedbackButton');
            submitSurveyButton = document.getElementById('submitSurveyButton');
            completionScreen = document.getElementById('completion-screen');
            completionMessage = document.getElementById('completion-message');
            initErrorMessage = document.getElementById('initErrorMessage');

            const essentialElements = { welcomeScreen, startButton, surveyForm, questionContainer, backButton, nextButton, feedbackSection, completionScreen, initErrorMessage };
            let missingIds = [];
            for (const id in essentialElements) {
                if (!essentialElements[id]) {
                    missingIds.push(id);
                }
            }

            if (missingIds.length > 0) {
                const errorMsg = `Initialization failed: Cannot find element(s) with ID(s): ${missingIds.join(', ')}. Survey cannot start.`;
                error(errorMsg);
                if(initErrorMessage) { initErrorMessage.textContent = errorMsg; initErrorMessage.style.display = 'block'; }
                if(startButton) { startButton.disabled = true; startButton.textContent = "Initialization Error"; }
                return; // Halt initialization
            }
            log("All essential DOM elements found.");
            initErrorMessage.style.display = 'none'; // Hide error message if elements found

            // --- Check Local Storage ---
            log("Checking survey taken status...");
            try {
                hasTakenSurvey = localStorage.getItem(SURVEY_TAKEN_KEY) === 'true';
                log(`Survey taken: ${hasTakenSurvey}`);
            } catch (e) {
                error("Failed to access localStorage:", e);
                hasTakenSurvey = false; // Assume not taken on error
                initErrorMessage.textContent = "Warning: Could not verify survey status.";
                initErrorMessage.style.display = 'block';
            }

            // --- Configure Start Button ---
            log("Configuring Start Button...");
            // Ensure no duplicate listeners (important if init could run multiple times)
            startButton.removeEventListener('click', startSurveyHandler); // Remove previous, if any

            if (hasTakenSurvey) {
                log("Setting button to 'Completed' state.");
                startButton.disabled = true;
                startButton.textContent = "Survey Completed";
                startButton.style.cursor = "not-allowed";
                startButton.style.backgroundColor = "#adb5bd"; // Neutral disabled color
            } else {
                log("Setting button to 'Ready' state and adding listener.");
                startButton.disabled = false;
                startButton.textContent = "Start Survey";
                startButton.style.cursor = "pointer";
                startButton.style.backgroundColor = ""; // Use CSS default
                startButton.addEventListener('click', startSurveyHandler); // Add the listener
                log("Click listener ADDED to startButton.");
            }

            // --- Attach Other Listeners ---
            log("Attaching other event listeners...");
            nextButton?.addEventListener('click', () => handleNextQuestion(false));
            backButton?.addEventListener('click', handlePreviousQuestion);
            finalFeedbackInput?.addEventListener('input', updateCharCount);
            skipFeedbackButton?.addEventListener('click', () => { log("Skip clicked."); userAnswers['FEEDBACK'] = 'skipped'; submitSurvey(); });
            submitSurveyButton?.addEventListener('click', submitSurvey);
            surveyForm?.addEventListener('submit', (e) => { e.preventDefault(); });

            // --- Set Initial UI State ---
            log("Setting initial UI visibility...");
            surveyForm.style.display = 'none';
            feedbackSection.style.display = 'none';
            completionScreen.style.display = 'none';
            if(backButton) backButton.classList.remove('visible');
            if(nextButton) nextButton.disabled = true;

            isInitialized = true; // Mark initialization as successful
            log("----- SURVEY INITIALIZATION COMPLETE -----");
        }

        // --- Named Handler for Start Button Click ---
        function startSurveyHandler(event) {
            log("`startSurveyHandler` triggered by button click!");
            if (!isInitialized) {
                 error("Survey not initialized properly. Cannot start.");
                 if(initErrorMessage) { initErrorMessage.textContent = "Error: Survey failed to initialize."; initErrorMessage.style.display = 'block'; }
                 return;
            }
            if (hasTakenSurvey) {
                 log("Start click ignored: Survey already taken.");
                 return; // Should be disabled, but double-check
            }

            // Prevent double clicks during transition
            if (startButton) startButton.disabled = true;

            // Call the main start function
            startSurvey();
        }

        // --- Main Start Survey Function ---
        function startSurvey() {
            log("`startSurvey` function called.");
            if (!isInitialized) { error("Start aborted: Not initialized."); return; }
            if (hasTakenSurvey) { log("Start aborted: Already taken."); return; }

            surveyStartTime = new Date();
            userAnswers = {};
            questionHistory = [];
            currentQuestionId = 'START';
            log(`Starting survey at ${surveyStartTime.toISOString()}. Resetting state.`);

            if (!welcomeScreen || !surveyForm) { error("Cannot start: Welcome/Survey form missing."); if(startButton) startButton.disabled = false; /* Re-enable if start fails */ return; }

            welcomeScreen.style.display = 'none';
            surveyForm.style.display = 'block';
            if (feedbackSection) feedbackSection.style.display = 'none';
            if (completionScreen) completionScreen.style.display = 'none';
            if (backButton) backButton.classList.remove('visible');
            if (nextButton) { nextButton.style.display = ''; nextButton.disabled = true; } // Show but disable initially

            log("UI transitioned to survey form. Calling handleNextQuestion...");
            handleNextQuestion(); // Move from START to first question
        }


        // --- Shake Helper ---
        if (typeof Element.prototype.shake === 'undefined') {
            Element.prototype.shake = function() { /* ... Shake implementation ... */ this.style.animation = 'shake 0.4s ease-in-out'; setTimeout(() => { this.style.animation = ''; }, 400); };
            try { /* ... Keyframes insertion ... */ const sheet = document.styleSheets[0]; if (!Array.from(sheet.cssRules).some(r => r.type === CSSRule.KEYFRAMES_RULE && r.name === 'shake')) sheet.insertRule(`@keyframes shake { 0%, 100% { transform: translateX(0); } 20%, 60% { transform: translateX(-6px); } 40%, 80% { transform: translateX(6px); } }`, sheet.cssRules.length); } catch (e) { warn("Shake insert failed:", e); }
        }

        // --- Run Initialization ---
        initializeSurvey();

    }); // End DOMContentLoaded
})(); // End IIFE