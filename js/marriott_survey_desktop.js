document.addEventListener('DOMContentLoaded', () => {
    // --- DOM Elements ---
    const welcomeScreen = document.getElementById('welcome-screen');
    const startButton = document.getElementById('startButton');
    const surveyForm = document.getElementById('marriottSurveyForm');
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
    const SURVEY_ID = 'marriottSurvey'; // Unique identifier for local storage
    let currentQuestionId = null;
    let userAnswers = {};
    let questionHistory = [];
    let timerInterval = null;
    let timeLeft = TIME_PER_QUESTION;
    let surveyStartTime = null;
    let hasTakenSurvey = localStorage.getItem(`${SURVEY_ID}_taken`) === 'true';

    // --- Survey Questions (Marriott Focus) ---
    const surveyQuestions = {
        'START': { next: 'Q1_STAY_PURPOSE' },
        'Q1_STAY_PURPOSE': {
            text: "What was the primary purpose of your stay?",
            type: 'radio',
            required: true,
            options: [
                { value: 'leisure', label: 'Leisure / Vacation' },
                { value: 'business', label: 'Business / Work' },
                { value: 'event', label: 'Attending an Event / Conference' },
                { value: 'other', label: 'Other' }
            ],
            next: 'Q2_BOOKING_METHOD'
        },
        'Q2_BOOKING_METHOD': {
            text: "How did you book this reservation?",
            type: 'radio',
            required: true,
            options: [
                { value: 'marriott_website', label: 'Marriott Website (Marriott.com)' },
                { value: 'marriott_app', label: 'Marriott Bonvoy App' },
                { value: 'phone_direct', label: 'Phone (Directly with hotel or Marriott reservations)' },
                { value: 'third_party_online', label: 'Third-Party Website (Expedia, Booking.com, etc.)' },
                { value: 'travel_agent', label: 'Travel Agent' },
                { value: 'corporate_booking', label: 'Corporate Booking Tool' }
            ],
            next: 'Q3_CHECK_IN_EXPERIENCE'
        },
        'Q3_CHECK_IN_EXPERIENCE': {
            text: "How would you rate your check-in experience?",
            type: 'rating',
            required: true,
            options: [
                { value: 5, label: 'Excellent (Fast, friendly, efficient)' }, { value: 4, label: 'Good' },
                { value: 3, label: 'Average' }, { value: 2, label: 'Poor' },
                { value: 1, label: 'Very Poor (Slow, unfriendly, issues)' }
            ],
            next: 'Q4_ROOM_CLEANLINESS'
        },
        'Q4_ROOM_CLEANLINESS': {
            text: "How satisfied were you with the cleanliness of your guest room upon arrival?",
            type: 'rating',
            required: true,
            options: [
                { value: 5, label: 'Very Satisfied' }, { value: 4, label: 'Satisfied' },
                { value: 3, label: 'Neutral' }, { value: 2, label: 'Dissatisfied' },
                { value: 1, label: 'Very Dissatisfied' }
            ],
            next: 'Q5_ROOM_COMFORT'
        },
        'Q5_ROOM_COMFORT': {
            text: "How satisfied were you with the overall comfort of your guest room (bed, temperature, noise level)?",
            type: 'rating',
            required: true,
            options: [
                { value: 5, label: 'Very Satisfied' }, { value: 4, label: 'Satisfied' },
                { value: 3, label: 'Neutral' }, { value: 2, label: 'Dissatisfied' },
                { value: 1, label: 'Very Dissatisfied' }
            ],
            next: 'Q6_AMENITIES_USED'
        },
        'Q6_AMENITIES_USED': {
            text: "Which hotel amenities or services did you use during your stay? (Select all that apply)",
            type: 'checkbox',
            required: false, // Optional selection
            options: [
                { value: 'wifi', label: 'Wi-Fi / Internet Access' },
                { value: 'restaurant_bar', label: 'Restaurant / Bar' },
                { value: 'room_service', label: 'Room Service' },
                { value: 'pool', label: 'Swimming Pool' },
                { value: 'fitness_center', label: 'Fitness Center / Gym' },
                { value: 'business_center', label: 'Business Center' },
                { value: 'spa', label: 'Spa Services' },
                { value: 'concierge', label: 'Concierge' },
                { value: 'none', label: 'None of the above' }
            ],
            next: 'Q7_AMENITIES_SATISFACTION' // Ask satisfaction regardless of specific use for simplicity, or could branch
        },
        'Q7_AMENITIES_SATISFACTION': {
            text: "Overall, how satisfied were you with the hotel's amenities and facilities?",
            type: 'rating',
            required: true,
            options: [
                { value: 5, label: 'Very Satisfied' }, { value: 4, label: 'Satisfied' },
                { value: 3, label: 'Neutral' }, { value: 2, label: 'Dissatisfied' },
                { value: 1, label: 'Very Dissatisfied' }, { value: 0, label: 'N/A - Did not use any amenities' }
            ],
            next: 'Q8_STAFF_INTERACTION'
        },
        'Q8_STAFF_INTERACTION': {
            text: "How would you rate the overall service provided by the hotel staff (friendliness, helpfulness)?",
            type: 'rating',
            required: true,
            options: [
                { value: 5, label: 'Excellent' }, { value: 4, label: 'Good' },
                { value: 3, label: 'Average' }, { value: 2, label: 'Poor' },
                { value: 1, label: 'Very Poor' }
            ],
            next: 'Q9_BONVOY_MEMBER'
        },
        'Q9_BONVOY_MEMBER': {
            text: "Are you a Marriott Bonvoy member?",
            type: 'radio',
            required: true,
            options: [
                { value: 'yes', label: 'Yes' },
                { value: 'no', label: 'No' },
                { value: 'not_sure', label: 'Not Sure' }
            ],
            next: (ans) => ans['Q9_BONVOY_MEMBER'] === 'yes' ? 'Q10_BONVOY_RECOGNITION' : 'Q11_RECOMMENDATION'
        },
        'Q10_BONVOY_RECOGNITION': {
            text: "As a Marriott Bonvoy member, did you feel your status was appropriately recognized during your stay?",
            type: 'radio',
            required: true,
            options: [
                { value: 'yes', label: 'Yes, fully recognized' },
                { value: 'somewhat', label: 'Somewhat recognized' },
                { value: 'no', label: 'No, not recognized' },
                { value: 'na_no_status', label: 'N/A - Don\'t have elite status / Unsure' }
            ],
            next: 'Q11_RECOMMENDATION'
        },
        'Q11_RECOMMENDATION': {
            text: "Based on this stay, how likely are you to recommend this hotel to a friend or colleague?",
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
    function log(message, ...args) { console.log(`[Marriott Survey]: ${message}`, ...args); }
    function error(message, ...args) { console.error(`[Marriott Survey] ERROR: ${message}`, ...args); }

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
            // error("Timer display element not found."); // Can be noisy
            return;
        }
        timerDisplay.textContent = `00:${String(timeLeft).padStart(2, '0')}`;
    }

    function handleAutoAdvance() {
        log(`Auto-advancing from: ${currentQuestionId}`);
        // Ensure answer is collected even on auto-advance if possible/valid
        collectAnswer(currentQuestionId); // Collect whatever might be selected
        handleNextQuestion(true); // Pass true to bypass validation
    }

    // --- Rendering Functions ---
    function renderQuestion(questionId) {
        log(`Rendering question: ${questionId}`);
        const question = surveyQuestions[questionId];

        if (!question) {
            error(`Invalid question ID: ${questionId}. Cannot render.`);
            showFeedbackSection(); // Fallback
            return;
        }

        if (question.type === 'textarea' || question.type === 'completion') {
            error(`Attempted to render non-question type as question: ${question.type}`);
            // Decide appropriate action - show feedback? show completion? log error?
            showFeedbackSection(); // Fallback
            return;
        }

        if (!questionContainer) {
            error("Question container element not found. Cannot render.");
            return;
        }

        stopTimer(); // Stop timer for previous question
        questionContainer.innerHTML = ''; // Clear previous question

        const fieldset = document.createElement('fieldset');
        fieldset.id = `q_${questionId}`;
        fieldset.classList.add('question-card');
        fieldset.setAttribute('aria-labelledby', `legend_${questionId}`);

        const legend = document.createElement('legend');
        legend.id = `legend_${questionId}`;
        legend.innerHTML = question.text; // Use innerHTML for potential simple formatting if needed later
        fieldset.appendChild(legend);

        const optionsList = document.createElement('ul');
        optionsList.classList.add('options-list');

        // Set ARIA roles for accessibility
        if (question.type === 'radio' || question.type === 'rating') {
            optionsList.setAttribute('role', 'radiogroup');
        } else if (question.type === 'checkbox') {
            optionsList.setAttribute('role', 'group');
             // Add describedby for help text if applicable
            if (question.maxSelection || question.helpText) { // Added check for general helpText
                optionsList.setAttribute('aria-describedby', `info_${questionId}`);
            }
        }

        if (question.options && Array.isArray(question.options)) {
            question.options.forEach((option, index) => {
                const li = document.createElement('li');
                const id = `q_${questionId}_opt${index}`;
                const input = document.createElement('input');
                input.type = question.type === 'checkbox' ? 'checkbox' : 'radio';
                input.id = id;
                input.name = `q_${questionId}`; // Group radios/checkboxes
                input.value = option.value;

                // Pre-check based on existing userAnswers
                const ans = userAnswers[questionId];
                if (ans !== undefined) {
                    if (input.type === 'radio' && String(ans) === String(option.value)) {
                        input.checked = true;
                    } else if (input.type === 'checkbox' && Array.isArray(ans) && ans.map(String).includes(String(option.value))) {
                        // Ensure comparison works even if numbers/strings mix
                        input.checked = true;
                    }
                }

                const label = document.createElement('label');
                label.htmlFor = id;
                const span = document.createElement('span');
                span.textContent = option.label;
                label.appendChild(input); // Input first visually usually
                label.appendChild(span);

                // Attach event listener to handle changes and validation
                input.addEventListener('change', (e) => handleInputChange(questionId, question, e));
                li.appendChild(label);
                optionsList.appendChild(li);
            });

            fieldset.appendChild(optionsList);

            // Add help text if defined in the question object
            const helpTextContent = question.maxSelection ? `(Select up to ${question.maxSelection})` : question.helpText;
             if (helpTextContent) {
                const help = document.createElement('p');
                help.id = `info_${questionId}`; // For aria-describedby
                help.classList.add('checkbox-help-text'); // Use existing or new class
                help.textContent = helpTextContent;
                fieldset.appendChild(help);
            }

        } else {
            log(`No options found for question ${questionId}`);
        }

        questionContainer.appendChild(fieldset);

        // Update UI elements after rendering
        updateNavigationButtons();
        updateProgressBar();
        validateCurrentQuestion(); // Validate the newly rendered question
        startTimer(); // Start timer for the new question

        log(`Question ${questionId} rendered successfully.`);
    }


    // --- Input Handling and Validation ---
    function handleInputChange(questionId, questionDef, event = null) {
        log(`Input changed for question: ${questionId}`);
        // Handle max selection for checkboxes
        if (questionDef.type === 'checkbox' && questionDef.maxSelection && event?.target.checked) {
            const formElement = document.getElementById(`q_${questionId}`); // Get fieldset
             if (formElement) {
                 const checkedCount = formElement.querySelectorAll(`input[name="q_${questionId}"]:checked`).length;
                 if (checkedCount > questionDef.maxSelection) {
                    event.target.checked = false; // Prevent checking
                    alert(`You can select a maximum of ${questionDef.maxSelection} options.`);
                    log(`Checkbox limit exceeded for ${questionId}`);
                    return; // Stop further processing for this change
                 }
             } else {
                 error(`Fieldset not found for checkbox validation: q_${questionId}`);
             }
        }
        // Trigger validation for the current question after any input change
        validateCurrentQuestion();
    }


    function validateCurrentQuestion(isAutoAdvance = false) {
        if (!currentQuestionId || currentQuestionId === 'START') {
            // It's okay initially, disable Next
            if(nextButton) nextButton.disabled = true;
            return false;
        }

        if (!nextButton) {
            error("Next button element not found during validation.");
            return false; // Cannot proceed
        }

        const question = surveyQuestions[currentQuestionId];

        // If auto-advancing, skip validation logic and enable Next
        if (isAutoAdvance) {
            nextButton.disabled = false;
            return true;
        }

        // Check if question definition exists
        if (!question) {
             error(`Question definition missing for validation: ${currentQuestionId}`);
             nextButton.disabled = true; // Disable Next if definition is missing
             return false;
        }

        // Determine if the question is required
        let isRequired = question.required;
        if (typeof isRequired === 'function') {
            try {
                isRequired = isRequired(userAnswers);
            } catch (e) {
                error(`Error evaluating required function for ${currentQuestionId}:`, e);
                isRequired = false; // Default to not required if function errors
            }
        }

        // If the question is not required, it's always valid to proceed
        if (!isRequired) {
            nextButton.disabled = false;
            return true;
        }

        // --- Validation logic for required questions ---
        let isValid = false;
        const formElement = document.getElementById(`q_${currentQuestionId}`); // Get fieldset

        if (formElement) {
             if (question.type === 'radio' || question.type === 'rating') {
                 isValid = formElement.querySelector(`input[name="q_${currentQuestionId}"]:checked`) !== null;
            } else if (question.type === 'checkbox') {
                 isValid = formElement.querySelectorAll(`input[name="q_${currentQuestionId}"]:checked`).length > 0;
            } else {
                 // Assume other types are valid if required (e.g., a text input might be added later)
                 // More specific validation would be needed for other types.
                 isValid = true;
            }
        } else {
             error(`Fieldset element q_${currentQuestionId} not found for validation.`);
             isValid = false; // Cannot validate if fieldset is missing
        }


        // Enable/disable the Next button based on validation result
        nextButton.disabled = !isValid;
        log(`Question ${currentQuestionId} validation result: ${isValid} (Required: ${isRequired})`);
        return isValid;
    }


    // --- Data Collection ---
    function collectAnswer(questionId) {
        log(`Collecting answer for: ${questionId}`);
        if (!questionId || questionId === 'START') {
            log("Skipping answer collection for START or invalid ID.");
            return;
        }

        const question = surveyQuestions[questionId];
        const formElement = document.getElementById(`q_${questionId}`); // Get fieldset

        if (!question || !formElement) {
            // Don't collect if definition or element is missing, but check if we NEEDED to collect
            if (question?.required) { // Check if it was supposed to be required
                 error(`Cannot collect answer: Definition or fieldset missing for required question ${questionId}.`);
            } else {
                 log(`Skipping answer collection: Definition or fieldset missing for non-required question ${questionId}.`);
            }
            // Clear any potentially stale answer if definition is gone
            if (userAnswers.hasOwnProperty(questionId)) {
                 delete userAnswers[questionId];
                 log(`Removed stale answer for missing question ${questionId}.`);
            }
            return;
        }

        // Skip collection for non-input types
        if (question.type === 'textarea' || question.type === 'completion') {
            log(`Skipping answer collection for non-standard type: ${question.type}`);
            return;
        }

        let answer;
        try {
            if (question.type === 'radio' || question.type === 'rating') {
                const checkedInput = formElement.querySelector(`input[name="q_${questionId}"]:checked`);
                answer = checkedInput ? checkedInput.value : undefined;
            } else if (question.type === 'checkbox') {
                const checkedBoxes = Array.from(formElement.querySelectorAll(`input[name="q_${questionId}"]:checked`));
                // Store as array only if something is checked, otherwise undefined
                answer = checkedBoxes.length > 0 ? checkedBoxes.map(cb => cb.value) : undefined;
            }
             // Add handling for other input types here if needed
            else {
                log(`Answer collection not implemented for type: ${question.type}`);
                 answer = undefined;
            }

            // Store or remove the answer
            if (answer !== undefined) {
                userAnswers[questionId] = answer;
                log(`Answer collected for ${questionId}: ${JSON.stringify(answer)}`);
            } else {
                 // Remove answer only if it previously existed
                 if (userAnswers.hasOwnProperty(questionId)) {
                    delete userAnswers[questionId];
                    log(`Answer cleared/removed for ${questionId}.`);
                 } else {
                     log(`No answer provided for ${questionId}.`);
                 }
            }
        } catch (e) {
            error(`Error collecting answer for ${questionId}:`, e);
             // Clear potentially corrupt answer data
             if (userAnswers.hasOwnProperty(questionId)) {
                 delete userAnswers[questionId];
            }
        }
    }


    // --- Survey Flow Control ---
    function getNextQuestionId() {
        if (!currentQuestionId) { // Initial call from startSurvey
            log("Getting initial question ID from START.");
            return surveyQuestions['START']?.next || 'FEEDBACK'; // Default to feedback if START is malformed
        }

        const question = surveyQuestions[currentQuestionId];

        if (!question) {
            error(`Cannot get next ID: Current question definition missing for ${currentQuestionId}.`);
            return 'FEEDBACK'; // Fallback
        }

        const nextLogic = question.next;

        if (!nextLogic) {
            log(`Question ${currentQuestionId} has no 'next' defined. Moving to FEEDBACK.`);
            return 'FEEDBACK';
        }

        if (typeof nextLogic === 'string') {
            log(`Next question ID from string: ${nextLogic}`);
            return nextLogic;
        }

        if (typeof nextLogic === 'function') {
            try {
                const nextId = nextLogic(userAnswers);
                log(`Next question ID from function: ${nextId}`);
                // Ensure function returns a valid string ID or fallback
                return nextId && typeof nextId === 'string' ? nextId : 'FEEDBACK';
            } catch (e) {
                error(`Error executing 'next' function for ${currentQuestionId}:`, e);
                return 'FEEDBACK'; // Fallback on error
            }
        }

         // Handling object-based branching (less common in these examples but good practice)
         if (typeof nextLogic === 'object' && nextLogic !== null) {
             const currentAnswer = userAnswers[currentQuestionId];
             // Check if the answer maps to a specific next question
             if (currentAnswer !== undefined && nextLogic.hasOwnProperty(String(currentAnswer))) {
                 const nextId = nextLogic[String(currentAnswer)];
                 log(`Next question ID from object map (answer ${currentAnswer}): ${nextId}`);
                 return nextId;
             }
             // Check if there's a default fallback within the object
             if (nextLogic.hasOwnProperty('default')) {
                 const defaultNextId = nextLogic['default'];
                 log(`Next question ID from object map (default): ${defaultNextId}`);
                 return defaultNextId;
             }
         }


        error(`Could not determine next question ID logic for ${currentQuestionId}. Moving to FEEDBACK.`);
        return 'FEEDBACK'; // Final fallback
    }

    function handleNextQuestion(isAutoAdvance = false) {
        log(`Handling next question. Current: ${currentQuestionId}, AutoAdvance: ${isAutoAdvance}`);

        // --- Pre-computation ---
        // Collect answer *before* determining the next question ID,
        // as the next question might depend on the answer to the current one.
        if (currentQuestionId && currentQuestionId !== 'START') {
            collectAnswer(currentQuestionId);
        }

         // --- Validation ---
        // Perform validation *unless* auto-advancing
        if (!isAutoAdvance) {
            if (!validateCurrentQuestion()) { // Pass false or nothing
                console.warn(`Validation failed for ${currentQuestionId}. Aborting next.`);
                // Attempt to shake the question card for visual feedback
                try {
                    const card = questionContainer?.querySelector('.question-card');
                    if (card && typeof card.shake === 'function') {
                        card.shake();
                    }
                } catch(e) { error("Error attempting shake:", e); }
                return; // Stop if validation fails
            }
        }


        // --- State Update ---
        stopTimer(); // Stop timer for the current question
        const nextId = getNextQuestionId(); // Determine the ID of the next step

        // Push the *just completed* question ID to history (if it was a real question)
        if (currentQuestionId && currentQuestionId !== 'START') {
            questionHistory.push(currentQuestionId);
            log(`Pushed ${currentQuestionId} to history. History: [${questionHistory.join(', ')}]`);
        }

        // Update the current question ID
        currentQuestionId = nextId;
        log(`New current question ID: ${currentQuestionId}`);


        // --- Rendering / Action ---
        if (!currentQuestionId) {
             error("Transition failed: Next question ID is null or undefined.");
             // Decide on a recovery action, e.g., show feedback or an error message
             showFeedbackSection();
             return;
         }


        switch (currentQuestionId) {
            case 'FEEDBACK':
                showFeedbackSection();
                break;
            case 'COMPLETE':
                submitSurvey();
                break;
            default:
                // Check if it's a valid question ID in our definitions
                if (surveyQuestions[currentQuestionId]) {
                    renderQuestion(currentQuestionId);
                } else {
                    error(`Transition failed: Invalid question ID '${currentQuestionId}'.`);
                    // Recovery action: show feedback?
                    showFeedbackSection();
                }
                break;
        }
    }


    function handlePreviousQuestion() {
        log("Handling previous question.");
        if (questionHistory.length === 0) {
            log("No history to go back to.");
            return; // Cannot go back further
        }

        stopTimer(); // Stop timer for the current question

        // Pop the *last completed* question ID from history to become the new current ID
        currentQuestionId = questionHistory.pop();
        log(`Popped ${currentQuestionId} from history. History: [${questionHistory.join(', ')}]`);
        log(`New current question ID: ${currentQuestionId}`);

        if (!currentQuestionId) {
             error("Error going back: Popped ID is null or undefined.");
              // Maybe try popping again or reset? For now, log and potentially stop.
             // Resetting might be safer:
             // startSurvey();
             return;
         }

        // Check if the popped ID is valid before rendering
        if (surveyQuestions[currentQuestionId]) {
            // Re-render the previous question. Answers should be repopulated from userAnswers.
             log(`Rendering previous question: ${currentQuestionId}`);
             renderQuestion(currentQuestionId);
             // Note: We don't need to collectAnswer here, just render.
             // validateCurrentQuestion() will run inside renderQuestion.
        } else {
            error(`Error going back: Question definition missing for popped ID '${currentQuestionId}'.`);
            // Attempt to go back further if history allows
            if (questionHistory.length > 0) {
                 log("Attempting to go back further due to invalid previous ID.");
                 handlePreviousQuestion();
             } else {
                 log("Cannot go back further, history empty or invalid. Resetting.");
                 // Reset to the beginning might be the safest fallback
                 startSurvey(); // Or navigate to a safe state
             }
        }
        // updateNavigationButtons() and updateProgressBar() are called within renderQuestion
    }


    function updateNavigationButtons() {
        // Back button visibility depends on history
        if (backButton) {
            backButton.classList.toggle('visible', questionHistory.length > 0);
        }

        // Next button state is handled by validateCurrentQuestion,
        // but ensure it's generally visible unless in feedback/completion
         if (nextButton) {
             const isInQuestionStep = currentQuestionId && currentQuestionId !== 'START' && currentQuestionId !== 'FEEDBACK' && currentQuestionId !== 'COMPLETE';
             nextButton.style.display = isInQuestionStep ? '' : 'none'; // Show only in question steps
             // Re-validate to set disabled state correctly after back/forward
              if (isInQuestionStep) {
                  validateCurrentQuestion();
              } else {
                  nextButton.disabled = true; // Ensure disabled if not in a question step
              }
         }
    }

    function updateProgressBar() {
        if (!progressBar) return; // Exit if no progress bar element

        const questionKeys = Object.keys(surveyQuestions).filter(id =>
            !['START', 'FEEDBACK', 'COMPLETE'].includes(id) && surveyQuestions[id].type !== 'textarea'
        );
        const totalQuestionSteps = questionKeys.length;

        if (totalQuestionSteps === 0) {
            progressBar.style.width = '0%';
            return;
        }

        // Progress based on how many *actual question steps* are in the history.
        // The current step counts only if it's one of the defined question steps.
        let completedSteps = questionHistory.filter(id => questionKeys.includes(id)).length;

         // Add 1 if the current step is a valid question step (not START/FEEDBACK/COMPLETE)
         if (currentQuestionId && questionKeys.includes(currentQuestionId)) {
             // Check if this question *isn't* already the last one in history (prevents double counting on 'back')
             if (questionHistory.length === 0 || questionHistory[questionHistory.length - 1] !== currentQuestionId) {
                  // This logic is tricky. A simpler way is often better:
                  // Consider progress as the index of the current question within the flow.
                  let currentIndexInFlow = questionKeys.indexOf(currentQuestionId);
                  // If found, progress is based on completing the *previous* steps.
                  // So, index + 1 steps are "active" or completed.
                   if (currentIndexInFlow !== -1) {
                       // Use index directly as number of completed steps BEFORE this one.
                       // Add 1 to include the current one as partially complete/active.
                       completedSteps = currentIndexInFlow; // 0-based index means this many are *before* it
                       // Let's adjust to show progress *through* the current question:
                       completedSteps = currentIndexInFlow + 1;
                   } else {
                       // If current ID isn't in the main flow (e.g., conditional branch not counted in keys),
                       // rely solely on history count? Or try to estimate?
                       // Fallback to history count for simplicity if current isn't in the main list.
                       completedSteps = questionHistory.filter(id => questionKeys.includes(id)).length;
                   }
             }
         }


        const progressPercentage = Math.min((completedSteps / totalQuestionSteps) * 100, 100);
        progressBar.style.width = `${progressPercentage}%`;
        log(`Progress bar updated: ${completedSteps}/${totalQuestionSteps} (${progressPercentage.toFixed(1)}%)`);
    }

    // --- Section Display Functions ---
    function showFeedbackSection() {
        log("Showing feedback section.");
        stopTimer();

        // Hide other sections
        if (surveyForm) surveyForm.style.display = 'none'; else error("Survey form not found to hide.");
        if (welcomeScreen) welcomeScreen.style.display = 'none'; else error("Welcome screen not found to hide.");
        if (completionScreen) completionScreen.style.display = 'none'; else error("Completion screen not found to hide.");

        // Show feedback section
        if (feedbackSection) feedbackSection.style.display = 'block'; else error("Feedback section not found to show.");

        // Populate textarea and update char count
        if (finalFeedbackInput) {
            finalFeedbackInput.value = userAnswers['FEEDBACK'] || ''; // Use stored value or empty
            updateCharCount(); // Initialize char count
        } else {
            error("Final feedback input element not found.");
        }

         // Hide survey navigation buttons (Back/Next)
         if(backButton) backButton.classList.remove('visible');
         if(nextButton) nextButton.style.display = 'none';
    }

    function updateCharCount() {
        if (!finalFeedbackInput || !charCountDisplay) {
            // Log less noisily, maybe only once or if element truly missing
            // console.warn("Feedback input or char count display not found.");
            return;
        }

        const currentLength = finalFeedbackInput.value.length;
        charCountDisplay.textContent = `${currentLength} / ${MAX_FEEDBACK_CHARS} chars`;

        const isOverLimit = currentLength > MAX_FEEDBACK_CHARS;
        charCountDisplay.classList.toggle('limit-exceeded', isOverLimit);

        // Disable submit button if over limit
        if (submitSurveyButton) {
            submitSurveyButton.disabled = isOverLimit;
        } else {
             // Only log error if submit button is expected but missing
             // error("Submit survey button not found for char count update.");
        }
    }


    // --- Survey Start and End ---
    function startSurvey() {
        log("Attempting to start Marriott survey...");

        if (hasTakenSurvey) {
            alert("You have already completed this survey.");
            log("User blocked from retaking survey.");
             // Ensure button is visually disabled
             if (startButton) {
                 startButton.disabled = true;
                 startButton.textContent = "Survey Completed";
                 startButton.style.cursor = "not-allowed";
                 startButton.style.backgroundColor = "#adb5bd"; // Generic disabled color
             }
            return; // Stop execution
        }

        // Proceed with starting
        log("Starting Marriott survey...");
        surveyStartTime = new Date();
        userAnswers = {}; // Clear previous answers
        questionHistory = []; // Clear history
        currentQuestionId = 'START'; // Set initial state marker

        // Ensure essential elements exist before hiding/showing
        if (!welcomeScreen || !surveyForm) {
             error("Cannot start survey: Welcome screen or survey form element missing.");
             // Provide user feedback if possible
             if(welcomeScreen) welcomeScreen.innerHTML = "<h2>Error</h2><p>Sorry, the survey cannot be started due to a configuration issue.</p>";
             return;
        }

        // Transition UI: Hide welcome, show form
        welcomeScreen.style.display = 'none';
        surveyForm.style.display = 'block';
        // Ensure other sections are hidden
        if (feedbackSection) feedbackSection.style.display = 'none';
        if (completionScreen) completionScreen.style.display = 'none';

        // Reset navigation buttons for the start of the survey
        if(backButton) backButton.classList.remove('visible'); // Hide back button initially
        if(nextButton) {
            nextButton.style.display = ''; // Make sure Next button container is visible
            nextButton.disabled = true; // Start disabled, enable on first valid input
        }

        // Trigger the first question display
        handleNextQuestion(); // This will move from 'START' to the first actual question
    }


    function submitSurvey() {
        log("Attempting to submit Marriott survey...");
        stopTimer(); // Stop any active question timer

        // Collect final feedback only if feedback section is currently displayed
        if (feedbackSection?.style.display === 'block') {
             if (finalFeedbackInput) {
                 const feedbackText = finalFeedbackInput.value.trim();
                 if (feedbackText.length > MAX_FEEDBACK_CHARS) {
                     alert(`Your feedback exceeds the maximum ${MAX_FEEDBACK_CHARS} characters. Please shorten it.`);
                     error("Submission prevented: Feedback too long.");
                     // Optionally refocus the textarea: finalFeedbackInput.focus();
                     return; // Stop submission
                 }
                 userAnswers['FEEDBACK'] = feedbackText;
                 log("Final feedback collected.");
             } else {
                 error("Feedback input element not found despite section being visible.");
             }
        } else {
             log("Feedback section not visible, skipping final feedback collection.");
             // Ensure feedback isn't carried over if skipped after being entered previously
             if(userAnswers.hasOwnProperty('FEEDBACK') && userAnswers['FEEDBACK'] !== 'skipped') {
                  delete userAnswers['FEEDBACK'];
             }
        }

        // --- Prepare Submission Data ---
        const endTime = new Date();
        const duration = surveyStartTime ? Math.round((endTime - surveyStartTime) / 1000) : 0; // Calculate duration in seconds
        userAnswers['meta'] = {
            surveyId: SURVEY_ID,
            start: surveyStartTime?.toISOString(), // Use optional chaining for safety
            end: endTime.toISOString(),
            durationS: duration,
            ua: navigator.userAgent // Capture user agent
        };

        // --- Log Final Data (for debugging) ---
        log("---- MARRIOTT SURVEY RESULTS ----");
        try {
            log(JSON.stringify(userAnswers, null, 2)); // Pretty print JSON
        } catch (e) {
            error("Error stringifying survey results:", e);
            log("Raw userAnswers:", userAnswers); // Log raw object if stringify fails
        }
        log("---- END OF RESULTS ----");

        // --- Simulate Backend Interaction ---
        log("Simulating backend submission and reward processing...");
        const email = "marriott_guest_" + Math.random().toString(36).substring(2, 9) + "@realsurveys-example.com"; // Placeholder email
        const reward = 0.85; // Example reward
        log(`Simulating reward: +$${reward.toFixed(2)} for ${email}`);

        // Simulate network delay
        const processingDelay = 1300; // milliseconds
        setTimeout(() => {
            log("Simulated backend processing complete.");
            // Update completion message with reward info
            if (completionMessage) {
                completionMessage.textContent = `Reward of $${reward.toFixed(2)} processed for ${email}. Thank you!`;
            } else {
                error("Completion message element not found to display reward.");
            }
        }, processingDelay);


        // --- Update UI to Completion State ---
        if (surveyForm) surveyForm.style.display = 'none';
        if (feedbackSection) feedbackSection.style.display = 'none';
        if (completionScreen) {
             completionScreen.style.display = 'block';
             log("Completion screen displayed.");
        } else {
             error("Completion screen element not found!");
             // Fallback? Maybe alert the user.
             alert("Thank you for your feedback!");
        }


        // --- Trigger Confetti ---
        if (typeof confetti === 'function') {
            try {
                confetti({
                    particleCount: 150,
                    spread: 90,
                    origin: { y: 0.6 },
                    colors: ['#003C71', '#B8860B', '#FFFFFF'] // Marriott Blue, Gold, White
                });
                log("Confetti launched!");
            } catch (e) {
                 error("Failed to launch confetti:", e);
            }
        } else {
             log("Confetti function not available.");
        }

        // --- Mark Survey as Taken (using localStorage) ---
        try {
            localStorage.setItem(`${SURVEY_ID}_taken`, 'true');
            hasTakenSurvey = true; // Update runtime state variable
            log(`Survey completion flag set in localStorage for ${SURVEY_ID}.`);
        } catch (e) {
             error("Failed to set survey completion flag in localStorage:", e);
             // This is not critical for flow, but indicates a potential issue.
        }


        // --- Schedule Redirect ---
        const redirectDelay = 6000; // 6 seconds
        log(`Scheduling redirect to surveys.html in ${redirectDelay / 1000} seconds...`);
        setTimeout(() => {
            log("Executing redirect now.");
            window.location.href = 'surveys.html';
        }, redirectDelay);
    }

    // --- Initial Setup and Event Listeners ---
    function initializeSurvey() {
        log("Initializing Marriott Survey...");

         // Check for essential elements first
         if (!startButton || !welcomeScreen || !surveyForm || !nextButton || !backButton || !skipFeedbackButton || !submitSurveyButton) {
             error("One or more essential survey elements are missing. Cannot initialize properly.");
              // Display a user-friendly error message if possible
              if(welcomeScreen) welcomeScreen.innerHTML = '<h2>Initialization Error</h2><p>Sorry, there was a problem setting up the survey. Please try refreshing the page.</p>';
             return; // Halt initialization
         }

        // --- Handle Start Button State ---
        // Clear any previous listener to prevent duplicates if re-initialized
         // Note: This requires storing the listener function if using anonymous functions isn't desired.
         // For simplicity here, we rely on DOMContentLoaded firing once.

        if (hasTakenSurvey) {
            log("Survey already taken, disabling start button.");
            startButton.disabled = true;
            startButton.textContent = "Survey Completed";
            startButton.style.cursor = "not-allowed";
            startButton.style.backgroundColor = "#adb5bd"; // Neutral disabled color
        } else {
            log("Survey not taken, enabling and attaching listener to start button.");
            startButton.disabled = false;
            startButton.textContent = "Start Survey"; // Ensure correct text
             startButton.style.cursor = 'pointer';
             startButton.style.backgroundColor = ''; // Reset style to CSS default
             startButton.addEventListener('click', startSurvey);
        }

        // --- Attach Other Listeners ---
        nextButton.addEventListener('click', () => handleNextQuestion(false)); // Pass false for normal validation
        backButton.addEventListener('click', handlePreviousQuestion);
         if (finalFeedbackInput) { // Check existence before adding listener
            finalFeedbackInput.addEventListener('input', updateCharCount);
         } else {
             error("Final Feedback Input element missing, cannot attach listener.");
         }
        skipFeedbackButton.addEventListener('click', () => {
            log("Skip feedback clicked.");
            userAnswers['FEEDBACK'] = 'skipped'; // Mark as skipped explicitly
            submitSurvey();
        });
        submitSurveyButton.addEventListener('click', submitSurvey);

        // --- Prevent Default Form Submission ---
        surveyForm.addEventListener('submit', (e) => {
            e.preventDefault(); // Stop browser's default submit action
            log("Default form submission prevented.");
            // Optional: Treat Enter key press as 'Next' if valid
             // if (validateCurrentQuestion()) {
             //     handleNextQuestion();
             // }
        });

        // --- Set Initial UI State ---
        surveyForm.style.display = 'none';
        if (feedbackSection) feedbackSection.style.display = 'none';
        if (completionScreen) completionScreen.style.display = 'none';
        backButton.classList.remove('visible'); // Start hidden
         nextButton.disabled = true; // Start disabled

        log("Marriott Survey Initialized successfully.");
    }

    // --- Shake Helper (Define if not already globally available) ---
    if (typeof Element.prototype.shake === 'undefined') {
        Element.prototype.shake = function () {
            log("Shaking element:", this.id || this.tagName);
            this.style.animation = 'shake 0.4s ease-in-out'; // Slightly longer shake
            setTimeout(() => { this.style.animation = ''; }, 400);
        };
        try {
            const sheet = document.styleSheets[0];
             let ruleExists = Array.from(sheet.cssRules).some(rule => rule.type === CSSRule.KEYFRAMES_RULE && rule.name === 'shake');
             if (!ruleExists) {
                 sheet.insertRule(`@keyframes shake {
                     0%, 100% { transform: translateX(0); }
                     20%, 60% { transform: translateX(-6px); } /* Adjust intensity */
                     40%, 80% { transform: translateX(6px); }
                 }`, sheet.cssRules.length);
                 log("Shake keyframes inserted.");
             }
        } catch (e) { console.warn("Shake animation insert failed:", e); }
    }

    // --- Run Initialization ---
    initializeSurvey();

}); // End DOMContentLoaded