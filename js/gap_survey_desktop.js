document.addEventListener('DOMContentLoaded', () => {
    // --- DOM Elements ---
    const welcomeScreen = document.getElementById('welcome-screen');
    const startButton = document.getElementById('startButton');
    const surveyForm = document.getElementById('gapSurveyForm');
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
    const SURVEY_ID = 'gapSurvey'; // Unique identifier for local storage
    let currentQuestionId = null;
    let userAnswers = {};
    let questionHistory = [];
    let timerInterval = null;
    let timeLeft = TIME_PER_QUESTION;
    let surveyStartTime = null;
    let hasTakenSurvey = localStorage.getItem(`${SURVEY_ID}_taken`) === 'true';

    // --- Survey Questions (Gap Focus) ---
    const surveyQuestions = {
        'START': { next: 'Q1_SHOPPING_METHOD' },
        'Q1_SHOPPING_METHOD': {
            text: "How did you shop with Gap most recently?",
            type: 'radio',
            required: true,
            options: [
                { value: 'in_store', label: 'In a Gap store' },
                { value: 'online', label: 'Online at Gap.com' },
                { value: 'both', label: 'Both in store and online' }
            ],
            next: 'Q2_PRODUCT_PURCHASED'
        },
        'Q2_PRODUCT_PURCHASED': {
            text: "What type of items did you primarily shop for? (Select all that apply)",
            type: 'checkbox',
            required: true,
            options: [
                { value: 'adult_women', label: 'Adult Women\'s Clothing' },
                { value: 'adult_men', label: 'Adult Men\'s Clothing' },
                { value: 'kids', label: 'Kids\' Clothing' },
                { value: 'baby', label: 'Baby Clothing' },
                { value: 'accessories', label: 'Accessories' },
                { value: 'other', label: 'Other' }
            ],
            next: 'Q3_PRODUCT_SELECTION'
        },
        'Q3_PRODUCT_SELECTION': {
            text: "How satisfied were you with the product selection available?",
            type: 'rating',
            required: true,
            options: [
                { value: 5, label: 'Very Satisfied' }, { value: 4, label: 'Satisfied' },
                { value: 3, label: 'Neutral' }, { value: 2, label: 'Dissatisfied' },
                { value: 1, label: 'Very Dissatisfied' }
            ],
            next: 'Q4_CLOTHING_FIT_QUALITY'
        },
        'Q4_CLOTHING_FIT_QUALITY': {
            text: "Overall, how satisfied were you with the fit and quality of the clothing?",
            type: 'rating',
            required: true,
            options: [
                { value: 5, label: 'Very Satisfied' }, { value: 4, label: 'Satisfied' },
                { value: 3, label: 'Neutral' }, { value: 2, label: 'Dissatisfied' },
                { value: 1, label: 'Very Dissatisfied' }
            ],
            next: 'Q5_VALUE_FOR_MONEY'
        },
        'Q5_VALUE_FOR_MONEY': {
            text: "How would you rate the value for money of the items you purchased or considered?",
            type: 'rating',
            required: true,
            options: [
                { value: 5, label: 'Excellent Value' }, { value: 4, label: 'Good Value' },
                { value: 3, label: 'Fair Value' }, { value: 2, label: 'Poor Value' },
                { value: 1, label: 'Very Poor Value' }
            ],
            next: 'Q6_STORE_ATMOSPHERE'
        },
        'Q6_STORE_ATMOSPHERE': {
            text: "If you shopped in-store, how would you rate the store atmosphere (cleanliness, organization)?",
            type: 'rating',
            required: (answers) => ['in_store', 'both'].includes(answers['Q1_SHOPPING_METHOD']), // Required if shopped in store
            options: [
                { value: 5, label: 'Excellent' }, { value: 4, label: 'Good' },
                { value: 3, label: 'Okay' }, { value: 2, label: 'Poor' },
                { value: 1, label: 'Terrible' }, { value: 0, label: 'N/A - Did not shop in store' }
            ],
            next: 'Q7_STAFF_HELPFULNESS'
        },
        'Q7_STAFF_HELPFULNESS': {
            text: "If you shopped in-store, how helpful were the staff members?",
            type: 'rating',
            required: (answers) => ['in_store', 'both'].includes(answers['Q1_SHOPPING_METHOD']), // Required if shopped in store
            options: [
                { value: 5, label: 'Very Helpful' }, { value: 4, label: 'Helpful' },
                { value: 3, label: 'Neutral / Didn\'t Interact' }, { value: 2, label: 'Unhelpful' },
                { value: 1, label: 'Very Unhelpful' }, { value: 0, label: 'N/A - Did not shop in store' }
            ],
            next: 'Q8_EASE_OF_WEBSITE'
        },
        'Q8_EASE_OF_WEBSITE': {
            text: "If you shopped online, how easy was it to find what you were looking for on the website/app?",
            type: 'rating',
            required: (answers) => ['online', 'both'].includes(answers['Q1_SHOPPING_METHOD']), // Required if shopped online
            options: [
                { value: 5, label: 'Very Easy' }, { value: 4, label: 'Easy' },
                { value: 3, label: 'Neutral' }, { value: 2, label: 'Difficult' },
                { value: 1, label: 'Very Difficult' }, { value: 0, label: 'N/A - Did not shop online' }
            ],
            next: 'Q9_CHECKOUT_PROCESS'
        },
         'Q9_CHECKOUT_PROCESS': {
            text: "How would you rate the checkout process (in-store or online)?",
            type: 'rating',
            required: true,
            options: [
                 { value: 5, label: 'Very Easy / Fast' }, { value: 4, label: 'Easy / Fast Enough' },
                 { value: 3, label: 'Neutral' }, { value: 2, label: 'Difficult / Slow' },
                 { value: 1, label: 'Very Difficult / Very Slow' }
            ],
            next: 'Q10_RECOMMENDATION'
        },
        'Q10_RECOMMENDATION': {
            text: "How likely are you to recommend Gap to friends or family?",
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

    // --- Helper Functions ---
    function log(message, ...args) { console.log(`[Gap Survey]: ${message}`, ...args); }
    function error(message, ...args) { console.error(`[Gap Survey] ERROR: ${message}`, ...args); }

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
                const input = document.createElement('input'); // Corrected: create input element
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
                const span = document.createElement('span'); // Corrected: create span element
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
            // error("No current question ID to validate."); // Can happen initially
            if(nextButton) nextButton.disabled = true; // Disable next initially
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

        // Check if the question itself exists
        if (!question) {
             error(`Question definition for ${currentQuestionId} not found.`);
             nextButton.disabled = true;
             return false;
        }

        let isRequired = question?.required;
        if (typeof isRequired === 'function') {
            try {
                isRequired = isRequired(userAnswers);
            } catch (e) {
                error(`Error evaluating required function for ${currentQuestionId}:`, e);
                isRequired = false; // Default to not required if function fails
            }
        }

        // If not required, it's valid
        if (!isRequired) {
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
                isValid = true; // Other types might be handled differently if added
            }
        } else {
             error("Question container not found during validation.");
             isValid = false;
        }

        nextButton.disabled = !isValid;
        log(`Question ${currentQuestionId} validation: ${isValid} (Required: ${isRequired})`);
        return isValid;
    }

    // --- Data Collection ---
    function collectAnswer(questionId) {
        log(`Collecting answer for question: ${questionId}`);
        if (!questionId || !questionContainer) {
            error("Question ID or question container not found for collecting answer.");
            return;
        }

        const question = surveyQuestions[questionId];
        if (!question || question.type === 'textarea' || question.type === 'completion') {
            log(`Skipping answer collection for non-standard question type or missing definition: ${questionId}`);
            return;
        }

        let answer;
        if (question.type === 'radio' || question.type === 'rating') {
            const checkedInput = questionContainer.querySelector(`input[name="q_${questionId}"]:checked`);
            answer = checkedInput ? checkedInput.value : undefined;
        } else if (question.type === 'checkbox') {
            const checkedBoxes = Array.from(questionContainer.querySelectorAll(`input[name="q_${questionId}"]:checked`));
            answer = checkedBoxes.length > 0 ? checkedBoxes.map(cb => cb.value) : undefined;
        }

        if (answer !== undefined) {
            userAnswers[questionId] = answer;
            log(`Answer collected: ${questionId} = ${JSON.stringify(answer)}`);
        } else {
            // Only delete if it exists, to avoid unnecessary logs if it was never answered (e.g., skipped conditional)
            if (userAnswers.hasOwnProperty(questionId)) {
                delete userAnswers[questionId];
                log(`Answer deleted/cleared: ${questionId}`);
            } else {
                 log(`No answer to collect for ${questionId}.`);
            }
        }
    }

    // --- Survey Flow Control ---
    function getNextQuestionId() {
        if (!currentQuestionId) {
            log("Starting survey, getting first question ID.");
            return surveyQuestions['START']?.next; // Use optional chaining
        }

        const question = surveyQuestions[currentQuestionId];
        if (!question) {
             error(`Current question definition not found: ${currentQuestionId}. Cannot determine next.`);
             return 'FEEDBACK'; // Default to feedback on error
        }
         if (!question.next) {
            log(`Question ${currentQuestionId} has no 'next', transitioning to feedback.`);
            return 'FEEDBACK';
        }

        if (typeof question.next === 'string') {
            log(`Next question ID is a string: ${question.next}`);
            return question.next;
        }

        if (typeof question.next === 'function') {
            try {
                const nextId = question.next(userAnswers);
                log(`Next question ID is determined by function: ${nextId}`);
                return nextId || 'FEEDBACK'; // Default to feedback if function returns falsy
            } catch(e) {
                error(`Error evaluating next function for ${currentQuestionId}:`, e);
                return 'FEEDBACK'; // Default to feedback on error
            }
        }

        // This logic was removed in previous iterations, adding back for completeness
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

        error(`Could not determine next question ID for ${currentQuestionId}, transitioning to feedback.`);
        return 'FEEDBACK';
    }

    function handleNextQuestion(isAutoAdvance = false) {
        log(`Handling next question. Auto advance: ${isAutoAdvance}`);
        if (!isAutoAdvance && !validateCurrentQuestion()) {
            console.warn(`Validation failed for ${currentQuestionId}.`);
            // Attempt to shake the question card if the helper exists
             try {
                 const card = questionContainer?.querySelector('.question-card');
                 if (card && typeof card.shake === 'function') {
                    card.shake();
                 } else if (card) {
                     log("Shake function not available on question card.");
                 }
             } catch(e) {
                 error("Error attempting to shake question card:", e);
             }
            return;
        }

        // Collect answer *before* getting next ID, as 'next' might depend on it
        if (currentQuestionId && currentQuestionId !== 'START') {
            collectAnswer(currentQuestionId);
        }

        stopTimer();
        const nextId = getNextQuestionId();

        if(currentQuestionId && currentQuestionId !== 'START') {
             questionHistory.push(currentQuestionId);
        }

        currentQuestionId = nextId;

        if (!currentQuestionId) {
            error("Next question ID is undefined or null. Stopping survey flow.");
             showFeedbackSection(); // Or handle appropriately
             return;
        }


        if (currentQuestionId === 'FEEDBACK') {
            showFeedbackSection();
        } else if (currentQuestionId === 'COMPLETE') {
            submitSurvey();
        } else if (surveyQuestions[currentQuestionId]) {
            renderQuestion(currentQuestionId);
        } else {
            error(`Invalid next ID or question definition missing: ${currentQuestionId}`);
            showFeedbackSection(); // Fallback to feedback section
        }
    }

    function handlePreviousQuestion() {
        log("Handling previous question.");
        if (questionHistory.length === 0) {
            log("No previous questions in history.");
            return;
        }

        stopTimer();
        // Don't collect answer on back, just pop history and render
        currentQuestionId = questionHistory.pop();
         if (surveyQuestions[currentQuestionId]) {
            // Rerender the question, existing answer should be repopulated by renderQuestion
            renderQuestion(currentQuestionId);
        } else {
            error(`Invalid previous ID found in history: ${currentQuestionId}`);
            // Attempt to go back further or restart
            if (questionHistory.length > 0) {
                handlePreviousQuestion();
            } else {
                startSurvey(); // Or handle error state differently
            }
        }
    }

    function updateNavigationButtons() {
        if (backButton) {
            backButton.classList.toggle('visible', questionHistory.length > 0);
        }
        // Ensure next button state is correct after navigation
        validateCurrentQuestion();
    }

    function updateProgressBar() {
        if (!progressBar) {
            // error("Progress bar element not found."); // This might be noisy
            return;
        }

        const qIds = Object.keys(surveyQuestions).filter(id => !['START', 'FEEDBACK', 'COMPLETE'].includes(id));
        const total = qIds.length;
        if (total === 0) {
            progressBar.style.width = '0%';
            return;
        }

        // Find the index of the *current* question in the filtered list
        let currentVisibleIndex = qIds.indexOf(currentQuestionId);

        // Progress should represent how many *required* steps are completed.
        // A simpler approach: base it on the number of questions pushed to history + 1 (for current)
        let completedSteps = questionHistory.length;
        if (currentQuestionId && currentQuestionId !== 'START') {
             // Only count the current step if it's actually a survey question step
             if (qIds.includes(currentQuestionId)) {
                  completedSteps = questionHistory.length + 1; // Consider current question as started
             }
        }


        // Calculate progress based on completed steps out of total question steps
        const progress = Math.min( (completedSteps / total) * 100, 100);

        progressBar.style.width = `${progress}%`;
        log(`Progress bar updated: ${completedSteps}/${total} (${progress.toFixed(1)}%)`);
    }

    // --- Section Display Functions ---
    function showFeedbackSection() {
        log("Showing feedback section.");
        stopTimer();
        if (surveyForm) surveyForm.style.display = 'none'; else error("Survey form not found to hide.");
        if (feedbackSection) feedbackSection.style.display = 'block'; else error("Feedback section not found to show.");
        if (welcomeScreen) welcomeScreen.style.display = 'none'; else error("Welcome screen not found to hide.");
        if (completionScreen) completionScreen.style.display = 'none'; // Hide completion too

        if (finalFeedbackInput) {
            finalFeedbackInput.value = userAnswers['FEEDBACK'] || '';
            updateCharCount();
        } else {
            error("Final feedback input element not found.");
        }
         // Update nav for feedback section (no back/next needed here typically)
         if(backButton) backButton.classList.remove('visible');
         if(nextButton) nextButton.style.display = 'none'; // Hide next button explicitly
    }

    function updateCharCount() {
        if (!finalFeedbackInput || !charCountDisplay) {
            // error("Final feedback input or char count display element not found."); // Can be noisy
            return;
        }

        const len = finalFeedbackInput.value.length;
        charCountDisplay.textContent = `${len} / ${MAX_FEEDBACK_CHARS} chars`;
        const isOver = len > MAX_FEEDBACK_CHARS;
        charCountDisplay.classList.toggle('limit-exceeded', isOver);
        if (submitSurveyButton) {
             submitSurveyButton.disabled = isOver;
        } else {
             error("Submit survey button not found for char count update.");
        }
    }

    // --- Survey Start and End ---
    function startSurvey() {
        log("Attempting to start Gap survey...");

        if (hasTakenSurvey) {
            alert("You have already completed this survey.");
            log("User blocked from retaking survey.");
            // Ensure button is visually disabled if missed by initializeSurvey somehow
             if (startButton) {
                 startButton.disabled = true;
                 startButton.textContent = "Survey Completed";
                 startButton.style.cursor = "not-allowed";
             }
            return; // Stop execution
        }

        log("Starting Gap survey...");
        surveyStartTime = new Date();
        userAnswers = {};
        questionHistory = [];
        currentQuestionId = 'START'; // Reset state

        if (!welcomeScreen || !surveyForm) {
             error("Cannot start survey: Welcome screen or survey form element missing.");
             return;
        }

        welcomeScreen.style.display = 'none';
        surveyForm.style.display = 'block';
        if (feedbackSection) feedbackSection.style.display = 'none';
        if (completionScreen) completionScreen.style.display = 'none';

        // Explicitly ensure nav buttons are reset/hidden initially if needed
        if(backButton) backButton.classList.remove('visible');
        if(nextButton) {
            nextButton.style.display = ''; // Ensure Next is potentially visible
            nextButton.disabled = true; // Start disabled until first question validates
        }


        handleNextQuestion(); // Move to the first actual question
    }

    function submitSurvey() {
        log("Attempting to submit Gap survey...");
        stopTimer();

        // Collect final feedback if the section is visible
        if (feedbackSection?.style.display === 'block') {
             if (finalFeedbackInput) {
                 userAnswers['FEEDBACK'] = finalFeedbackInput.value.trim();
                  if (userAnswers['FEEDBACK'].length > MAX_FEEDBACK_CHARS) {
                     alert(`Your feedback exceeds the maximum length of ${MAX_FEEDBACK_CHARS} characters. Please shorten it.`);
                     error("Submission prevented: Feedback too long.");
                     return; // Prevent submission
                 }
                 log("Final feedback collected.");
            } else {
                 error("Feedback input not found even though section is visible.");
            }
        } else {
             log("Feedback section not visible, skipping feedback collection.");
             // Ensure feedback isn't carried over if skipped
             if(userAnswers.hasOwnProperty('FEEDBACK') && userAnswers['FEEDBACK'] !== 'skipped') {
                  delete userAnswers['FEEDBACK'];
             }
        }


        const endTime = new Date();
        const duration = surveyStartTime ? Math.round((endTime - surveyStartTime) / 1000) : 0;
        userAnswers['meta'] = {
            start: surveyStartTime?.toISOString(),
            end: endTime.toISOString(),
            durationS: duration,
            ua: navigator.userAgent,
            surveyId: SURVEY_ID
        };

        log("---- GAP SURVEY RESULTS ----");
        log(JSON.stringify(userAnswers, null, 2));
        log("---- SIMULATING BACKEND PROCESSING ----");

        // --- Simulated Reward ---
        // In a real app, this would involve an API call
        const email = "gap_shopper_" + Math.random().toString(36).substring(2, 9) + "@realsurveys-example.com"; // Placeholder
        log(`Simulating reward for user: ${email}`);
        const reward = 0.65; // Example reward amount
        log(`Updating balance: +$${reward.toFixed(2)}...`);

        // Simulate network delay for backend processing
        setTimeout(() => {
            log(`Balance update successful.`);
            if (completionMessage) {
                 completionMessage.textContent = `Reward of $${reward.toFixed(2)} processed for ${email}. Thank you!`;
            } else {
                 error("Completion message element not found to display reward info.");
            }
        }, 1200); // Simulate 1.2 second delay

        // --- Show Completion Screen ---
        if (surveyForm) surveyForm.style.display = 'none';
        if (feedbackSection) feedbackSection.style.display = 'none';
        if (completionScreen) completionScreen.style.display = 'block'; else error("Completion screen element not found.");

        // --- Confetti ---
        if (typeof confetti === 'function') {
            try {
                confetti({
                    particleCount: 150,
                    spread: 90,
                    origin: { y: 0.6 },
                    colors: [var(--gap-blue), var(--gap-white), '#6699CC'] // Use CSS vars if possible, fallback colors
                });
                log("Confetti launched!");
            } catch (e) {
                 error("Failed to launch confetti:", e);
                 // Fallback colors if CSS vars fail in JS context like this
                  confetti({ particleCount: 100, spread: 70, origin: { y: 0.6 }, colors: ['#003087', '#FFFFFF', '#6699CC'] });
            }
        } else {
             log("Confetti function not available.");
        }

        // --- Set Survey Taken Flag ---
        try {
            localStorage.setItem(`${SURVEY_ID}_taken`, 'true');
            hasTakenSurvey = true; // Update state variable
            log("Survey completion flag set in localStorage.");
        } catch (e) {
             error("Failed to set survey completion flag in localStorage:", e);
        }


        // --- Redirect ---
        const redirectDelay = 6000; // 6 seconds
        log(`Redirecting to surveys.html in ${redirectDelay / 1000} seconds...`);
        setTimeout(() => {
            log("Executing redirect now.");
            window.location.href = 'surveys.html';
        }, redirectDelay);
    }

    // --- Initial Setup and Event Listeners ---
    function initializeSurvey() {
        log("Initializing Gap Survey...");

         if (!startButton) {
             error("Start Button element not found! Cannot initialize.");
             // Maybe display an error message to the user on the page?
             if(welcomeScreen) welcomeScreen.innerHTML = '<h2>Error</h2><p>Could not initialize the survey. The start button is missing.</p>';
             return;
        }

        // Clear previous listener if re-initializing (though unlikely needed here)
        // startButton.removeEventListener('click', startSurvey); // Might cause issues if not carefully managed

        if (hasTakenSurvey) {
            log("Survey already taken, disabling start button.");
            startButton.disabled = true;
            startButton.textContent = "Survey Completed";
            startButton.style.backgroundColor = "#6c757d"; // Use a neutral disabled color
            startButton.style.cursor = "not-allowed";
        } else {
            log("Survey not taken, attaching event listener to start button.");
            startButton.disabled = false; // Ensure it's enabled
            startButton.textContent = "Start Survey"; // Reset text
             startButton.style.backgroundColor = ''; // Reset style
             startButton.style.cursor = 'pointer';
             startButton.addEventListener('click', startSurvey);
        }

        // Add listeners for other buttons, ensuring they exist first
        if (nextButton) nextButton.addEventListener('click', () => handleNextQuestion(false)); else error("Next Button missing");
        if (backButton) backButton.addEventListener('click', handlePreviousQuestion); else error("Back Button missing");
        if (finalFeedbackInput) finalFeedbackInput.addEventListener('input', updateCharCount); else error("Final Feedback Input missing");
        if (skipFeedbackButton) skipFeedbackButton.addEventListener('click', () => { log("Skip feedback clicked."); userAnswers['FEEDBACK'] = 'skipped'; submitSurvey(); }); else error("Skip Feedback Button missing");
        if (submitSurveyButton) submitSurveyButton.addEventListener('click', submitSurvey); else error("Submit Survey Button missing");

        // Prevent default form submission
        if (surveyForm) {
             surveyForm.addEventListener('submit', (e) => {
                 e.preventDefault();
                 log("Form submission prevented.");
                 // Optionally trigger next/submit logic if user presses Enter on last input?
            });
        } else {
             error("Survey Form element missing");
        }

        // Initial visual state
        if (surveyForm) surveyForm.style.display = 'none';
        if (feedbackSection) feedbackSection.style.display = 'none';
        if (completionScreen) completionScreen.style.display = 'none';
        if (backButton) backButton.classList.remove('visible'); // Start hidden

        log("Gap Survey Initialized successfully.");
    }

    // --- Shake Helper (Optional, ensure it's defined) ---
    if (typeof Element.prototype.shake === 'undefined') {
        Element.prototype.shake = function () {
            log("Shaking element:", this);
            this.style.animation = 'shake 0.3s ease-in-out';
            // Remove animation class after it finishes
            setTimeout(() => {
                this.style.animation = '';
                 log("Shake animation removed.");
            }, 300);
        };

        // Inject keyframes if not already present
        try {
            const sheet = document.styleSheets[0];
             // Basic check if rule already exists (very rudimentary)
             let ruleExists = false;
             for(let i=0; i < sheet.cssRules.length; i++) {
                 if(sheet.cssRules[i].type === CSSRule.KEYFRAMES_RULE && sheet.cssRules[i].name === 'shake') {
                     ruleExists = true;
                     break;
                 }
             }
             if (!ruleExists) {
                 sheet.insertRule(`@keyframes shake { 0%, 100% { transform: translateX(0); } 25% { transform: translateX(-5px); } 75% { transform: translateX(5px); } }`, sheet.cssRules.length);
                 log("Shake keyframes inserted.");
             } else {
                 log("Shake keyframes already exist.");
             }
        } catch (e) {
            console.warn("Shake animation insert failed:", e);
        }
    }

    // --- Run Initialization ---
    initializeSurvey();

}); // End DOMContentLoaded