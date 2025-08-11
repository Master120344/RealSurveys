document.addEventListener('DOMContentLoaded', () => {
    // --- Constants ---
    const TIME_PER_QUESTION = 10;
    const MAX_FEEDBACK_CHARS = 500;
    const SURVEY_ID = 'officedepotSurvey';
    const SURVEY_TAKEN_KEY = `${SURVEY_ID}_taken`; // LocalStorage key

    // --- DOM Elements (Checked in initializeSurvey) ---
    let welcomeScreen, startButton, surveyForm, questionContainer, backButton, nextButton,
        timerDisplay, timerContainer, progressBar, feedbackSection, finalFeedbackInput,
        charCountDisplay, skipFeedbackButton, submitSurveyButton, completionScreen,
        completionMessage, initErrorMessage; // Added init error message element

    // --- State Variables ---
    let currentQuestionId = null;
    let userAnswers = {};
    let questionHistory = [];
    let timerInterval = null;
    let timeLeft = TIME_PER_QUESTION;
    let surveyStartTime = null;
    let hasTakenSurvey = false; // Initialized in initializeSurvey

    // --- Logging Helpers ---
    const logPrefix = `[OfficeDepot Survey]:`;
    function log(message, ...args) { console.log(`${logPrefix} ${message}`, ...args); }
    function warn(message, ...args) { console.warn(`${logPrefix} WARN: ${message}`, ...args); }
    function error(message, ...args) { console.error(`${logPrefix} ERROR: ${message}`, ...args); }

    // --- Survey Questions (Office Depot Focus) ---
    const surveyQuestions = {
        'START': { next: 'Q1_SHOPPING_TYPE' },
        'Q1_SHOPPING_TYPE': {
            text: "Was your most recent experience in-store or online?",
            type: 'radio',
            required: true,
            options: [
                { value: 'in_store', label: 'In-Store (Office Depot / OfficeMax)' },
                { value: 'online', label: 'Online (OfficeDepot.com)' },
                { value: 'both', label: 'Both In-Store and Online' }
            ],
            next: 'Q2_PURPOSE'
        },
        'Q2_PURPOSE': {
            text: "What was the main reason for your visit/purchase? (Select main reason)",
            type: 'radio',
            required: true,
            options: [
                { value: 'office_supplies', label: 'Office Supplies (pens, paper, folders, etc.)' },
                { value: 'technology', label: 'Technology (computer, printer, accessories, etc.)' },
                { value: 'furniture', label: 'Office Furniture (desk, chair, storage, etc.)' },
                { value: 'print_copy', label: 'Print & Copy Services' },
                { value: 'shipping_mailing', label: 'Shipping / Mailing Supplies or Services' },
                { value: 'other', label: 'Other' }
            ],
            next: 'Q3_FIND_ITEMS'
        },
        'Q3_FIND_ITEMS': {
            text: "How easy was it to find the items you were looking for?",
            type: 'rating',
            required: true,
            options: [
                { value: 5, label: 'Very Easy' }, { value: 4, label: 'Easy' },
                { value: 3, label: 'Neutral' }, { value: 2, label: 'Difficult' },
                { value: 1, label: 'Very Difficult' }
            ],
            next: 'Q4_PRODUCT_AVAILABILITY'
        },
        'Q4_PRODUCT_AVAILABILITY': {
            text: "Were the products you wanted in stock?",
            type: 'radio',
            required: true,
            options: [
                { value: 'yes_all', label: 'Yes, everything was in stock' },
                { value: 'yes_most', label: 'Mostly, but some items were out of stock' },
                { value: 'no_many', label: 'No, many items were out of stock' },
                { value: 'na_browsing', label: 'N/A - I was just browsing / didn\'t look for specific items' }
            ],
            next: 'Q5_PRICING_VALUE'
        },
        'Q5_PRICING_VALUE': {
            text: "How would you rate the pricing and value for the products/services?",
            type: 'rating',
            required: true,
            options: [
                { value: 5, label: 'Excellent Value' }, { value: 4, label: 'Good Value' },
                { value: 3, label: 'Fair Value' }, { value: 2, label: 'Poor Value' },
                { value: 1, label: 'Very Poor Value' }
            ],
            next: 'Q6_STAFF_HELPFULNESS'
        },
        'Q6_STAFF_HELPFULNESS': {
            text: "If you interacted with staff (in-store or online chat/phone), how helpful were they?",
            type: 'rating',
            required: true, // Always ask, can select N/A
            options: [
                { value: 5, label: 'Very Helpful' }, { value: 4, label: 'Helpful' },
                { value: 3, label: 'Neutral' }, { value: 2, label: 'Unhelpful' },
                { value: 1, label: 'Very Unhelpful' },
                { value: 0, label: 'N/A - Did not interact with staff' }
            ],
            next: 'Q7_CHECKOUT_EXPERIENCE'
        },
        'Q7_CHECKOUT_EXPERIENCE': {
            text: "How would you rate your checkout experience (speed, ease, friendliness)?",
            type: 'rating',
            required: true,
            options: [
                { value: 5, label: 'Excellent' }, { value: 4, label: 'Good' },
                { value: 3, label: 'Average' }, { value: 2, label: 'Poor' },
                { value: 1, label: 'Very Poor' }
            ],
            next: 'Q8_STORE_ONLINE_CLEANLINESS' // Adjusted based on context
        },
        'Q8_STORE_ONLINE_CLEANLINESS': {
             text: (ans) => ['in_store', 'both'].includes(ans['Q1_SHOPPING_TYPE']) ? "How would you rate the cleanliness and organization of the store?" : "How would you rate the appearance and organization of the website?",
             type: 'rating',
             required: true,
             options: [
                 { value: 5, label: 'Excellent' }, { value: 4, label: 'Good' },
                 { value: 3, label: 'Average' }, { value: 2, label: 'Poor' },
                 { value: 1, label: 'Very Poor' }
             ],
             next: 'Q9_RECOMMENDATION'
        },
        'Q9_RECOMMENDATION': {
            text: "How likely are you to recommend Office Depot / OfficeMax to a friend or colleague?",
            type: 'rating',
            required: true,
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

    // --- Core Survey Functions (Timer, Rendering, Validation, Navigation, etc.) ---
    // These functions are largely similar to previous examples, with added logging/checks

    function startTimer() {
        stopTimer(); // Clear any existing timer
        timeLeft = TIME_PER_QUESTION;
        updateTimerDisplay();
        if (timerContainer) timerContainer.classList.remove('low-time'); else warn("Timer container missing for class removal.");
        timerInterval = setInterval(() => {
            timeLeft--;
            updateTimerDisplay();
            if (timeLeft <= 3 && timerContainer) timerContainer.classList.add('low-time');
            if (timeLeft <= 0) {
                log("Timer expired.");
                stopTimer();
                handleAutoAdvance();
            }
        }, 1000);
        log(`Timer started for question ${currentQuestionId}.`);
    }

    function stopTimer() {
        if (timerInterval) {
            clearInterval(timerInterval);
            timerInterval = null;
            if (timerContainer) timerContainer.classList.remove('low-time');
            log("Timer stopped.");
        }
    }

    function updateTimerDisplay() {
        if (!timerDisplay) return; // Don't log error every second
        timerDisplay.textContent = `00:${String(timeLeft).padStart(2, '0')}`;
    }

    function handleAutoAdvance() {
        log(`Auto-advancing from: ${currentQuestionId}`);
        collectAnswer(currentQuestionId); // Attempt collection
        handleNextQuestion(true); // Force advance, bypass validation
    }

    function renderQuestion(questionId) {
        log(`Attempting to render question: ${questionId}`);
        const question = surveyQuestions[questionId];

        if (!question || !questionContainer) {
            error(`Cannot render: Question definition missing for ${questionId} or questionContainer element not found.`);
            showFeedbackSection(); // Fallback
            return;
        }
        if (question.type === 'textarea' || question.type === 'completion') {
            error(`Cannot render non-question type: ${question.type}`);
            showFeedbackSection(); // Fallback
            return;
        }

        stopTimer();
        questionContainer.innerHTML = ''; // Clear previous

        const fieldset = document.createElement('fieldset');
        fieldset.id = `q_${questionId}`;
        fieldset.classList.add('question-card');
        fieldset.setAttribute('aria-labelledby', `legend_${questionId}`);

        const legend = document.createElement('legend');
        legend.id = `legend_${questionId}`;
         // Allow text to be a function for dynamic question text
         legend.innerHTML = typeof question.text === 'function' ? question.text(userAnswers) : question.text;
        fieldset.appendChild(legend);

        const optionsList = document.createElement('ul');
        optionsList.classList.add('options-list');
        // ARIA roles
        if (question.type === 'radio' || question.type === 'rating') optionsList.setAttribute('role', 'radiogroup');
        else if (question.type === 'checkbox') optionsList.setAttribute('role', 'group');

        if (question.options && Array.isArray(question.options)) {
            question.options.forEach((option, index) => {
                const li = document.createElement('li');
                const id = `q_${questionId}_opt${index}`;
                const input = document.createElement('input');
                input.type = question.type === 'checkbox' ? 'checkbox' : 'radio';
                input.id = id;
                input.name = `q_${questionId}`;
                input.value = option.value;

                // Pre-check based on existing answer
                const ans = userAnswers[questionId];
                if (ans !== undefined) {
                    if (input.type === 'radio' && String(ans) === String(option.value)) input.checked = true;
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

            // Help text
             const helpTextContent = question.maxSelection ? `(Select up to ${question.maxSelection})` : question.helpText;
             if (helpTextContent) {
                 const help = document.createElement('p');
                 help.id = `info_${questionId}`;
                 help.classList.add('checkbox-help-text');
                 help.textContent = helpTextContent;
                 fieldset.appendChild(help);
                 optionsList.setAttribute('aria-describedby', `info_${questionId}`); // Link help text
             }

        } else {
            warn(`No options defined for question ${questionId}.`);
        }

        questionContainer.appendChild(fieldset);
        log(`Question ${questionId} successfully appended to container.`);

        // Update UI state after rendering
        updateNavigationButtons();
        updateProgressBar();
        validateCurrentQuestion(); // Validate the new question
        startTimer(); // Start the timer for this question
    }


    function handleInputChange(questionId, questionDef, event = null) {
        log(`Input change detected for: ${questionId}`);
        // Checkbox max selection logic
        if (questionDef.type === 'checkbox' && questionDef.maxSelection && event?.target.checked) {
            const formElement = document.getElementById(`q_${questionId}`);
            if(formElement){
                const checkedCount = formElement.querySelectorAll(`input[name="q_${questionId}"]:checked`).length;
                if (checkedCount > questionDef.maxSelection) {
                    event.target.checked = false; // Undo the check
                    alert(`Maximum selection is ${questionDef.maxSelection}.`);
                    warn(`Checkbox limit (${questionDef.maxSelection}) exceeded for ${questionId}.`);
                    return; // Stop validation update for this specific change event
                }
            } else {
                error(`Fieldset q_${questionId} not found for checkbox limit check.`);
            }
        }
        validateCurrentQuestion(); // Re-validate after any change
    }

    function validateCurrentQuestion(isAutoAdvance = false) {
         // Initial state or non-question step
        if (!currentQuestionId || currentQuestionId === 'START' || currentQuestionId === 'FEEDBACK' || currentQuestionId === 'COMPLETE') {
            if(nextButton) nextButton.disabled = true; // Disable next if not in a question
            return false;
        }

        if (!nextButton) {
            error("Next button missing during validation.");
            return false;
        }

        const question = surveyQuestions[currentQuestionId];

        if (isAutoAdvance) { // Force enable for auto-advance
            nextButton.disabled = false;
            return true;
        }

        if (!question) { // Definition missing
            error(`Validation failed: Question definition missing for ${currentQuestionId}.`);
            nextButton.disabled = true;
            return false;
        }

        // Determine requirement
        let isRequired = question.required;
        if (typeof isRequired === 'function') {
            try { isRequired = isRequired(userAnswers); }
            catch (e) { error(`Error in 'required' function for ${currentQuestionId}:`, e); isRequired = false; }
        }

        // If not required, it's always valid to proceed
        if (!isRequired) {
            nextButton.disabled = false;
            return true;
        }

        // --- Validate required question based on type ---
        let isValid = false;
        const formElement = document.getElementById(`q_${questionId}`); // Use currentQuestionId? yes.
        const currentFieldset = document.getElementById(`q_${currentQuestionId}`);

        if (currentFieldset) {
            if (question.type === 'radio' || question.type === 'rating') {
                isValid = currentFieldset.querySelector(`input[name="q_${currentQuestionId}"]:checked`) !== null;
            } else if (question.type === 'checkbox') {
                isValid = currentFieldset.querySelectorAll(`input[name="q_${currentQuestionId}"]:checked`).length > 0;
            } else {
                warn(`Validation not implemented for type: ${question.type}. Assuming valid for now.`);
                isValid = true; // Default assumption for unknown required types
            }
        } else {
            error(`Validation failed: Fieldset missing for ${currentQuestionId}.`);
            isValid = false; // Cannot be valid if elements are missing
        }

        nextButton.disabled = !isValid;
        log(`Validation for ${currentQuestionId}: ${isValid} (Required: ${isRequired})`);
        return isValid;
    }

    function collectAnswer(questionId) {
        if (!questionId || questionId === 'START' || !surveyQuestions[questionId]) {
            // log(`Skipping answer collection for invalid/START ID: ${questionId}`);
            return; // Don't collect for START or invalid IDs
        }

        const question = surveyQuestions[questionId];
        const fieldsetElement = document.getElementById(`q_${questionId}`);

        // Skip collection for non-input types or if elements are missing
        if (question.type === 'textarea' || question.type === 'completion' || !fieldsetElement) {
            // log(`Skipping answer collection for type ${question.type} or missing fieldset.`);
            return;
        }

        let answer;
        try {
            if (question.type === 'radio' || question.type === 'rating') {
                const checkedInput = fieldsetElement.querySelector(`input[name="q_${questionId}"]:checked`);
                answer = checkedInput ? checkedInput.value : undefined;
            } else if (question.type === 'checkbox') {
                const checkedBoxes = Array.from(fieldsetElement.querySelectorAll(`input[name="q_${questionId}"]:checked`));
                answer = checkedBoxes.length > 0 ? checkedBoxes.map(cb => cb.value) : undefined;
            }
            // Add other types if needed

            // Store or clear the answer
            if (answer !== undefined) {
                userAnswers[questionId] = answer;
                log(`Answer collected for ${questionId}: ${JSON.stringify(answer)}`);
            } else {
                if (userAnswers.hasOwnProperty(questionId)) {
                    delete userAnswers[questionId];
                    log(`Answer cleared for ${questionId}.`);
                }
                 // else { log(`No answer provided for ${questionId}.`); }
            }
        } catch (e) {
            error(`Error collecting answer for ${questionId}:`, e);
            if (userAnswers.hasOwnProperty(questionId)) delete userAnswers[questionId]; // Clear potentially corrupt data
        }
    }

    function getNextQuestionId() {
         if (!currentQuestionId) return surveyQuestions['START']?.next || 'FEEDBACK'; // Initial call

         const question = surveyQuestions[currentQuestionId];
         if (!question) { error(`Cannot get next: Def missing for ${currentQuestionId}.`); return 'FEEDBACK'; }

         const nextLogic = question.next;
         if (!nextLogic) return 'FEEDBACK'; // End of defined path

         if (typeof nextLogic === 'string') return nextLogic;
         if (typeof nextLogic === 'function') {
             try { return nextLogic(userAnswers) || 'FEEDBACK'; } // Default if function returns falsy
             catch (e) { error(`Error in 'next' function for ${currentQuestionId}:`, e); return 'FEEDBACK'; }
         }
        // Add object logic if needed later

         warn(`Unsupported 'next' logic type for ${currentQuestionId}.`);
         return 'FEEDBACK'; // Fallback
    }

    function handleNextQuestion(isAutoAdvance = false) {
        log(`Handling next. Current: ${currentQuestionId}, AutoAdvance: ${isAutoAdvance}`);

        // Collect current answer *before* deciding next step
        if (currentQuestionId && currentQuestionId !== 'START') {
            collectAnswer(currentQuestionId);
        }

        // Validate *unless* auto-advancing
        if (!isAutoAdvance && !validateCurrentQuestion()) {
            warn(`Validation failed for ${currentQuestionId}. Next cancelled.`);
            try { questionContainer?.querySelector('.question-card')?.shake?.(); } // Visual cue
            catch(e) { error("Shake failed:", e); }
            return;
        }

        // --- Determine and transition ---
        stopTimer();
        const nextId = getNextQuestionId();

        if (currentQuestionId && currentQuestionId !== 'START') { // Push valid previous step to history
            questionHistory.push(currentQuestionId);
        }
        currentQuestionId = nextId; // Update state
        log(`Transitioning to: ${currentQuestionId}`);

        // --- Render or Act ---
         if (!currentQuestionId) { error("Next ID is invalid. Stopping."); showFeedbackSection(); return; }

        switch (currentQuestionId) {
            case 'FEEDBACK': showFeedbackSection(); break;
            case 'COMPLETE': submitSurvey(); break;
            default:
                if (surveyQuestions[currentQuestionId]) renderQuestion(currentQuestionId);
                else { error(`Invalid next question ID: ${currentQuestionId}`); showFeedbackSection(); }
                break;
        }
    }

    function handlePreviousQuestion() {
        log("Handling previous.");
        if (questionHistory.length === 0) { log("No history."); return; }

        stopTimer();
        currentQuestionId = questionHistory.pop(); // Go back
        log(`Transitioning back to: ${currentQuestionId}`);

         if (surveyQuestions[currentQuestionId]) renderQuestion(currentQuestionId);
         else {
             error(`Invalid previous ID: ${currentQuestionId}. Attempting recovery.`);
             if (questionHistory.length > 0) handlePreviousQuestion(); // Try going back further
             else initializeSurvey(); // Reset if history exhausted/corrupt
         }
    }

    function updateNavigationButtons() {
         // Back Button
        if (backButton) backButton.classList.toggle('visible', questionHistory.length > 0);

         // Next Button (Visibility handled by step, state by validation)
         if (nextButton) {
             const isQuestionStep = currentQuestionId && surveyQuestions[currentQuestionId] && !['START', 'FEEDBACK', 'COMPLETE'].includes(currentQuestionId);
             nextButton.style.display = isQuestionStep ? '' : 'none';
              // Validation will handle enabling/disabling if it's visible
             if (!isQuestionStep) nextButton.disabled = true;
         }
    }

    function updateProgressBar() {
        if (!progressBar) return;
        const questionKeys = Object.keys(surveyQuestions).filter(id => !['START', 'FEEDBACK', 'COMPLETE'].includes(id) && surveyQuestions[id].type !== 'textarea');
        const totalSteps = questionKeys.length;
        if (totalSteps === 0) { progressBar.style.width = '0%'; return; }

        let currentStepIndex = questionKeys.indexOf(currentQuestionId);
         // Progress is based on the index (0-based) of the *current* question
         // Add 1 because index 0 means step 1 is active.
         const completedSteps = (currentStepIndex >= 0) ? currentStepIndex + 1 : questionHistory.length + 1; // Estimate if not found

        const progress = Math.min((completedSteps / totalSteps) * 100, 100);
        progressBar.style.width = `${progress}%`;
         // log(`Progress: ${completedSteps}/${totalSteps} (${progress.toFixed(1)}%)`); // Can be noisy
    }

    function showFeedbackSection() {
        log("Showing feedback section.");
        stopTimer();
        if (surveyForm) surveyForm.style.display = 'none';
        if (welcomeScreen) welcomeScreen.style.display = 'none';
        if (completionScreen) completionScreen.style.display = 'none';
        if (feedbackSection) feedbackSection.style.display = 'block'; else error("Feedback section missing.");
        if (finalFeedbackInput) {
            finalFeedbackInput.value = userAnswers['FEEDBACK'] || '';
            updateCharCount();
        }
        // Hide nav
         if(backButton) backButton.classList.remove('visible');
         if(nextButton) nextButton.style.display = 'none';
    }

    function updateCharCount() {
        if (!finalFeedbackInput || !charCountDisplay) return;
        const len = finalFeedbackInput.value.length;
        charCountDisplay.textContent = `${len} / ${MAX_FEEDBACK_CHARS} chars`;
        const isOver = len > MAX_FEEDBACK_CHARS;
        charCountDisplay.classList.toggle('limit-exceeded', isOver);
        if (submitSurveyButton) submitSurveyButton.disabled = isOver;
    }

    function submitSurvey() {
        log("Submitting survey...");
        stopTimer();

        // Collect final feedback if section is visible
        if (feedbackSection?.style.display === 'block' && finalFeedbackInput) {
            const feedback = finalFeedbackInput.value.trim();
            if (feedback.length > MAX_FEEDBACK_CHARS) {
                alert(`Feedback too long (max ${MAX_FEEDBACK_CHARS} chars).`);
                error("Submit prevented: Feedback too long.");
                return;
            }
            userAnswers['FEEDBACK'] = feedback;
        } else if (userAnswers.hasOwnProperty('FEEDBACK') && userAnswers['FEEDBACK'] !== 'skipped') {
            // Clear feedback if section wasn't shown or skipped after entry
             delete userAnswers['FEEDBACK'];
        }

        // --- Prepare & Log Data ---
        const endTime = new Date();
        const duration = surveyStartTime ? Math.round((endTime - surveyStartTime) / 1000) : 0;
        userAnswers['meta'] = { surveyId: SURVEY_ID, start: surveyStartTime?.toISOString(), end: endTime.toISOString(), durationS: duration, ua: navigator.userAgent };
        log("---- OFFICE DEPOT SURVEY RESULTS ----");
        try { log(JSON.stringify(userAnswers, null, 2)); } catch (e) { error("Stringify failed:", e); log("Raw Data:", userAnswers); }
        log("---- END RESULTS ----");

        // --- Simulate Backend & Reward ---
        log("Simulating backend processing...");
        const email = "officedepot_user_" + Math.random().toString(16).slice(2, 8) + "@realsurveys-example.com";
        const reward = 0.50; // Example reward
        setTimeout(() => {
            log(`Reward $${reward.toFixed(2)} processed for ${email}.`);
            if (completionMessage) completionMessage.textContent = `Reward $${reward.toFixed(2)} processed for ${email}.`;
        }, 1100); // Simulate delay

        // --- UI Transition ---
        if (surveyForm) surveyForm.style.display = 'none';
        if (feedbackSection) feedbackSection.style.display = 'none';
        if (completionScreen) completionScreen.style.display = 'block'; else error("Completion screen missing.");

        // --- Confetti ---
        if (typeof confetti === 'function') {
            try { confetti({ particleCount: 120, spread: 80, origin: { y: 0.6 }, colors: [var(--officedepot-red), '#FFFFFF', '#555555'] }); }
            catch (e) { warn("Confetti failed (maybe CSS vars?):", e); confetti({ particleCount: 100, spread: 70, origin: { y: 0.6 }, colors: ['#CC0000', '#FFFFFF', '#555555'] }); }
        } else { log("Confetti unavailable."); }

        // --- Mark as Taken ---
        try { localStorage.setItem(SURVEY_TAKEN_KEY, 'true'); hasTakenSurvey = true; log("Survey marked as taken."); }
        catch (e) { error("Failed to set localStorage flag:", e); }

        // --- Redirect ---
        const redirectDelay = 6000;
        log(`Redirecting in ${redirectDelay / 1000}s...`);
        setTimeout(() => { window.location.href = 'surveys.html'; }, redirectDelay);
    }

    // --- Initialization ---
    function initializeSurvey() {
        log("Initializing survey...");

        // --- Select ALL elements upfront and check ---
        welcomeScreen = document.getElementById('welcome-screen');
        startButton = document.getElementById('startButton');
        surveyForm = document.getElementById('officedepotSurveyForm');
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
        initErrorMessage = document.getElementById('initErrorMessage'); // Get error message P tag

        const essentialElements = { welcomeScreen, startButton, surveyForm, questionContainer, backButton, nextButton, feedbackSection, completionScreen, initErrorMessage };
        let missingElement = false;
        for (const key in essentialElements) {
            if (!essentialElements[key]) {
                error(`Initialization failed: Element with ID '${key}' not found.`);
                missingElement = true;
                // Display error to user on the page if possible
                if(initErrorMessage) {
                    initErrorMessage.textContent = `Error: A required survey element ('${key}') is missing. Please contact support.`;
                    initErrorMessage.style.display = 'block';
                }
                 // Disable start button if essential parts are missing
                 if(startButton) startButton.disabled = true;
            }
        }
        if (missingElement) return; // Stop initialization if essential elements are missing

        log("All essential DOM elements found.");

        // --- Check if survey already taken ---
        try {
            hasTakenSurvey = localStorage.getItem(SURVEY_TAKEN_KEY) === 'true';
            log(`Survey taken status from localStorage: ${hasTakenSurvey}`);
        } catch (e) {
            error("Failed to read localStorage:", e);
            // Assume not taken or handle error state? For now, proceed as if not taken.
            hasTakenSurvey = false;
            initErrorMessage.textContent = "Warning: Could not check previous survey status.";
            initErrorMessage.style.display = 'block';
        }

        // --- Configure Start Button ---
        // Remove existing listener to prevent duplicates if this somehow runs twice
         // This is tricky with anonymous functions. A named function reference is better.
         // Let's rely on DOMContentLoaded firing once for now.

        if (hasTakenSurvey) {
            log("Configuring button for 'already taken' state.");
            startButton.disabled = true;
            startButton.textContent = "Survey Completed";
            startButton.style.cursor = "not-allowed";
            startButton.style.backgroundColor = "#adb5bd";
        } else {
            log("Configuring button for 'ready' state.");
            startButton.disabled = false;
            startButton.textContent = "Start Survey";
            startButton.style.cursor = "pointer";
            startButton.style.backgroundColor = ""; // Use CSS default
             // **CRITICAL:** Attach the event listener ONLY if not taken
             startButton.addEventListener('click', startSurveyHandler); // Use a named handler
        }

        // --- Attach other listeners ---
         // Use .? optional chaining for elements that might be optional depending on flow
        nextButton?.addEventListener('click', () => handleNextQuestion(false));
        backButton?.addEventListener('click', handlePreviousQuestion);
        finalFeedbackInput?.addEventListener('input', updateCharCount);
        skipFeedbackButton?.addEventListener('click', () => { log("Skip feedback clicked."); userAnswers['FEEDBACK'] = 'skipped'; submitSurvey(); });
        submitSurveyButton?.addEventListener('click', submitSurvey);
        surveyForm?.addEventListener('submit', (e) => { e.preventDefault(); log("Default form submit prevented."); });

        // --- Set Initial UI State ---
        surveyForm.style.display = 'none';
        feedbackSection.style.display = 'none';
        completionScreen.style.display = 'none';
        backButton.classList.remove('visible');
        nextButton.disabled = true; // Start disabled

        log("Survey initialization complete.");
    }

     // --- Named Handler for Start Button ---
     // This makes it easier to remove the listener if needed in more complex scenarios
     function startSurveyHandler(event) {
         log("Start button clicked!");
         // Optional: Prevent double clicks if needed
         if(event.target.disabled) return;
         event.target.disabled = true; // Temporarily disable to prevent rapid clicks

         startSurvey();

         // Re-enable after a short delay if startSurvey fails early? Or let startSurvey handle it?
         // For now, assume startSurvey proceeds or handles errors.
     }


    // --- Shake Helper ---
    if (typeof Element.prototype.shake === 'undefined') {
        Element.prototype.shake = function () { /* ... Shake implementation ... */ };
        // ... Keyframes insertion ...
    }

    // --- Run Initialization ---
    initializeSurvey();

}); // End DOMContentLoaded