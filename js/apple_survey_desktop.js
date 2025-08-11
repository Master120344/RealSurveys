document.addEventListener('DOMContentLoaded', () => {
    // --- DOM Elements ---
    const surveyContainer = document.querySelector('.survey-container');
    const welcomeScreen = document.getElementById('welcome-screen');
    const startButton = document.getElementById('startButton');
    const surveyForm = document.getElementById('appleSurveyForm');
    const questionContainer = document.getElementById('question-container');
    const backButton = document.getElementById('backButton');
    const nextButton = document.getElementById('nextButton');
    const surveyNavigation = document.getElementById('survey-navigation');
    const timerDisplay = document.getElementById('timeLeft');
    const timerContainer = document.getElementById('timer'); // The whole timer div for styling
    const progressBar = document.getElementById('progressBar');
    const feedbackSection = document.getElementById('feedback-section');
    const finalFeedbackInput = document.getElementById('finalFeedback');
    const charCountDisplay = document.getElementById('char-count');
    const skipFeedbackButton = document.getElementById('skipFeedbackButton');
    const submitSurveyButton = document.getElementById('submitSurveyButton');
    const completionScreen = document.getElementById('completion-screen');
    const completionMessage = document.getElementById('completion-message');


    // --- Survey Configuration & State ---
    const TIME_PER_QUESTION = 10; // Seconds
    const MAX_FEEDBACK_CHARS = 500;
    let currentQuestionId = null; // Start with null, set on survey start
    let userAnswers = {}; // Stores { questionId: answerValue }
    let questionHistory = []; // Stores visited question IDs for 'Back' button
    let timerInterval = null;
    let timeLeft = TIME_PER_QUESTION;
    let surveyStartTime = null;


    // --- Survey Questions Definition ---
    // Structure: id, text, type ('radio', 'checkbox', 'rating', 'textarea'),
    //            options (if applicable), required (boolean),
    //            next (id string, object for branching {value: nextId, default: defaultId}, or 'FEEDBACK'/'COMPLETE')
    //            maxSelection (for checkbox)
    const surveyQuestions = {
        'START': { // Virtual starting point
            next: 'Q1_OWNERSHIP'
        },
        'Q1_OWNERSHIP': {
            text: "Which of the following Apple devices do you currently own or use regularly? (Select all that apply)",
            type: 'checkbox',
            required: true, // Need at least one selected to gauge relevance
            options: [
                { value: 'iphone', label: 'iPhone' },
                { value: 'ipad', label: 'iPad' },
                { value: 'mac', label: 'Mac (MacBook, iMac, Mac mini, etc.)' },
                { value: 'watch', label: 'Apple Watch' },
                { value: 'tv', label: 'Apple TV' },
                { value: 'airpods', label: 'AirPods / Beats Headphones' },
                { value: 'homepod', label: 'HomePod / HomePod mini' },
                { value: 'visionpro', label: 'Apple Vision Pro'},
                { value: 'none', label: 'None of the above' }
            ],
            // Simple branching: If they own nothing, maybe ask why, otherwise ask about primary device
             next: (answers) => {
                 const currentAnswer = answers['Q1_OWNERSHIP'];
                 if (Array.isArray(currentAnswer) && currentAnswer.includes('none')) {
                     return 'Q_NONE_REASON'; // Ask why they don't own Apple products
                 } else if (Array.isArray(currentAnswer) && currentAnswer.length > 0) {
                     return 'Q2_PRIMARY_DEVICE'; // Ask about their main device
                 } else {
                    // This case shouldn't happen if required=true and validated
                    console.warn("Ownership question answered invalidly");
                     return 'Q2_PRIMARY_DEVICE'; // Default path
                 }
             }
        },
        'Q_NONE_REASON': { // Follow-up if no Apple products owned
            text: "What's the main reason you don't currently use Apple products?",
            type: 'radio',
            required: true,
            options: [
                { value: 'price', label: 'Price / Cost' },
                { value: 'preference', label: 'Prefer other operating systems (Android, Windows)' },
                { value: 'ecosystem_lockin', label: 'Concerned about ecosystem lock-in' },
                { value: 'repairability', label: 'Concerns about repairability or customization' },
                { value: 'features', label: 'Missing specific features I need' },
                { value: 'other', label: 'Other' }
            ],
            next: 'FEEDBACK' // Go directly to feedback after this branch
        },
        'Q2_PRIMARY_DEVICE': {
            text: "Which Apple device would you consider your MOST essential or primary device?",
            type: 'radio',
            required: true,
            options: [
                 // Options could dynamically populate based on Q1 answer, but simpler to list major ones
                { value: 'iphone', label: 'iPhone' },
                { value: 'mac', label: 'Mac' },
                { value: 'ipad', label: 'iPad' },
                { value: 'watch', label: 'Apple Watch' },
                { value: 'multiple', label: 'I rely on multiple devices equally' }
            ],
            next: 'Q3_SATISFACTION_OVERALL'
        },
        'Q3_SATISFACTION_OVERALL': {
            text: "Overall, how satisfied are you with your primary Apple device?",
            type: 'rating', // Can be styled like radio, but indicates scale
            required: true,
            options: [ // 1-5 scale for simplicity
                { value: 5, label: 'Very Satisfied' },
                { value: 4, label: 'Satisfied' },
                { value: 3, label: 'Neutral' },
                { value: 2, label: 'Dissatisfied' },
                { value: 1, label: 'Very Dissatisfied' }
            ],
            // Branch: If dissatisfied, ask why
             next: {
                 1: 'Q_DISSATISFACTION_REASON',
                 2: 'Q_DISSATISFACTION_REASON',
                 default: 'Q4_SOFTWARE_OS' // Default for Neutral/Satisfied/Very Satisfied
             }
        },
        'Q_DISSATISFACTION_REASON': {
            text: "What are the main reasons for your dissatisfaction?",
            type: 'checkbox',
            required: true,
            maxSelection: 3,
            options: [
                { value: 'performance', label: 'Performance Issues (slowness, crashes)' },
                { value: 'battery', label: 'Battery Life' },
                { value: 'software_bugs', label: 'Software Bugs / Glitches' },
                { value: 'features_missing', label: 'Missing Features I want/need' },
                { value: 'durability', label: 'Durability / Build Quality Concerns' },
                { value: 'price_ongoing', label: 'Cost of Ownership (repairs, accessories)' },
                { value: 'other', label: 'Other' }
            ],
             next: 'Q4_SOFTWARE_OS' // Merge back
        },
        'Q4_SOFTWARE_OS': {
            text: "How satisfied are you with the current operating system on your primary device (e.g., iOS, macOS)?",
            type: 'rating',
            required: true,
             options: [
                { value: 5, label: 'Very Satisfied' },
                { value: 4, label: 'Satisfied' },
                { value: 3, label: 'Neutral' },
                { value: 2, label: 'Dissatisfied' },
                { value: 1, label: 'Very Dissatisfied' }
            ],
             next: 'Q5_APPLE_SERVICES'
        },
        'Q5_APPLE_SERVICES': {
            text: "Which Apple subscription services do you currently use? (Select all that apply)",
            type: 'checkbox',
            required: false, // Okay if they use none
            options: [
                 { value: 'music', label: 'Apple Music' },
                 { value: 'tv_plus', label: 'Apple TV+' },
                 { value: 'arcade', label: 'Apple Arcade' },
                 { value: 'icloud_plus', label: 'iCloud+ (Paid Storage)' },
                 { value: 'fitness_plus', label: 'Apple Fitness+' },
                 { value: 'news_plus', label: 'Apple News+' },
                 { value: 'apple_one', label: 'Apple One Bundle' },
                 { value: 'none', label: 'None of these' }
            ],
            next: (answers) => {
                 const currentAnswer = answers['Q5_APPLE_SERVICES'];
                 // If they selected services (and not just 'none'), ask about satisfaction
                 if (Array.isArray(currentAnswer) && currentAnswer.length > 0 && !currentAnswer.includes('none')) {
                     return 'Q6_SERVICE_SATISFACTION';
                 } else {
                     return 'Q7_ECOSYSTEM'; // Skip service satisfaction if none selected
                 }
             }
        },
        'Q6_SERVICE_SATISFACTION': {
            text: "Overall, how satisfied are you with the value and quality of the Apple services you subscribe to?",
            type: 'rating',
            required: true,
             options: [
                { value: 5, label: 'Very Satisfied' },
                { value: 4, label: 'Satisfied' },
                { value: 3, label: 'Neutral' },
                { value: 2, label: 'Dissatisfied' },
                { value: 1, label: 'Very Dissatisfied' }
            ],
             next: 'Q7_ECOSYSTEM'
        },
        'Q7_ECOSYSTEM': {
            text: "How important is the integration between different Apple devices and services (the 'ecosystem') to you?",
            type: 'rating',
            required: true,
            options: [
                { value: 5, label: 'Extremely Important' },
                { value: 4, label: 'Very Important' },
                { value: 3, label: 'Moderately Important' },
                { value: 2, label: 'Slightly Important' },
                { value: 1, label: 'Not at all Important' }
            ],
            next: 'Q8_AI_INTEREST'
        },
         'Q8_AI_INTEREST': {
            text: "Apple recently announced 'Apple Intelligence' AI features. How interested are you in these upcoming capabilities?",
            type: 'rating',
            required: true,
            options: [
                { value: 5, label: 'Very Interested' },
                { value: 4, label: 'Somewhat Interested' },
                { value: 3, label: 'Neutral / Need to learn more' },
                { value: 2, label: 'Not very interested' },
                { value: 1, label: 'Not at all interested' }
            ],
            next: 'Q9_AI_PRIVACY'
        },
        'Q9_AI_PRIVACY': {
            text: "Regarding AI features, how confident are you in Apple's approach to user privacy?",
            type: 'rating',
            required: true,
             options: [
                { value: 5, label: 'Very Confident' },
                { value: 4, label: 'Confident' },
                { value: 3, label: 'Neutral / Unsure' },
                { value: 2, label: 'Slightly Concerned' },
                { value: 1, label: 'Very Concerned' }
            ],
             next: 'Q10_RECOMMENDATION'
        },
        'Q10_RECOMMENDATION': {
            text: "How likely are you to recommend Apple products to a friend or colleague?",
            type: 'rating', // NPS-style often 0-10, using 1-5 here
            required: true,
            options: [
                { value: 5, label: 'Very Likely' },
                { value: 4, label: 'Likely' },
                { value: 3, label: 'Neutral' },
                { value: 2, label: 'Unlikely' },
                { value: 1, label: 'Very Unlikely' }
            ],
            next: 'FEEDBACK' // Lead to final feedback section
        },
        // --- Special Sections ---
        'FEEDBACK': {
            type: 'textarea', // Special type handled by showFeedbackSection
            text: "Final Thoughts Area", // Placeholder text, actual labels in HTML
            required: false,
            next: 'COMPLETE' // Go to completion after feedback handled
        },
        'COMPLETE': { // Virtual endpoint
            type: 'completion'
        }
    };


    // --- Timer Functions ---
    function startTimer() {
        stopTimer(); // Clear any existing timer
        timeLeft = TIME_PER_QUESTION;
        updateTimerDisplay();
        timerContainer.classList.remove('low-time'); // Ensure low-time style is removed initially

        timerInterval = setInterval(() => {
            timeLeft--;
            updateTimerDisplay();

            if (timeLeft <= 3) { // Add low-time warning style
                timerContainer.classList.add('low-time');
            }

            if (timeLeft <= 0) {
                console.log("Time's up!");
                stopTimer();
                handleAutoAdvance(); // Move to next question automatically
            }
        }, 1000);
    }

    function stopTimer() {
        clearInterval(timerInterval);
        timerInterval = null;
         timerContainer.classList.remove('low-time');
    }

    function updateTimerDisplay() {
        const seconds = String(timeLeft).padStart(2, '0');
        timerDisplay.textContent = `00:${seconds}`;
    }

     function handleAutoAdvance() {
        // Simulate answering if required, maybe just skip validation
        console.log(`Auto-advancing from question: ${currentQuestionId}`);
        collectAnswer(currentQuestionId); // Collect whatever might be selected
        // Mark maybe as skipped due to time?
        // userAnswers[currentQuestionId + '_timed_out'] = true;
        handleNextQuestion();
     }


    // --- Question Rendering & Navigation ---
    function renderQuestion(questionId) {
        const question = surveyQuestions[questionId];
        if (!question || question.type === 'textarea' || question.type === 'completion') {
            console.error("Invalid question ID or type for rendering:", questionId);
             // Decide how to handle error - maybe go to feedback or completion
             showFeedbackSection();
            return;
        }

        stopTimer(); // Stop timer while rendering
        questionContainer.innerHTML = ''; // Clear previous content

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
            if (question.maxSelection) {
                optionsList.setAttribute('aria-describedby', `info_${questionId}`);
            }
        }

        if (question.options) {
            question.options.forEach((option, index) => {
                const listItem = document.createElement('li');
                const inputId = `q_${questionId}_opt${index}`;
                const input = document.createElement('input');
                input.type = question.type === 'checkbox' ? 'checkbox' : 'radio';
                input.id = inputId;
                input.name = `q_${questionId}`;
                input.value = option.value;

                // Restore checked state if answer exists
                const previousAnswer = userAnswers[questionId];
                if (previousAnswer) {
                    if (input.type === 'radio' && String(previousAnswer) === String(option.value)) {
                        input.checked = true;
                    } else if (input.type === 'checkbox' && Array.isArray(previousAnswer) && previousAnswer.includes(String(option.value))) {
                        input.checked = true;
                    }
                }

                const label = document.createElement('label');
                label.htmlFor = inputId;
                // Create a span inside label for styling text separately if needed
                const labelText = document.createElement('span');
                labelText.textContent = option.label;
                label.appendChild(input); // Input inside label
                label.appendChild(labelText);

                // Add listener to validate and potentially enable Next button
                 input.addEventListener('change', (event) => {
                     handleInputChange(questionId, question, event);
                });

                listItem.appendChild(label); // Add the label (containing input and text) to li
                optionsList.appendChild(listItem);
            });
            fieldset.appendChild(optionsList);

            // Add help text for checkboxes if applicable
            if (question.type === 'checkbox' && question.maxSelection) {
                 const helpText = document.createElement('p');
                 helpText.id = `info_${questionId}`;
                 helpText.classList.add('checkbox-help-text');
                 helpText.textContent = `(Select up to ${question.maxSelection})`;
                 fieldset.appendChild(helpText);
             }
        }

        questionContainer.appendChild(fieldset);

        // Update UI states
        updateNavigationButtons();
        updateProgressBar();
        validateCurrentQuestion(); // Set initial state of Next button

        // Start timer AFTER rendering is complete
        startTimer();
    }

    function handleInputChange(questionId, questionDef, event = null) {
         // Special handling for checkbox max selection
        if (questionDef.type === 'checkbox' && questionDef.maxSelection && event && event.target.checked) {
            const checkedBoxes = questionContainer.querySelectorAll(`input[name="q_${questionId}"]:checked`);
            if (checkedBoxes.length > questionDef.maxSelection) {
                 event.target.checked = false; // Prevent checking
                 // Maybe provide visual feedback (alert, inline message)
                 alert(`You can select a maximum of ${questionDef.maxSelection} options.`);
                 return; // Stop further processing for this input change
             }
         }
         // Re-validate after any input change
         validateCurrentQuestion();
     }


    function validateCurrentQuestion() {
        if (!currentQuestionId || !nextButton) return false; // Can't validate if no question or button

        const question = surveyQuestions[currentQuestionId];
        if (!question || !question.required) {
            nextButton.disabled = false; // Enable if not required
            return true;
        }

        let isValid = false;
        const inputs = questionContainer.querySelectorAll(`input[name="q_${currentQuestionId}"]`);

        if (question.type === 'radio' || question.type === 'rating') {
            isValid = questionContainer.querySelector(`input[name="q_${currentQuestionId}"]:checked`) !== null;
        } else if (question.type === 'checkbox') {
            isValid = questionContainer.querySelectorAll(`input[name="q_${currentQuestionId}"]:checked`).length > 0;
        } else {
             isValid = true; // Assume valid for unhandled required types (shouldn't happen)
        }

        nextButton.disabled = !isValid;
        return isValid;
    }


    function collectAnswer(questionId) {
        if (!questionId) return;
        const question = surveyQuestions[questionId];
        if (!question || question.type === 'textarea' || question.type === 'completion') return;

        if (question.type === 'radio' || question.type === 'rating') {
            const selected = questionContainer.querySelector(`input[name="q_${questionId}"]:checked`);
            userAnswers[questionId] = selected ? selected.value : undefined;
        } else if (question.type === 'checkbox') {
            const checked = Array.from(questionContainer.querySelectorAll(`input[name="q_${questionId}"]:checked`));
            userAnswers[questionId] = checked.length > 0 ? checked.map(cb => cb.value) : undefined; // Store array or undefined
        }

        // Clear undefined answers to keep userAnswers clean
         if (userAnswers[questionId] === undefined) {
             delete userAnswers[questionId];
         }
    }


     function getNextQuestionId() {
        if (!currentQuestionId) return surveyQuestions['START'].next; // Get first question ID

        const question = surveyQuestions[currentQuestionId];
        if (!question || !question.next) return 'FEEDBACK'; // Default to feedback if no next defined

        if (typeof question.next === 'string') {
            return question.next; // Simple next ID
        }

         if (typeof question.next === 'function') {
             // Dynamic branching based on collected answers so far
             return question.next(userAnswers);
         }

        if (typeof question.next === 'object') {
            // Value-based branching
            const answer = userAnswers[currentQuestionId];
             if (answer !== undefined && question.next[String(answer)]) {
                 return question.next[String(answer)];
             } else if (question.next['default']) {
                return question.next['default'];
            }
        }

        console.warn("Could not determine next question from:", currentQuestionId, "Falling back to FEEDBACK.");
        return 'FEEDBACK'; // Fallback
    }


    function handleNextQuestion() {
        if (!validateCurrentQuestion()) {
            // Maybe add a visual shake/error indication?
            console.warn("Validation failed. Cannot proceed.");
            return;
        }

        collectAnswer(currentQuestionId); // Collect answer before navigating
        stopTimer(); // Stop timer for current question

        const nextId = getNextQuestionId();

        // Add current question to history *before* changing currentQuestionId
        if(currentQuestionId && !questionHistory.includes(currentQuestionId)) { // Avoid duplicates if possible
            questionHistory.push(currentQuestionId);
        }

        currentQuestionId = nextId; // Move to the next state

        if (currentQuestionId === 'FEEDBACK') {
            showFeedbackSection();
        } else if (currentQuestionId === 'COMPLETE') {
            // This should ideally be triggered *after* feedback submission
            console.error("Reached COMPLETE state prematurely.");
            submitSurvey(); // Or call appropriate final step
        } else if (surveyQuestions[currentQuestionId]) {
            renderQuestion(currentQuestionId);
        } else {
            console.error(`Next question ID "${currentQuestionId}" is invalid.`);
            showFeedbackSection(); // Fallback to feedback if next ID is wrong
        }
    }

    function handlePreviousQuestion() {
        if (questionHistory.length === 0) return; // Cannot go back further

        stopTimer(); // Stop timer for current question
        // Don't collect answer when going back

        currentQuestionId = questionHistory.pop(); // Get the previous ID and remove from history

        if (surveyQuestions[currentQuestionId]) {
            renderQuestion(currentQuestionId); // Re-render previous question (answers should be restored)
        } else {
             console.error(`Previous question ID "${currentQuestionId}" became invalid?`);
             // Handle error state - maybe go to start?
             startSurvey();
        }
    }


    function updateNavigationButtons() {
         if (backButton) {
             // Show back button if history exists
             if(questionHistory.length > 0) {
                backButton.classList.add('visible');
             } else {
                backButton.classList.remove('visible');
             }
         }
         // Next button state is handled by validateCurrentQuestion()
    }

     function updateProgressBar() {
         if (!progressBar) return;
         // Simple progress based on history length. Might not reflect total % accurately with branching.
         const totalEstimate = Object.keys(surveyQuestions).length - 3; // Estimate total (- START, FEEDBACK, COMPLETE)
         const currentStep = questionHistory.length + 1; // +1 for the current question not yet in history
         let progress = totalEstimate > 0 ? (currentStep / totalEstimate) * 100 : 0;
         progress = Math.min(progress, 100); // Cap at 100%

         progressBar.style.width = `${progress}%`;
     }


    // --- Feedback Section ---
    function showFeedbackSection() {
        stopTimer(); // Ensure timer is stopped
        // Hide question area, show feedback area
        if(surveyForm) surveyForm.style.display = 'none';
        if(feedbackSection) feedbackSection.style.display = 'block';
        if(welcomeScreen) welcomeScreen.style.display = 'none'; // Ensure welcome is hidden too

        // Initialize char count
        if(finalFeedbackInput) {
             finalFeedbackInput.value = userAnswers['FEEDBACK'] || ''; // Restore feedback if previously entered
             updateCharCount();
         }
    }

     function updateCharCount() {
        if (!finalFeedbackInput || !charCountDisplay) return;
        const currentLength = finalFeedbackInput.value.length;
        charCountDisplay.textContent = `${currentLength} / ${MAX_FEEDBACK_CHARS} characters`;

        if (currentLength > MAX_FEEDBACK_CHARS) {
             charCountDisplay.classList.add('limit-exceeded');
             if(submitSurveyButton) submitSurveyButton.disabled = true; // Disable submit if too long
         } else {
             charCountDisplay.classList.remove('limit-exceeded');
              if(submitSurveyButton) submitSurveyButton.disabled = false;
         }
    }


    // --- Survey Start & Completion ---
    function startSurvey() {
         console.log("Starting survey...");
         surveyStartTime = new Date(); // Record start time
         userAnswers = {}; // Reset answers
         questionHistory = []; // Reset history
         currentQuestionId = 'START'; // Set to virtual start point

         // Hide welcome, show form
         if (welcomeScreen) welcomeScreen.style.display = 'none';
         if (surveyForm) surveyForm.style.display = 'block';
         if (feedbackSection) feedbackSection.style.display = 'none'; // Ensure hidden
         if (completionScreen) completionScreen.style.display = 'none'; // Ensure hidden

         handleNextQuestion(); // Load the first actual question
    }

    function submitSurvey() {
         stopTimer(); // Final stop
         console.log("Submitting survey...");

         // Collect final feedback text
         if (finalFeedbackInput && feedbackSection.style.display === 'block') { // Only collect if feedback section was shown
             userAnswers['FEEDBACK'] = finalFeedbackInput.value.trim();
             // Final validation for feedback length
             if (userAnswers['FEEDBACK'].length > MAX_FEEDBACK_CHARS) {
                 alert(`Feedback is too long (max ${MAX_FEEDBACK_CHARS} chars). Please shorten it.`);
                 return; // Prevent submission
             }
         }

         // Record end time and duration
         const surveyEndTime = new Date();
         const surveyDuration = Math.round((surveyEndTime - surveyStartTime) / 1000); // Duration in seconds
         userAnswers['surveyMetaData'] = {
             startTime: surveyStartTime.toISOString(),
             endTime: surveyEndTime.toISOString(),
             durationSeconds: surveyDuration,
             userAgent: navigator.userAgent // Example meta data
         };


         // --- Simulation of Backend Processing ---
         console.log("---- SURVEY RESULTS ----");
         console.log(JSON.stringify(userAnswers, null, 2));
         console.log("---- SIMULATING BACKEND UPDATE ----");
         // 1. Simulate getting user email (replace with actual method if available)
         const userEmail = "user_" + Math.random().toString(36).substring(2, 9) + "@realsurveys-example.com"; // Fake email
         console.log(`Identified user: ${userEmail}`);

         // 2. Simulate updating balance (replace with actual API call if needed)
         // Assume some function `updateUserBalance(email, amount)` exists elsewhere
         const rewardAmount = 0.50; // Example reward
         console.log(`Attempting to update balance for ${userEmail} by $${rewardAmount.toFixed(2)}...`);
         // simulateBalanceUpdate(userEmail, rewardAmount); // Call hypothetical function
         setTimeout(() => { // Simulate network delay for balance update
             console.log(`Balance update successful (simulated).`);
             if (completionMessage) completionMessage.textContent = `Reward of $${rewardAmount.toFixed(2)} processed for ${userEmail}.`; // Update completion message
         }, 1000);
         // --- End Simulation ---


         // Show completion screen
         if (surveyForm) surveyForm.style.display = 'none';
         if (feedbackSection) feedbackSection.style.display = 'none';
         if (completionScreen) completionScreen.style.display = 'block';

         // Trigger confetti
        if (window.confetti) {
            confetti({ particleCount: 120, spread: 70, origin: { y: 0.6 } });
        }

         // Redirect after delay
         setTimeout(() => {
             console.log("Redirecting to surveys.html...");
             window.location.href = 'surveys.html'; // Or another target page
         }, 6000); // Increased delay to allow reading completion message
    }


    // --- Event Listeners ---
     if (startButton) {
         startButton.addEventListener('click', startSurvey);
     } else { console.error("Start Button not found"); }

     if (nextButton) {
         nextButton.addEventListener('click', handleNextQuestion);
     } else { console.error("Next Button not found"); }

     if (backButton) {
         backButton.addEventListener('click', handlePreviousQuestion);
     } else { console.error("Back Button not found"); }

     if (finalFeedbackInput) {
         finalFeedbackInput.addEventListener('input', updateCharCount);
     }

     if (skipFeedbackButton) {
         skipFeedbackButton.addEventListener('click', () => {
            userAnswers['FEEDBACK'] = 'skipped'; // Mark as skipped explicitly
            submitSurvey(); // Submit without feedback text
        });
     } else { console.error("Skip Feedback Button not found"); }

     if (submitSurveyButton) {
        submitSurveyButton.addEventListener('click', submitSurvey);
     } else { console.error("Submit Survey Button not found"); }

     // Prevent default form submission via Enter key (usually unwanted in multi-step forms)
     if (surveyForm) {
         surveyForm.addEventListener('submit', (e) => {
             e.preventDefault();
             // Optionally trigger 'Next' if Enter is pressed and Next is enabled
             if (nextButton && !nextButton.disabled) {
                // handleNextQuestion(); // Careful: this might be confusing UX
             }
         });
     }


    // --- Initial Setup ---
    // Hide elements that should not be visible initially
    if(surveyForm) surveyForm.style.display = 'none';
    if(feedbackSection) feedbackSection.style.display = 'none';
    if(completionScreen) completionScreen.style.display = 'none';
    // Ensure back button is initially hidden correctly via CSS/JS interaction
    if(backButton) backButton.classList.remove('visible');

    console.log("Apple Survey Initialized. Waiting for user to start.");

}); // End DOMContentLoaded