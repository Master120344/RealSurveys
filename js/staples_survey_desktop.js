// js/staples_survey.js
(function() { // Start IIFE
    'use strict'; // Enable strict mode

    document.addEventListener('DOMContentLoaded', () => {
        // --- Constants ---
        const TIME_PER_QUESTION = 10;
        const MAX_FEEDBACK_CHARS = 500;
        const SURVEY_ID = 'staplesSurvey';
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
        let isInitialized = false; // Crucial flag

        // --- Logging Helpers ---
        const logPrefix = `[Staples Survey]:`;
        function log(message, ...args) { console.log(`${logPrefix} ${message}`, ...args); }
        function warn(message, ...args) { console.warn(`${logPrefix} WARN: ${message}`, ...args); }
        function error(message, ...args) { console.error(`${logPrefix} ERROR: ${message}`, ...args); }

        // --- Survey Questions (Staples Focus) ---
        const surveyQuestions = {
            'START': { next: 'Q1_SHOPPING_METHOD' },
            'Q1_SHOPPING_METHOD': {
                text: "How did you shop with Staples most recently?",
                type: 'radio', required: true,
                options: [
                    { value: 'in_store', label: 'In a Staples store' },
                    { value: 'online', label: 'Online at Staples.com' },
                    { value: 'app', label: 'Using the Staples App' },
                    { value: 'delivery', label: 'Received a delivery order' }
                ],
                next: 'Q2_PURPOSE'
            },
            'Q2_PURPOSE': {
                text: "What was the primary reason for your visit/purchase?",
                type: 'radio', required: true,
                options: [
                    { value: 'office_supplies', label: 'Office Supplies (paper, pens, etc.)' },
                    { value: 'technology', label: 'Technology (computers, printers, ink, etc.)' },
                    { value: 'furniture', label: 'Office Furniture' },
                    { value: 'print_marketing', label: 'Print & Marketing Services' },
                    { value: 'shipping_services', label: 'Shipping Services' },
                    { value: 'tech_services', label: 'Tech Services' },
                    { value: 'browsing', label: 'Browsing / Looking for deals' },
                    { value: 'other', label: 'Other' }
                ],
                next: 'Q3_EASE_OF_FINDING'
            },
            'Q3_EASE_OF_FINDING': {
                text: "How easy was it to find the products or services you were looking for?",
                type: 'rating', required: true,
                options: [ { value: 5, label: 'Very Easy' }, { value: 4, label: 'Easy' }, { value: 3, label: 'Neutral' }, { value: 2, label: 'Difficult' }, { value: 1, label: 'Very Difficult' } ],
                next: 'Q4_PRODUCT_AVAILABILITY'
            },
            'Q4_PRODUCT_AVAILABILITY': {
                text: "Were the specific items you needed in stock?",
                type: 'radio', required: true,
                options: [
                    { value: 'yes_all', label: 'Yes, everything I needed was available' },
                    { value: 'yes_most', label: 'Mostly, but some items were out of stock' },
                    { value: 'no_many', label: 'No, key items were out of stock' },
                    { value: 'na_did_not_check', label: 'N/A - Didn\'t look for specific items / Browsing' }
                ],
                next: 'Q5_ASSOCIATE_HELPFULNESS'
            },
            'Q5_ASSOCIATE_HELPFULNESS': {
                 text: "If you interacted with a Staples Associate (in-store, phone, chat), how helpful were they?",
                 type: 'rating', required: true, // Ask always, use N/A
                 options: [ { value: 5, label: 'Very Helpful' }, { value: 4, label: 'Helpful' }, { value: 3, label: 'Neutral' }, { value: 2, label: 'Unhelpful' }, { value: 1, label: 'Very Unhelpful' }, { value: 0, label: 'N/A - Did not interact with an Associate' } ],
                 next: 'Q6_CHECKOUT_EXPERIENCE'
            },
            'Q6_CHECKOUT_EXPERIENCE': {
                 text: "How satisfied were you with the checkout process (speed, ease, associate friendliness)?",
                 type: 'rating', required: true,
                 options: [ { value: 5, label: 'Very Satisfied' }, { value: 4, label: 'Satisfied' }, { value: 3, label: 'Neutral' }, { value: 2, label: 'Dissatisfied' }, { value: 1, label: 'Very Dissatisfied' } ],
                 next: 'Q7_STORE_WEBSITE_ORGANIZATION'
            },
             'Q7_STORE_WEBSITE_ORGANIZATION': {
                 text: (ans) => ans['Q1_SHOPPING_METHOD'] === 'in_store' ? "How would you rate the overall organization and cleanliness of the store?" : "How would you rate the organization and ease of use of the website/app?",
                 type: 'rating', required: true,
                 options: [ { value: 5, label: 'Excellent' }, { value: 4, label: 'Good' }, { value: 3, label: 'Average' }, { value: 2, label: 'Poor' }, { value: 1, label: 'Very Poor' } ],
                 next: 'Q8_PRICING_VALUE'
            },
            'Q8_PRICING_VALUE': {
                text: "How would you rate the prices and overall value offered by Staples?",
                type: 'rating', required: true,
                options: [ { value: 5, label: 'Excellent Value' }, { value: 4, label: 'Good Value' }, { value: 3, label: 'Fair Value' }, { value: 2, label: 'Poor Value' }, { value: 1, label: 'Very Poor Value' } ],
                next: 'Q9_RECOMMENDATION'
            },
            'Q9_RECOMMENDATION': {
                text: "How likely are you to recommend Staples for business or personal needs?",
                type: 'rating', required: true,
                options: [ { value: 5, label: 'Very Likely' }, { value: 4, label: 'Likely' }, { value: 3, label: 'Neutral' }, { value: 2, label: 'Unlikely' }, { value: 1, label: 'Very Unlikely' } ],
                next: 'FEEDBACK'
            },
            'FEEDBACK': { type: 'textarea', next: 'COMPLETE' },
            'COMPLETE': { type: 'completion' }
        };


        // --- Core Survey Logic Functions ---
        // (Timer, Render, Validation, Navigation, Collect, Submit - adapted from previous working versions)

        function startTimer() { stopTimer(); timeLeft = TIME_PER_QUESTION; updateTimerDisplay(); timerContainer?.classList.remove('low-time'); timerInterval = setInterval(() => { timeLeft--; updateTimerDisplay(); if (timeLeft <= 3) timerContainer?.classList.add('low-time'); if (timeLeft <= 0) { log("Timer expired."); stopTimer(); handleAutoAdvance(); } }, 1000); /* log(`Timer started...`); */ }
        function stopTimer() { if (timerInterval) { clearInterval(timerInterval); timerInterval = null; timerContainer?.classList.remove('low-time'); /* log("Timer stopped."); */ } }
        function updateTimerDisplay() { if (timerDisplay) timerDisplay.textContent = `00:${String(timeLeft).padStart(2, '0')}`; }
        function handleAutoAdvance() { log(`Auto-advancing from: ${currentQuestionId}`); collectAnswer(currentQuestionId); handleNextQuestion(true); }

        function renderQuestion(questionId) {
            log(`Rendering question: ${questionId}`);
            const question = surveyQuestions[questionId];
            if (!question || !questionContainer) { error(`Cannot render: Missing def/container for ${questionId}.`); showFeedbackSection(); return; }
            if (question.type === 'textarea' || question.type === 'completion') { error(`Cannot render non-question type: ${question.type}`); showFeedbackSection(); return; }

            stopTimer(); questionContainer.innerHTML = '';
            const fieldset = document.createElement('fieldset'); fieldset.id = `q_${questionId}`; fieldset.classList.add('question-card'); fieldset.setAttribute('aria-labelledby', `legend_${questionId}`);
            const legend = document.createElement('legend'); legend.id = `legend_${questionId}`; legend.innerHTML = typeof question.text === 'function' ? question.text(userAnswers) : question.text; fieldset.appendChild(legend);
            const optionsList = document.createElement('ul'); optionsList.classList.add('options-list');
            if (question.type === 'radio' || question.type === 'rating') optionsList.setAttribute('role', 'radiogroup'); else if (question.type === 'checkbox') optionsList.setAttribute('role', 'group');

            if (question.options && Array.isArray(question.options)) {
                question.options.forEach((option, index) => {
                    const li = document.createElement('li'); const id = `q_${questionId}_opt${index}`;
                    const input = document.createElement('input'); input.type = question.type === 'checkbox' ? 'checkbox' : 'radio'; input.id = id; input.name = `q_${questionId}`; input.value = option.value;
                    const ans = userAnswers[questionId]; if (ans !== undefined) { if(input.type === 'radio' && String(ans) === String(option.value)) input.checked = true; else if (input.type === 'checkbox' && Array.isArray(ans) && ans.map(String).includes(String(option.value))) input.checked = true; }
                    const label = document.createElement('label'); label.htmlFor = id; const span = document.createElement('span'); span.textContent = option.label; label.appendChild(input); label.appendChild(span);
                    input.addEventListener('change', (e) => handleInputChange(questionId, question, e)); li.appendChild(label); optionsList.appendChild(li);
                });
                fieldset.appendChild(optionsList);
                const helpTextContent = question.maxSelection ? `(Select up to ${question.maxSelection})` : question.helpText; if (helpTextContent) { const help = document.createElement('p'); help.id = `info_${questionId}`; help.classList.add('checkbox-help-text'); help.textContent = helpTextContent; fieldset.appendChild(help); optionsList.setAttribute('aria-describedby', `info_${questionId}`); }
            } else { warn(`No options for ${questionId}.`); }

            questionContainer.appendChild(fieldset); log(`Rendered ${questionId}.`);
            updateNavigationButtons(); updateProgressBar(); validateCurrentQuestion(); startTimer();
        }

        function handleInputChange(questionId, questionDef, event = null) { if (questionDef.type === 'checkbox' && questionDef.maxSelection && event?.target.checked) { const fieldset = document.getElementById(`q_${questionId}`); if(fieldset){ const count = fieldset.querySelectorAll(`input[name="q_${questionId}"]:checked`).length; if (count > questionDef.maxSelection) { event.target.checked = false; alert(`Max ${questionDef.maxSelection} options.`); return; } } } validateCurrentQuestion(); }

        function validateCurrentQuestion(isAutoAdvance = false) {
            if (!currentQuestionId || !surveyQuestions[currentQuestionId] || ['START', 'FEEDBACK', 'COMPLETE'].includes(currentQuestionId)) { if(nextButton) nextButton.disabled = true; return false; }
            if (!nextButton) { error("Validation check failed: Next button missing."); return false; }
            const question = surveyQuestions[currentQuestionId]; if (isAutoAdvance) { nextButton.disabled = false; return true; }
            let isRequired = question.required; if (typeof isRequired === 'function') { try { isRequired = isRequired(userAnswers); } catch (e) { error(`Error in 'required' fn for ${currentQuestionId}:`, e); isRequired = false; } }
            if (!isRequired) { nextButton.disabled = false; return true; }
            let isValid = false; const fieldset = document.getElementById(`q_${currentQuestionId}`);
            if (fieldset) { if (question.type === 'radio' || question.type === 'rating') isValid = fieldset.querySelector(`input[name="q_${currentQuestionId}"]:checked`) !== null; else if (question.type === 'checkbox') isValid = fieldset.querySelectorAll(`input[name="q_${currentQuestionId}"]:checked`).length > 0; else isValid = true; } else { error(`Validation failed: Fieldset missing for ${currentQuestionId}.`); }
            nextButton.disabled = !isValid; return isValid;
        }

        function collectAnswer(questionId) {
            if (!questionId || questionId === 'START' || !surveyQuestions[questionId]) return; const question = surveyQuestions[questionId]; const fieldset = document.getElementById(`q_${questionId}`); if (!fieldset || question.type === 'textarea' || question.type === 'completion') return;
            let answer; try { if (question.type === 'radio' || question.type === 'rating') answer = fieldset.querySelector(`input[name="q_${questionId}"]:checked`)?.value; else if (question.type === 'checkbox') { const checked = Array.from(fieldset.querySelectorAll(`input[name="q_${questionId}"]:checked`)); answer = checked.length > 0 ? checked.map(cb => cb.value) : undefined; } if (answer !== undefined) userAnswers[questionId] = answer; else if (userAnswers.hasOwnProperty(questionId)) delete userAnswers[questionId]; } catch (e) { error(`Collect answer error for ${questionId}:`, e); if(userAnswers.hasOwnProperty(questionId)) delete userAnswers[questionId]; }
        }

        function getNextQuestionId() {
            if (!currentQuestionId) return surveyQuestions['START']?.next || 'FEEDBACK'; const question = surveyQuestions[currentQuestionId]; if (!question) { error(`GetNext failed: Def missing for ${currentQuestionId}`); return 'FEEDBACK'; } const nextLogic = question.next; if (!nextLogic) return 'FEEDBACK'; if (typeof nextLogic === 'string') return nextLogic; if (typeof nextLogic === 'function') { try { return nextLogic(userAnswers) || 'FEEDBACK'; } catch (e) { error(`'Next' fn error for ${currentQuestionId}:`, e); return 'FEEDBACK'; } } warn(`Unsupported 'next' type for ${currentQuestionId}`); return 'FEEDBACK';
        }

        function handleNextQuestion(isAutoAdvance = false) {
            // log(`HandleNext. Current: ${currentQuestionId}, Auto: ${isAutoAdvance}`);
            if (currentQuestionId && currentQuestionId !== 'START') collectAnswer(currentQuestionId);
            if (!isAutoAdvance && !validateCurrentQuestion()) { warn(`Validation failed for ${currentQuestionId}.`); try { questionContainer?.querySelector('.question-card')?.shake?.(); } catch(e){ error("Shake error:", e);} return; }
            stopTimer(); const nextId = getNextQuestionId(); if (currentQuestionId && currentQuestionId !== 'START') questionHistory.push(currentQuestionId); currentQuestionId = nextId; log(`Transitioning to: ${currentQuestionId}`);
            if (!currentQuestionId) { error("Next ID invalid."); showFeedbackSection(); return; }
            switch (currentQuestionId) { case 'FEEDBACK': showFeedbackSection(); break; case 'COMPLETE': submitSurvey(); break; default: surveyQuestions[currentQuestionId] ? renderQuestion(currentQuestionId) : (error(`Invalid next ID: ${currentQuestionId}`), showFeedbackSection()); break; }
        }

        function handlePreviousQuestion() {
            log("HandlePrevious."); if (questionHistory.length === 0) { log("No history."); return; } stopTimer(); currentQuestionId = questionHistory.pop(); log(`Going back to: ${currentQuestionId}`);
            if (surveyQuestions[currentQuestionId]) renderQuestion(currentQuestionId); else { error(`Invalid prev ID: ${currentQuestionId}`); if(questionHistory.length > 0) handlePreviousQuestion(); else initializeSurvey(); }
        }

        function updateNavigationButtons() { if(backButton) backButton.classList.toggle('visible', questionHistory.length > 0); if (nextButton) { const isQStep = currentQuestionId && surveyQuestions[currentQuestionId] && !['START','FEEDBACK','COMPLETE'].includes(currentQuestionId); nextButton.style.display = isQStep ? '' : 'none'; if (!isQStep) nextButton.disabled = true; } }
        function updateProgressBar() { if (!progressBar) return; const qKeys = Object.keys(surveyQuestions).filter(id => !['START', 'FEEDBACK', 'COMPLETE'].includes(id) && surveyQuestions[id].type !== 'textarea'); const total = qKeys.length; if(total === 0) { progressBar.style.width = '0%'; return; } let currentIdx = qKeys.indexOf(currentQuestionId); const stepsDone = (currentIdx >= 0) ? currentIdx + 1 : questionHistory.length + 1; const progress = Math.min((stepsDone / total) * 100, 100); progressBar.style.width = `${progress}%`; }
        function showFeedbackSection() { log("Showing feedback section."); stopTimer(); if(surveyForm) surveyForm.style.display = 'none'; if(welcomeScreen) welcomeScreen.style.display = 'none'; if(completionScreen) completionScreen.style.display = 'none'; if(feedbackSection) feedbackSection.style.display = 'block'; else error("Feedback section missing."); if(finalFeedbackInput){ finalFeedbackInput.value = userAnswers['FEEDBACK'] || ''; updateCharCount(); } if(backButton) backButton.classList.remove('visible'); if(nextButton) nextButton.style.display = 'none'; }
        function updateCharCount() { if (!finalFeedbackInput || !charCountDisplay) return; const len = finalFeedbackInput.value.length; charCountDisplay.textContent = `${len}/${MAX_FEEDBACK_CHARS} chars`; const isOver = len > MAX_FEEDBACK_CHARS; charCountDisplay.classList.toggle('limit-exceeded', isOver); if(submitSurveyButton) submitSurveyButton.disabled = isOver; }

        function submitSurvey() {
            log("Submitting survey..."); stopTimer();
            if (feedbackSection?.style.display === 'block' && finalFeedbackInput) { const fb = finalFeedbackInput.value.trim(); if (fb.length > MAX_FEEDBACK_CHARS) { alert(`Feedback too long.`); return; } userAnswers['FEEDBACK'] = fb; } else if (userAnswers.hasOwnProperty('FEEDBACK') && userAnswers['FEEDBACK'] !== 'skipped') delete userAnswers['FEEDBACK'];
            const endTime = new Date(); const duration = surveyStartTime ? Math.round((endTime-surveyStartTime)/1000) : 0; userAnswers['meta'] = { surveyId: SURVEY_ID, start: surveyStartTime?.toISOString(), end: endTime.toISOString(), durationS: duration, ua: navigator.userAgent };
            log("---- STAPLES SURVEY RESULTS ----"); try{ log(JSON.stringify(userAnswers, null, 2)); } catch(e){ error("Stringify failed:", e); log("Raw:", userAnswers); } log("---- END RESULTS ----");
            log("Simulating backend..."); const email = "staples_user_" + Math.random().toString(16).slice(2, 8) + "@realsurveys-example.com"; const reward = 0.60;
            setTimeout(() => { log(`Reward $${reward.toFixed(2)} for ${email}.`); if (completionMessage) completionMessage.textContent = `Reward $${reward.toFixed(2)} processed for ${email}.`; }, 1250);
            if(surveyForm) surveyForm.style.display = 'none'; if(feedbackSection) feedbackSection.style.display = 'none'; if(completionScreen) completionScreen.style.display = 'block'; else error("Completion screen missing.");
            if (typeof confetti === 'function') { try { confetti({ particleCount: 140, spread: 85, origin: { y: 0.6 }, colors: [var(--staples-red), '#FFFFFF', '#AAAAAA'] }); } catch (e) { warn("Confetti failed:", e); confetti({ particleCount: 100, spread: 70, origin: { y: 0.6 }, colors: ['#D50032', '#FFFFFF', '#AAAAAA'] }); } } else log("Confetti unavailable.");
            try { localStorage.setItem(SURVEY_TAKEN_KEY, 'true'); hasTakenSurvey = true; log("Survey marked taken."); } catch (e) { error("localStorage failed:", e); }
            const redirectDelay = 6000; log(`Redirecting in ${redirectDelay/1000}s...`); setTimeout(() => { window.location.href = 'surveys.html'; }, redirectDelay);
        }

        // --- Initialization ---
        function initializeSurvey() {
            log("----- INITIALIZING SURVEY -----");
            isInitialized = false; log("Selecting DOM elements...");
            welcomeScreen = document.getElementById('welcome-screen'); startButton = document.getElementById('startButton'); surveyForm = document.getElementById('staplesSurveyForm'); questionContainer = document.getElementById('question-container'); backButton = document.getElementById('backButton'); nextButton = document.getElementById('nextButton'); timerDisplay = document.getElementById('timeLeft'); timerContainer = document.getElementById('timer'); progressBar = document.getElementById('progressBar'); feedbackSection = document.getElementById('feedback-section'); finalFeedbackInput = document.getElementById('finalFeedback'); charCountDisplay = document.getElementById('char-count'); skipFeedbackButton = document.getElementById('skipFeedbackButton'); submitSurveyButton = document.getElementById('submitSurveyButton'); completionScreen = document.getElementById('completion-screen'); completionMessage = document.getElementById('completion-message'); initErrorMessage = document.getElementById('initErrorMessage');
            const essentialElements = { welcomeScreen, startButton, surveyForm, questionContainer, backButton, nextButton, feedbackSection, completionScreen, initErrorMessage };
            let missingIds = Object.keys(essentialElements).filter(id => !essentialElements[id]);
            if (missingIds.length > 0) { const errorMsg = `Init failed: Cannot find element(s): ${missingIds.join(', ')}.`; error(errorMsg); if(initErrorMessage) { initErrorMessage.textContent = errorMsg; initErrorMessage.style.display = 'block'; } if(startButton) startButton.disabled = true; return; }
            log("All essential DOM elements found."); initErrorMessage.style.display = 'none';
            log("Checking survey taken status..."); try { hasTakenSurvey = localStorage.getItem(SURVEY_TAKEN_KEY) === 'true'; log(`Survey taken: ${hasTakenSurvey}`); } catch (e) { error("Failed localStorage access:", e); hasTakenSurvey = false; initErrorMessage.textContent = "Warning: Status check failed."; initErrorMessage.style.display = 'block'; }
            log("Configuring Start Button..."); startButton.removeEventListener('click', startSurveyHandler); // Remove potential duplicates
            if (hasTakenSurvey) { log("Setting button to 'Completed'."); startButton.disabled = true; startButton.textContent = "Survey Completed"; startButton.style.cursor = "not-allowed"; startButton.style.backgroundColor = "#adb5bd"; } else { log("Setting button to 'Ready' and adding listener."); startButton.disabled = false; startButton.textContent = "Start Survey"; startButton.style.cursor = "pointer"; startButton.style.backgroundColor = ""; startButton.addEventListener('click', startSurveyHandler); log("Click listener ADDED."); } // ** Attach listener **
            log("Attaching other listeners..."); nextButton?.addEventListener('click', () => handleNextQuestion(false)); backButton?.addEventListener('click', handlePreviousQuestion); finalFeedbackInput?.addEventListener('input', updateCharCount); skipFeedbackButton?.addEventListener('click', () => { log("Skip clicked."); userAnswers['FEEDBACK'] = 'skipped'; submitSurvey(); }); submitSurveyButton?.addEventListener('click', submitSurvey); surveyForm?.addEventListener('submit', (e) => { e.preventDefault(); });
            log("Setting initial UI state..."); surveyForm.style.display = 'none'; feedbackSection.style.display = 'none'; completionScreen.style.display = 'none'; if(backButton) backButton.classList.remove('visible'); if(nextButton) nextButton.disabled = true;
            isInitialized = true; log("----- SURVEY INITIALIZATION COMPLETE -----");
        }

        function startSurveyHandler(event) {
            log("`startSurveyHandler` triggered!"); if (!isInitialized) { error("Not initialized."); return; } if (hasTakenSurvey) { log("Start ignored: Taken."); return; }
            if (startButton) startButton.disabled = true; // Prevent double click
            startSurvey();
        }

        function startSurvey() {
            log("`startSurvey` called."); if (!isInitialized) { error("Start aborted: Not init."); return; } if (hasTakenSurvey) { log("Start aborted: Taken."); return; }
            surveyStartTime = new Date(); userAnswers = {}; questionHistory = []; currentQuestionId = 'START'; log(`Starting survey at ${surveyStartTime.toISOString()}.`);
            if (!welcomeScreen || !surveyForm) { error("Cannot start: Welcome/Survey form missing."); if(startButton) startButton.disabled = false; return; }
            welcomeScreen.style.display = 'none'; surveyForm.style.display = 'block'; if (feedbackSection) feedbackSection.style.display = 'none'; if (completionScreen) completionScreen.style.display = 'none'; if (backButton) backButton.classList.remove('visible'); if (nextButton) { nextButton.style.display = ''; nextButton.disabled = true; }
            log("UI transitioned. Calling handleNextQuestion..."); handleNextQuestion();
        }

        // --- Shake Helper ---
        if (typeof Element.prototype.shake === 'undefined') { Element.prototype.shake = function() { this.style.animation = 'shake 0.4s ease-in-out'; setTimeout(() => { this.style.animation = ''; }, 400); }; try { const sheet = document.styleSheets[0]; if (!Array.from(sheet.cssRules).some(r => r.type === CSSRule.KEYFRAMES_RULE && r.name === 'shake')) sheet.insertRule(`@keyframes shake { 0%, 100% { transform: translateX(0); } 20%, 60% { transform: translateX(-6px); } 40%, 80% { transform: translateX(6px); } }`, sheet.cssRules.length); } catch (e) { warn("Shake insert failed:", e); } }

        // --- Run Initialization ---
        initializeSurvey();

    }); // End DOMContentLoaded

})(); // End IIFE