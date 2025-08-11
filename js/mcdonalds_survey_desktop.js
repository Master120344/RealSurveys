document.addEventListener('DOMContentLoaded', () => {
    // --- DOM Elements ---
    const surveyForm = document.getElementById('mcdonaldsSurveyForm');
    const welcomeMessage = document.getElementById('welcome-message');
    const startButton = document.getElementById('startButton');
    const questionContainer = document.getElementById('question-container');
    const nextButton = document.getElementById('nextButton');
    // const prevButton = document.getElementById('prevButton'); // Previous button logic removed as discussed
    const surveyNavigation = document.getElementById('survey-navigation');
    const questionProgress = document.getElementById('question-progress');
    const feedbackSection = document.getElementById('feedback-section');
    const finalFeedbackInput = document.getElementById('finalFeedback');
    const charCountDisplay = document.getElementById('char-count');
    const skipFeedbackButton = document.getElementById('skipFeedbackButton');
    const submitSurveyButton = document.getElementById('submitSurveyButton');
    const completionScreen = document.getElementById('completion-screen');
    const surveyWrapper = document.getElementById('survey-wrapper');

    // --- Survey Data & State ---
    let currentQuestionId = 'START'; // Initial state before starting
    let userAnswers = {}; // Object to store { questionId: answerValue } // Use let to allow reassignment
    let questionHistory = []; // To potentially implement 'Previous' later if needed

    // Maximum characters for the feedback textarea
    const MAX_FEEDBACK_CHARS = 500;
    if (finalFeedbackInput) { // Check if element exists before setting property
        finalFeedbackInput.maxLength = MAX_FEEDBACK_CHARS; // Ensure HTML attribute is set
    }


    // --- Survey Questions Definition ---
    // Structure: id, text, type ('radio', 'checkbox', 'text', 'rating'), options (if applicable), next (can be ID string or {value: nextId, ...}), required (boolean)
    const surveyQuestions = {
        // Entry Point
        'Q_START': {
             text: "Let's get started!",
             type: 'info', // Not really a question, just a transition
             next: 'Q1_FREQUENCY'
        },
        // --- Core Questions ---
        'Q1_FREQUENCY': {
            text: "How often do you typically visit or order from McDonald's?",
            type: 'radio',
            required: true,
            options: [
                { value: 'daily', label: 'Daily' },
                { value: 'weekly', label: 'A few times a week' },
                { value: 'monthly', label: 'A few times a month' },
                { value: 'rarely', label: 'Rarely (Less than once a month)' },
                { value: 'never', label: 'This is my first time / I haven\'t visited in a long time' }
            ],
            // Branching Example: Frequent vs Infrequent visitors get different follow-ups
            next: {
                'daily': 'Q2A_RECENT_EXPERIENCE',
                'weekly': 'Q2A_RECENT_EXPERIENCE',
                'monthly': 'Q2B_PRIMARY_REASON',
                'rarely': 'Q2B_PRIMARY_REASON',
                'never': 'Q2B_PRIMARY_REASON'
            }
        },
        // --- Branch A: Frequent Visitors ---
        'Q2A_RECENT_EXPERIENCE': {
            text: "Thinking about your most RECENT visit, how would you rate your overall satisfaction?",
            type: 'rating', // Custom type potentially handled differently (e.g., stars)
            required: true,
            options: [ // Representing rating scale
                { value: 5, label: 'Very Satisfied' },
                { value: 4, label: 'Satisfied' },
                { value: 3, label: 'Neutral' },
                { value: 2, label: 'Dissatisfied' },
                { value: 1, label: 'Very Dissatisfied' }
            ],
            next: 'Q3A_ORDER_METHOD' // Next question for frequent visitors
        },
        'Q3A_ORDER_METHOD': {
            text: "How did you place your order on your most recent visit?",
            type: 'radio',
            required: true,
            options: [
                { value: 'counter', label: 'At the Counter' },
                { value: 'kiosk', label: 'Self-Order Kiosk' },
                { value: 'drive_thru', label: 'Drive-Thru' },
                { value: 'mobile_app', label: 'Mobile App (Pick-up or Delivery)' },
                { value: 'delivery_service', label: 'Third-Party Delivery (e.g., DoorDash, Uber Eats)' }
            ],
            next: 'Q4_FOOD_QUALITY' // Merge back to common questions
        },
         // --- Branch B: Infrequent/New Visitors ---
        'Q2B_PRIMARY_REASON': {
            text: "What's the PRIMARY reason you visit McDonald's (or decided to visit this time)?",
            type: 'radio',
            required: true,
            options: [
                { value: 'convenience', label: 'Convenience / Location' },
                { value: 'price', label: 'Value / Price' },
                { value: 'specific_item', label: 'Craving a specific menu item (e.g., Fries, Big Mac)' },
                { value: 'kids_family', label: 'Treat for Kids / Family' },
                { value: 'quick_meal', label: 'Needed a quick meal on the go' },
                { value: 'other', label: 'Other reason' }
            ],
            next: 'Q3B_CONSIDER_OTHER'
        },
        'Q3B_CONSIDER_OTHER': {
             text: "When choosing a fast-food restaurant, which factors are MOST important to you? (Select up to 3)",
             type: 'checkbox',
             required: true,
             maxSelection: 3, // Custom property for JS validation
             options: [
                 { value: 'food_quality', label: 'Food Quality/Taste' },
                 { value: 'price_value', label: 'Price/Value for Money' },
                 { value: 'speed_service', label: 'Speed of Service' },
                 { value: 'menu_variety', label: 'Menu Variety' },
                 { value: 'cleanliness', label: 'Cleanliness of Restaurant' },
                 { value: 'staff_friendliness', label: 'Staff Friendliness' },
                 { value: 'location_convenience', label: 'Location/Convenience' },
                 { value: 'healthy_options', label: 'Availability of Healthy Options'}
             ],
            next: 'Q4_FOOD_QUALITY' // Merge back to common questions
        },
        // --- Common Questions ---
        'Q4_FOOD_QUALITY': {
            text: "How would you rate the quality and taste of the food you received during your recent visit(s)?",
            type: 'rating',
            required: true,
            options: [
                { value: 5, label: 'Excellent' },
                { value: 4, label: 'Good' },
                { value: 3, label: 'Average' },
                { value: 2, label: 'Below Average' },
                { value: 1, label: 'Poor' }
            ],
             next: 'Q5_SERVICE_SPEED'
        },
        'Q5_SERVICE_SPEED': {
            text: "How satisfied were you with the speed of service?",
            type: 'radio',
            required: true,
             options: [
                { value: 'very_satisfied', label: 'Very Satisfied' },
                { value: 'satisfied', label: 'Satisfied' },
                { value: 'neutral', label: 'Neutral' },
                { value: 'dissatisfied', label: 'Dissatisfied' },
                { value: 'very_dissatisfied', label: 'Very Dissatisfied' }
            ],
            next: 'Q6_ORDER_ACCURACY'
        },
        'Q6_ORDER_ACCURACY': {
            text: "Was your order accurate?",
            type: 'radio',
            required: true,
            options: [
                { value: 'yes', label: 'Yes, completely accurate' },
                { value: 'mostly', label: 'Mostly accurate, minor issue' },
                { value: 'no', label: 'No, there were significant errors' },
                { value: 'not_sure', label: 'I didn\'t check / Not sure' }
            ],
             // Branch based on accuracy
             next: {
                 'yes': 'Q7_CLEANLINESS',
                 'mostly': 'Q6A_ACCURACY_ISSUE',
                 'no': 'Q6A_ACCURACY_ISSUE',
                 'not_sure': 'Q7_CLEANLINESS'
            }
        },
         'Q6A_ACCURACY_ISSUE': {
             text: "What was the issue with your order accuracy? (Select all that apply)",
             type: 'checkbox',
             required: true,
             options: [
                 { value: 'missing_item', label: 'Missing item(s)' },
                 { value: 'wrong_item', label: 'Received wrong item(s)' },
                 { value: 'incorrect_customization', label: 'Incorrect customization (e.g., no pickles)' },
                 { value: 'wrong_size', label: 'Wrong size (drink/fries)' },
                 { value: 'other', label: 'Other issue' }
             ],
             next: 'Q7_CLEANLINESS'
         },
        'Q7_CLEANLINESS': {
            text: "How would you rate the cleanliness of the McDonald's location you visited (dining area, restrooms, exterior)?",
             type: 'radio',
             required: true,
             options: [
                { value: 5, label: 'Very Clean' },
                { value: 4, label: 'Clean' },
                { value: 3, label: 'Average' },
                { value: 2, label: 'Needs Improvement' },
                { value: 1, label: 'Dirty' },
                { value: 0, label: 'N/A (Drive-thru/Delivery Only)'}
            ],
            next: 'Q8_STAFF_FRIENDLINESS'
        },
        'Q8_STAFF_FRIENDLINESS': {
            text: "How would you rate the friendliness and helpfulness of the staff you interacted with?",
             type: 'radio',
             required: true,
             options: [
                { value: 5, label: 'Very Friendly & Helpful' },
                { value: 4, label: 'Friendly & Helpful' },
                { value: 3, label: 'Neutral / Minimal Interaction' },
                { value: 2, label: 'Unfriendly / Unhelpful' },
                { value: 1, label: 'Very Unfriendly / Rude' },
                { value: 0, label: 'N/A (No interaction / Kiosk / Mobile)'}
            ],
            next: 'Q9_VALUE_PERCEPTION'
        },
        'Q9_VALUE_PERCEPTION': {
            text: "Considering the price you paid, how would you rate the overall value for money?",
             type: 'rating',
             required: true,
             options: [
                 { value: 5, label: 'Excellent Value' },
                 { value: 4, label: 'Good Value' },
                 { value: 3, label: 'Fair Value' },
                 { value: 2, label: 'Poor Value' },
                 { value: 1, label: 'Very Poor Value' }
             ],
            next: 'Q10_RECOMMENDATION'
        },
        'Q10_RECOMMENDATION': {
            text: "How likely are you to recommend this specific McDonald's location to a friend or colleague?",
             type: 'rating', // Often 0-10 scale for NPS-like questions
             required: true,
             options: [ // Example 1-5 scale for simplicity here
                 { value: 5, label: 'Very Likely' },
                 { value: 4, label: 'Likely' },
                 { value: 3, label: 'Neutral' },
                 { value: 2, label: 'Unlikely' },
                 { value: 1, label: 'Very Unlikely' }
             ],
            next: 'FINAL_FEEDBACK' // Special ID to trigger the feedback section
        }
    };


    // --- Functions ---

    /** Starts the survey */
    function startSurvey() {
        // Ensure elements exist before manipulating style
        if (welcomeMessage) welcomeMessage.style.display = 'none';
        if (surveyForm) surveyForm.style.display = 'block';
        if (surveyNavigation) surveyNavigation.style.display = 'flex';

        currentQuestionId = 'Q_START'; // Set initial logical question
        userAnswers = {}; // Reset answers
        questionHistory = []; // Reset history
        handleNextQuestion(); // Load the first actual question
    }


    /** Renders the specified question by ID */
    function renderQuestion(questionId) {
        const question = surveyQuestions[questionId];
        if (!question) {
            console.error("Question not found:", questionId);
            showCompletionScreen(); // Or handle error state
            return;
        }

        // Ensure container exists
        if (!questionContainer) {
            console.error("Question container not found!");
            return;
        }

        // Clear previous question
        questionContainer.innerHTML = '';
        questionHistory.push(questionId); // Add to history

        // Create question card (fieldset)
        const fieldset = document.createElement('fieldset');
        fieldset.id = `q_${questionId}`;
        fieldset.classList.add('question-card');
        // Add ARIA attributes for better accessibility
        fieldset.setAttribute('aria-labelledby', `legend_${questionId}`);


        const legend = document.createElement('legend');
        legend.id = `legend_${questionId}`; // Match aria-labelledby
        legend.innerHTML = question.text; // Use innerHTML for potential basic formatting
        fieldset.appendChild(legend);

        // Create options list
        const optionsList = document.createElement('ul');
        optionsList.classList.add('options-list');
        if (question.type === 'radio' || question.type === 'rating') {
             optionsList.setAttribute('role', 'radiogroup');
        } else if (question.type === 'checkbox') {
             optionsList.setAttribute('role', 'group');
             // Add aria-describedby for max selection info if applicable
             if (question.maxSelection) {
                 optionsList.setAttribute('aria-describedby', `info_${questionId}`);
             }
        }


        if (question.type === 'radio' || question.type === 'checkbox' || question.type === 'rating') {
            question.options.forEach((option, index) => {
                const listItem = document.createElement('li');
                const inputId = `q_${questionId}_opt${index}`;

                const input = document.createElement('input');
                input.type = question.type === 'checkbox' ? 'checkbox' : 'radio'; // Treat rating as radio for selection
                input.id = inputId;
                input.name = `q_${questionId}`; // Group radios/checkboxes
                input.value = option.value;
                // Input itself shouldn't be required; the fieldset/group implies requirement
                // input.required = question.required;

                // *** CORRECTED/COMPLETED LINE ***
                // Check if this option was previously selected (restoring state if user goes back/forward - though 'back' isn't implemented here)
                if (userAnswers[questionId]) {
                     if (question.type !== 'checkbox' && String(userAnswers[questionId]) === String(option.value)) {
                         input.checked = true;
                     } else if (question.type === 'checkbox' && Array.isArray(userAnswers[questionId]) && userAnswers[questionId].includes(String(option.value))) {
                         input.checked = true;
                     }
                 }
                 // *** END OF CORRECTION ***


                const label = document.createElement('label');
                label.htmlFor = inputId;
                label.textContent = option.label;

                // Add change listener to enable next/submit button immediately on selection
                input.addEventListener('change', (event) => { // Pass event for checkbox check
                     handleInputChange(questionId, question, event);
                });

                listItem.appendChild(input);
                listItem.appendChild(label);
                optionsList.appendChild(listItem);
            });
            fieldset.appendChild(optionsList);

             // Add specific instructions for checkbox max selection
             if (question.type === 'checkbox' && question.maxSelection) {
                 const helpText = document.createElement('p');
                 helpText.id = `info_${questionId}`; // Match aria-describedby
                 helpText.classList.add('checkbox-help-text');
                 helpText.textContent = `(Select up to ${question.maxSelection})`;
                 helpText.style.fontSize = '0.9em'; // Example styling
                 helpText.style.color = '#666';
                 helpText.style.marginTop = '10px';
                 fieldset.appendChild(helpText);
             }

        } else if (question.type === 'text') {
            // Handle text input questions
            const inputId = `q_${questionId}_text`;
            const input = document.createElement('input');
            input.type = 'text';
            input.id = inputId;
            input.name = `q_${questionId}`;
            input.classList.add('text-input'); // Apply CSS class
            // input.required = question.required; // Handled by validation function
            input.placeholder = question.placeholder || 'Type your answer here...';
            if (userAnswers[questionId]) {
                input.value = userAnswers[questionId];
            }
            input.setAttribute('aria-required', question.required ? 'true' : 'false'); // Accessibility
             input.addEventListener('input', () => { // Use input event for text fields
                 handleInputChange(questionId, question);
            });
             // Add label for accessibility
             const label = document.createElement('label');
             label.htmlFor = inputId;
             label.classList.add('visually-hidden'); // Hide label visually if legend covers it
             label.textContent = question.text;
             fieldset.insertBefore(label, input); // Insert label before input
            fieldset.appendChild(input);
        } else if (question.type === 'info') {
            // Handle info screens (no input needed)
            // Legend already displays the text, nothing more needed here usually
            // Automatically enable next for info screens
            if (nextButton) nextButton.disabled = false;
        }
        // ... add more question types as needed

        questionContainer.appendChild(fieldset);

        // Initial check for validation state after rendering
        validateCurrentQuestion(questionId, question);
        updateProgress();
    }


     /** Handles input changes to validate and enable/disable Next */
    function handleInputChange(questionId, questionDef, event = null) {
         // If it's a radio button or rating, selecting one always meets the requirement if it's required
         if ((questionDef.type === 'radio' || questionDef.type === 'rating') && questionDef.required) {
            if(nextButton) nextButton.disabled = false;
         }
         // For other types, re-validate
         else {
             validateCurrentQuestion(questionId, questionDef);
         }

         // Special handling for checkbox max selection
         if (questionDef.type === 'checkbox' && questionDef.maxSelection && event) {
             const checkedBoxes = questionContainer.querySelectorAll(`input[name="q_${questionId}"]:checked`);
             if (checkedBoxes.length > questionDef.maxSelection) {
                 // Uncheck the one that was just clicked to prevent exceeding max
                 event.target.checked = false;
                 alert(`You can select a maximum of ${questionDef.maxSelection} options.`);
                 validateCurrentQuestion(questionId, questionDef); // Revalidate after unchecking
             }
         }
     }


    /** Validates the current question and enables/disables the Next button */
    function validateCurrentQuestion(questionId, questionDef) {
         let isValid = false;

         // Ensure the button exists before trying to disable/enable it
         if (!nextButton) return false; // Cannot proceed if button doesn't exist

         // If questionDef is missing or not required, it's valid to proceed
         if (!questionDef || !questionDef.required) {
             isValid = true;
         } else if (questionContainer) { // Ensure container exists before querying
             switch (questionDef.type) {
                 case 'radio':
                 case 'rating':
                     isValid = questionContainer.querySelector(`input[name="q_${questionId}"]:checked`) !== null;
                     break;
                 case 'checkbox':
                     const checkedCount = questionContainer.querySelectorAll(`input[name="q_${questionId}"]:checked`).length;
                     isValid = checkedCount > 0; // At least one must be checked if required
                     break;
                 case 'text':
                     const textInput = questionContainer.querySelector(`input[name="q_${questionId}"]`);
                     isValid = textInput && textInput.value.trim() !== '';
                     break;
                 case 'info':
                     isValid = true; // No input required for info screens
                     break;
                 // Add validation for other types if needed
                 default:
                     isValid = true; // Assume valid if type is unknown/unhandled but required
                     console.warn("Unhandled question type for validation:", questionDef.type);
             }
         }

         nextButton.disabled = !isValid;
         return isValid;
     }


    /** Gathers the answer(s) for the current question */
     function collectAnswer(questionId, questionDef) {
         if (!questionDef || !questionContainer) return; // Should not happen, check elements exist

         switch (questionDef.type) {
             case 'radio':
             case 'rating':
                const selectedRadio = questionContainer.querySelector(`input[name="q_${questionId}"]:checked`);
                 if (selectedRadio) {
                     userAnswers[questionId] = selectedRadio.value;
                 } else {
                     delete userAnswers[questionId]; // Clear if nothing selected (e.g., if revisiting)
                 }
                 break;
             case 'checkbox':
                const checkedBoxes = questionContainer.querySelectorAll(`input[name="q_${questionId}"]:checked`);
                 // Store as an array of values, or empty array if none checked
                userAnswers[questionId] = Array.from(checkedBoxes).map(cb => cb.value);
                 break;
             case 'text':
                const textInput = questionContainer.querySelector(`input[name="q_${questionId}"]`);
                 if (textInput) {
                     const value = textInput.value.trim();
                     if (value) {
                        userAnswers[questionId] = value;
                     } else {
                        delete userAnswers[questionId]; // Clear if empty
                     }
                 }
                 break;
             case 'info':
                 // No answer to collect for info screens
                 break;
             // Handle other types
         }
    }


    /** Determines the next question ID based on current answer */
    function getNextQuestionId(currentId, currentDef) {
        if (!currentDef || !currentDef.next) {
            return 'FINAL_FEEDBACK'; // Default to feedback if no 'next' defined
        }

        if (typeof currentDef.next === 'string') {
            return currentDef.next; // Simple transition
        }

        if (typeof currentDef.next === 'object') {
            // Branching logic
            const answer = userAnswers[currentId]; // This could be a string or an array for checkboxes

            // Handle potential case where answer isn't set (shouldn't happen if required)
             if (answer === undefined || answer === null) {
                 console.warn(`Answer for ${currentId} is missing. Checking for default.`);
                 return currentDef.next['default'] || 'FINAL_FEEDBACK';
            }

             // Check if the specific answer value exists as a key in the 'next' object
             // Need to handle array answers for checkboxes - branching usually based on *presence* of a value, not the whole array.
             // For now, basic value matching for radio/rating:
             const stringAnswer = String(answer); // Convert answer to string for matching keys
             if (currentDef.next[stringAnswer]) {
                 return currentDef.next[stringAnswer];
            } else if (currentDef.next['default']) {
                return currentDef.next['default']; // Go to a default if specific answer branch not found
            } else {
                 console.warn(`Branching logic failed for ${currentId} with answer ${answer}. No specific path or default found. Proceeding to feedback.`);
                return 'FINAL_FEEDBACK';
            }
        }

        return 'FINAL_FEEDBACK'; // Fallback
    }


    /** Handles moving to the next question or feedback/completion */
     function handleNextQuestion() {
         const currentQuestionDef = surveyQuestions[currentQuestionId];

         // Check if elements exist
         if (!currentQuestionDef || !nextButton) {
              console.error("Cannot proceed: current question definition or next button missing.");
              return;
         }

         // Collect answer before moving on (except for the initial START 'question')
         if (currentQuestionId !== 'START') {
             collectAnswer(currentQuestionId, currentQuestionDef);
         }

         // Validate before proceeding (Button state *should* prevent this, but double-check)
         if (currentQuestionId !== 'START' && currentQuestionDef.required && !validateCurrentQuestion(currentQuestionId, currentQuestionDef)) {
             console.warn("Validation failed unexpectedly. Cannot proceed.");
             // Optionally show a user-facing error message here
             return;
         }


         const nextId = getNextQuestionId(currentQuestionId, currentQuestionDef);

         if (nextId === 'FINAL_FEEDBACK') {
             showFeedbackSection();
         } else if (surveyQuestions[nextId]) { // Check if the next question actually exists
            currentQuestionId = nextId;
            renderQuestion(currentQuestionId);
            // Ensure Next button is disabled until the *new* question is answered (if required)
            validateCurrentQuestion(currentQuestionId, surveyQuestions[currentQuestionId]);
         } else {
             console.error(`Next question ID "${nextId}" not found in surveyQuestions. Ending survey.`);
             showCompletionScreen(); // Go to completion if next question is invalid
         }
     }


    /** Displays the final feedback section */
    function showFeedbackSection() {
         // Ensure elements exist before hiding/showing
        if (questionContainer) questionContainer.style.display = 'none';
        if (surveyNavigation) surveyNavigation.style.display = 'none';
        if (questionProgress) questionProgress.style.display = 'none';

        if (feedbackSection) {
            feedbackSection.style.display = 'block';
            updateCharCount(); // Initialize character count display
        } else {
            console.error("Feedback section element not found!");
        }
    }


    /** Updates the character count display for the feedback textarea */
    function updateCharCount() {
        if (!finalFeedbackInput || !charCountDisplay) return; // Check if elements exist

        const currentLength = finalFeedbackInput.value.length;
        charCountDisplay.textContent = `${currentLength} / ${MAX_FEEDBACK_CHARS} characters`;

        // Optional: Add visual indication if near/over limit
        if (currentLength > MAX_FEEDBACK_CHARS) {
             charCountDisplay.style.color = 'var(--mcd-red)';
             // Optionally disable submit button if over limit?
             // if(submitSurveyButton) submitSurveyButton.disabled = true;
         } else {
             charCountDisplay.style.color = '#777';
              // if(submitSurveyButton) submitSurveyButton.disabled = false;
         }
    }

    /** Handles submitting the survey (final step) */
    function submitSurvey() {
        // 1. Collect the final feedback (if any)
        if (finalFeedbackInput) {
            userAnswers['finalFeedback'] = finalFeedbackInput.value.trim();
        } else {
             userAnswers['finalFeedback'] = ''; // Ensure property exists even if input field was missing
        }


        // 2. (Optional) Final validation (e.g., ensure feedback isn't too long if that's a hard rule)
         if (userAnswers['finalFeedback'].length > MAX_FEEDBACK_CHARS) {
             alert(`Your feedback exceeds the maximum length of ${MAX_FEEDBACK_CHARS} characters. Please shorten it.`);
             return; // Prevent submission
         }

        // 3. Prepare data for sending (e.g., to a server)
        console.log("Survey Submitted! Data:", JSON.stringify(userAnswers, null, 2)); // Pretty print JSON
        // In a real application, you would send `userAnswers` via fetch() or similar:
        /*
        fetch('/api/submit-mcdonalds-survey', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(userAnswers)
        })
        .then(response => {
             if (!response.ok) {
                 throw new Error(`HTTP error! status: ${response.status}`);
             }
             return response.json();
        })
        .then(data => {
            console.log('Server response:', data);
            showCompletionScreen(); // Show completion on success
        })
        .catch(error => {
            console.error('Error submitting survey:', error);
            // Show an error message to the user
            alert('Sorry, there was an error submitting your feedback. Please try again later.');
             // Optionally re-enable submit buttons or provide other recovery options
        });
        */

        // 4. Show completion screen (simulate success for now)
        showCompletionScreen();
    }


    /** Shows the thank you/completion screen */
    function showCompletionScreen() {
        // Ensure elements exist
        if (!surveyWrapper || !completionScreen) {
            console.error("Cannot show completion screen: Wrapper or screen element missing.");
            // Maybe redirect immediately as a fallback
            // window.location.href = 'surveys.html';
            return;
        }

        surveyWrapper.innerHTML = ''; // Clear the entire survey wrapper
        surveyWrapper.appendChild(completionScreen); // Add the completion content
        completionScreen.style.display = 'block';

        // Trigger confetti
        if (window.confetti) { // Check if confetti library is loaded
            try {
                confetti({
                    particleCount: 150,
                    spread: 80,
                    origin: { y: 0.6 }
                });
            } catch (e) {
                console.error("Confetti failed:", e);
            }
        }

        // Redirect after a delay
        setTimeout(() => {
            window.location.href = 'surveys.html'; // Redirect as requested
        }, 5000); // 5-second delay
    }


     /** Updates the progress indicator */
    function updateProgress() {
         if (!questionProgress) return; // Check if element exists

         // Using history length is a simple way to track steps taken in a branching survey
         const currentStepIndex = questionHistory.length > 0 ? questionHistory.length : 1; // Start at step 1

         // Estimating total is hard. Let's just show the step number.
         questionProgress.textContent = `Step ${currentStepIndex}`;

         // Or, show the question ID or a snippet:
         // const currentQuestionText = surveyQuestions[currentQuestionId]?.text.substring(0, 30) + "...";
         // questionProgress.textContent = `Step ${currentStepIndex}: ${currentQuestionText}`;
    }


    // --- Event Listeners ---
    // Add checks to ensure elements exist before adding listeners
    if (startButton) {
        startButton.addEventListener('click', startSurvey);
    } else {
        console.error("Start button not found!");
    }

    if (nextButton) {
        nextButton.addEventListener('click', handleNextQuestion);
    } else {
        console.error("Next button not found!");
    }

    if (finalFeedbackInput) {
        finalFeedbackInput.addEventListener('input', updateCharCount); // Update count as user types
    }

    if (skipFeedbackButton) {
        skipFeedbackButton.addEventListener('click', () => {
            if (finalFeedbackInput) finalFeedbackInput.value = ''; // Clear any typed feedback
            submitSurvey(); // Submit without feedback text
        });
    } else {
        console.error("Skip Feedback button not found!");
    }


    if (submitSurveyButton) {
        submitSurveyButton.addEventListener('click', submitSurvey); // Submit with feedback text
    } else {
         console.error("Submit Survey button not found!");
    }

    // Prevent default form submission (we handle it via JS)
    if (surveyForm) {
        surveyForm.addEventListener('submit', (e) => {
            e.preventDefault();
            console.warn("Default form submission prevented.");
            // Fallback: If feedback section is visible, assume final submit button was intended.
            if (feedbackSection && feedbackSection.style.display === 'block') {
                 // Ensure feedback is not too long before submitting via Enter key
                if (finalFeedbackInput && finalFeedbackInput.value.length <= MAX_FEEDBACK_CHARS) {
                    submitSurvey();
                 } else if (finalFeedbackInput) {
                     alert(`Your feedback exceeds the maximum length of ${MAX_FEEDBACK_CHARS} characters. Please shorten it or use the Skip/Submit buttons.`);
                 }
            }
        });
    } else {
        console.error("Survey form element not found!");
    }


    // --- Initialisation ---
    // Disable Next button initially, only if it exists
    if (nextButton) nextButton.disabled = true;


}); // End DOMContentLoaded