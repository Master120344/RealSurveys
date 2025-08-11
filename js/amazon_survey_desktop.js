document.addEventListener('DOMContentLoaded', () => {
    // --- DOM Elements ---
    const surveyContainer = document.querySelector('.survey-container');
    const welcomeScreen = document.getElementById('welcome-screen');
    const startButton = document.getElementById('startButton');
    const surveyForm = document.getElementById('amazonSurveyForm');
    const questionContainer = document.getElementById('question-container');
    const backButton = document.getElementById('backButton');
    const nextButton = document.getElementById('nextButton');
    const surveyNavigation = document.getElementById('survey-navigation');
    const timerDisplay = document.getElementById('timeLeft');
    const timerContainer = document.getElementById('timer'); // Timer text container
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
    let currentQuestionId = null;
    let userAnswers = {};
    let questionHistory = [];
    let timerInterval = null;
    let timeLeft = TIME_PER_QUESTION;
    let surveyStartTime = null;


    // --- Survey Questions Definition ---
    const surveyQuestions = {
        'START': {
            next: 'Q1_FREQUENCY'
        },
        'Q1_FREQUENCY': {
            text: "How often do you typically shop on Amazon?",
            type: 'radio',
            required: true,
            options: [
                { value: 'daily', label: 'Almost daily' },
                { value: 'weekly', label: 'A few times a week' },
                { value: 'monthly', label: 'A few times a month' },
                { value: 'quarterly', label: 'Every few months' },
                { value: 'rarely', label: 'Rarely / Never' }
            ],
             next: (answers) => answers['Q1_FREQUENCY'] === 'rarely' ? 'Q_RARELY_REASON' : 'Q2_PRIME_MEMBER'
        },
        'Q_RARELY_REASON': {
            text: "What is the primary reason you rarely or never shop on Amazon?",
            type: 'radio',
            required: true,
            options: [
                { value: 'prefer_local', label: 'Prefer shopping locally or at other physical stores' },
                { value: 'prefer_other_online', label: 'Prefer other online retailers' },
                { value: 'price', label: 'Prices are not competitive enough' },
                { value: 'ethical_concerns', label: 'Ethical concerns about the company' },
                { value: 'delivery_issues', label: 'Past issues with delivery or returns' },
                { value: 'no_need', label: 'Don\'t typically need items sold on Amazon' },
                { value: 'other', label: 'Other' }
            ],
            next: 'FEEDBACK' // Go to feedback if they rarely shop
        },
        'Q2_PRIME_MEMBER': {
            text: "Are you currently an Amazon Prime member?",
            type: 'radio',
            required: true,
            options: [
                { value: 'yes', label: 'Yes' },
                { value: 'no', label: 'No' },
                { value: 'trial', label: 'Yes, on a free trial' },
                { value: 'unsure', label: 'Not sure / Used to be' }
            ],
             next: (answers) => answers['Q2_PRIME_MEMBER'] === 'no' ? 'Q_NO_PRIME_REASON' : 'Q3_PRIME_SATISFACTION'
        },
        'Q_NO_PRIME_REASON': {
            text: "What's the main reason you are not an Amazon Prime member?",
            type: 'radio',
            required: true,
            options: [
                { value: 'cost', label: 'The cost is too high' },
                { value: 'no_value', label: 'I don\'t see enough value in the benefits' },
                { value: 'dont_shop_enough', label: 'I don\'t shop often enough on Amazon' },
                { value: 'use_other_services', label: 'I use competing services (streaming, etc.)' },
                { value: 'other', label: 'Other' }
            ],
            next: 'Q4_RECENT_PURCHASE' // Merge back after asking non-prime reason
        },
         'Q3_PRIME_SATISFACTION': {
            text: "How satisfied are you with the value and benefits of your Amazon Prime membership?",
            type: 'rating',
            required: true,
            options: [
                { value: 5, label: 'Very Satisfied' },
                { value: 4, label: 'Satisfied' },
                { value: 3, label: 'Neutral' },
                { value: 2, label: 'Dissatisfied' },
                { value: 1, label: 'Very Dissatisfied' }
            ],
            next: 'Q4_RECENT_PURCHASE'
        },
        'Q4_RECENT_PURCHASE': {
            text: "Thinking about your most recent Amazon purchase, how satisfied were you with the overall experience (finding the item, ordering, price)?",
            type: 'rating',
            required: true,
            options: [
                { value: 5, label: 'Very Satisfied' },
                { value: 4, label: 'Satisfied' },
                { value: 3, label: 'Neutral' },
                { value: 2, label: 'Dissatisfied' },
                { value: 1, label: 'Very Dissatisfied' }
            ],
            next: 'Q5_DELIVERY_SPEED'
        },
         'Q5_DELIVERY_SPEED': {
            text: "How satisfied were you with the delivery speed of your most recent order?",
            type: 'rating',
            required: true,
            options: [
                { value: 5, label: 'Very Satisfied (Faster than expected)' },
                { value: 4, label: 'Satisfied (As expected)' },
                { value: 3, label: 'Neutral' },
                { value: 2, label: 'Dissatisfied (Slower than expected)' },
                { value: 1, label: 'Very Dissatisfied (Very slow)' },
                { value: 0, label: 'N/A (Digital purchase / Picked up)'}
            ],
             next: 'Q6_DELIVERY_CONDITION'
        },
        'Q6_DELIVERY_CONDITION': {
            text: "In what condition did your most recent package arrive?",
             type: 'radio',
             required: (answers) => answers['Q5_DELIVERY_SPEED'] !== '0', // Only required if physical delivery
             options: [
                { value: 'perfect', label: 'Perfect condition' },
                { value: 'minor_damage_pkg', label: 'Minor damage to packaging, item okay' },
                { value: 'major_damage_pkg', label: 'Significant damage to packaging, item okay' },
                { value: 'damaged_item', label: 'Item was damaged' },
                 { value: 'na', label: 'N/A (Digital purchase / Picked up)'}
            ],
             next: (answers) => answers['Q6_DELIVERY_CONDITION'] === 'damaged_item' ? 'Q_DAMAGE_FOLLOWUP' : 'Q7_RETURNS_EXPERIENCE'
        },
         'Q_DAMAGE_FOLLOWUP': {
            text: "How easy was it to resolve the issue with the damaged item (e.g., get a return, refund, replacement)?",
             type: 'rating',
             required: true,
             options: [
                { value: 5, label: 'Very Easy' },
                { value: 4, label: 'Easy' },
                { value: 3, label: 'Neutral / Haven\'t tried yet' },
                { value: 2, label: 'Difficult' },
                { value: 1, label: 'Very Difficult' }
            ],
             next: 'Q7_RETURNS_EXPERIENCE'
        },
         'Q7_RETURNS_EXPERIENCE': {
            text: "Have you returned an item to Amazon in the past 6 months? If so, how was the experience?",
            type: 'radio',
            required: true,
            options: [
                { value: 'yes_easy', label: 'Yes, it was easy' },
                { value: 'yes_neutral', label: 'Yes, it was acceptable' },
                { value: 'yes_difficult', label: 'Yes, it was difficult' },
                { value: 'no', label: 'No, I haven\'t returned anything recently' }
            ],
             next: 'Q8_PRODUCT_CATEGORIES'
        },
        'Q8_PRODUCT_CATEGORIES': {
            text: "Which product categories do you most frequently purchase from on Amazon? (Select up to 3)",
            type: 'checkbox',
            required: true,
            maxSelection: 3,
            options: [
                { value: 'electronics', label: 'Electronics & Computers' },
                { value: 'home_kitchen', label: 'Home, Kitchen & Garden' },
                { value: 'books_media', label: 'Books, Music, Movies & Games' },
                { value: 'clothing_shoes', label: 'Clothing, Shoes & Jewelry' },
                { value: 'beauty_health', label: 'Beauty, Health & Personal Care' },
                { value: 'grocery', label: 'Grocery & Gourmet Food' },
                { value: 'toys_kids', label: 'Toys, Kids & Baby' },
                { value: 'automotive_tools', label: 'Automotive & Tools' },
                { value: 'other', label: 'Other' }
            ],
             next: 'Q9_THIRD_PARTY'
        },
         'Q9_THIRD_PARTY': {
            text: "When shopping on Amazon, how often do you consciously check if an item is sold by Amazon directly versus a third-party seller?",
            type: 'radio',
            required: true,
            options: [
                { value: 'always', label: 'Always / Most of the time' },
                { value: 'sometimes', label: 'Sometimes' },
                { value: 'rarely', label: 'Rarely / Never' },
                { value: 'unsure', label: 'I\'m not sure what the difference is' }
            ],
             next: 'Q10_AMAZON_DEVICES'
        },
        'Q10_AMAZON_DEVICES': {
            text: "Do you own any Amazon devices like Echo (Alexa), Fire TV, Kindle, Ring, etc.?",
            type: 'radio',
            required: true,
            options: [
                 { value: 'yes_multiple', label: 'Yes, multiple types' },
                 { value: 'yes_one', label: 'Yes, one type' },
                 { value: 'no', label: 'No' }
            ],
            next: (answers) => answers['Q10_AMAZON_DEVICES'] === 'no' ? 'Q11_RECOMMENDATION' : 'Q_DEVICE_SATISFACTION'
        },
         'Q_DEVICE_SATISFACTION': {
             text: "How satisfied are you with your Amazon device(s)?",
             type: 'rating',
             required: true,
             options: [
                { value: 5, label: 'Very Satisfied' },
                { value: 4, label: 'Satisfied' },
                { value: 3, label: 'Neutral' },
                { value: 2, label: 'Dissatisfied' },
                { value: 1, label: 'Very Dissatisfied' }
            ],
            next: 'Q11_RECOMMENDATION'
         },
         'Q11_RECOMMENDATION': {
            text: "Overall, how likely are you to recommend shopping on Amazon to a friend or colleague?",
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


    // --- Timer Functions ---
    function startTimer() {
        stopTimer();
        timeLeft = TIME_PER_QUESTION;
        updateTimerDisplay();
        timerContainer?.classList.remove('low-time');

        timerInterval = setInterval(() => {
            timeLeft--;
            updateTimerDisplay();
            if (timeLeft <= 3 && timerContainer) {
                timerContainer.classList.add('low-time');
            }
            if (timeLeft <= 0) {
                stopTimer();
                handleAutoAdvance();
            }
        }, 1000);
    }

    function stopTimer() {
        clearInterval(timerInterval);
        timerInterval = null;
        timerContainer?.classList.remove('low-time');
    }

    function updateTimerDisplay() {
        if (!timerDisplay) return;
        const seconds = String(timeLeft).padStart(2, '0');
        timerDisplay.textContent = `00:${seconds}`;
    }

    function handleAutoAdvance() {
        console.log(`Auto-advancing from question: ${currentQuestionId}`);
        collectAnswer(currentQuestionId);
        handleNextQuestion(true); // Pass flag indicating auto-advance
    }

    // --- Question Rendering & Navigation ---
    function renderQuestion(questionId) {
        const question = surveyQuestions[questionId];
        if (!question || question.type === 'textarea' || question.type === 'completion' || !questionContainer) {
            console.error("Invalid question ID or type for rendering:", questionId);
            showFeedbackSection(); // Fallback
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

                const previousAnswer = userAnswers[questionId];
                if (previousAnswer) {
                     if (input.type === 'radio' && String(previousAnswer) === String(option.value)) input.checked = true;
                     else if (input.type === 'checkbox' && Array.isArray(previousAnswer) && previousAnswer.includes(String(option.value))) input.checked = true;
                 }

                const label = document.createElement('label');
                label.htmlFor = inputId;
                const labelText = document.createElement('span'); // Put text in span for easier styling if needed
                labelText.textContent = option.label;
                label.appendChild(input);
                label.appendChild(labelText);

                 input.addEventListener('change', (event) => handleInputChange(questionId, question, event));

                listItem.appendChild(label);
                optionsList.appendChild(listItem);
            });
            fieldset.appendChild(optionsList);

            if (question.type === 'checkbox' && question.maxSelection) {
                 const helpText = document.createElement('p');
                 helpText.id = `info_${questionId}`;
                 helpText.classList.add('checkbox-help-text');
                 helpText.textContent = `(Select up to ${question.maxSelection})`;
                 fieldset.appendChild(helpText);
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
            const checkedBoxes = questionContainer?.querySelectorAll(`input[name="q_${questionId}"]:checked`);
            if (checkedBoxes && checkedBoxes.length > questionDef.maxSelection) {
                 event.target.checked = false;
                 alert(`You can select a maximum of ${questionDef.maxSelection} options.`);
                 return;
             }
         }
         validateCurrentQuestion();
     }

    function validateCurrentQuestion(isAutoAdvance = false) {
        if (!currentQuestionId || !nextButton) return false;

        const question = surveyQuestions[currentQuestionId];
        // If auto-advancing, skip validation unless we explicitly want to force an answer
        if (isAutoAdvance) {
            nextButton.disabled = false;
            return true;
        }
        // Conditional requirement check
        let isRequired = question?.required;
        if(typeof isRequired === 'function') {
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
            } else { isValid = true; } // Assume valid for other types if required
        }

        nextButton.disabled = !isValid;
        return isValid;
    }


    function collectAnswer(questionId) {
        if (!questionId || !questionContainer) return;
        const question = surveyQuestions[questionId];
        if (!question || question.type === 'textarea' || question.type === 'completion') return;

        let answer;
        if (question.type === 'radio' || question.type === 'rating') {
            const selected = questionContainer.querySelector(`input[name="q_${questionId}"]:checked`);
            answer = selected ? selected.value : undefined;
        } else if (question.type === 'checkbox') {
            const checked = Array.from(questionContainer.querySelectorAll(`input[name="q_${questionId}"]:checked`));
            answer = checked.length > 0 ? checked.map(cb => cb.value) : undefined;
        }

        if (answer !== undefined) {
             userAnswers[questionId] = answer;
        } else {
             delete userAnswers[questionId]; // Remove if unanswered/cleared
        }
    }


    function getNextQuestionId() {
        if (!currentQuestionId) return surveyQuestions['START'].next;

        const question = surveyQuestions[currentQuestionId];
        if (!question || !question.next) return 'FEEDBACK';

        if (typeof question.next === 'string') return question.next;
        if (typeof question.next === 'function') return question.next(userAnswers);
        if (typeof question.next === 'object') {
            const answer = userAnswers[currentQuestionId];
             if (answer !== undefined && question.next[String(answer)]) return question.next[String(answer)];
             else if (question.next['default']) return question.next['default'];
        }

        console.warn("Could not determine next question from:", currentQuestionId);
        return 'FEEDBACK'; // Fallback
    }


    function handleNextQuestion(isAutoAdvance = false) {
        if (!isAutoAdvance && !validateCurrentQuestion()) {
            console.warn("Validation failed.");
            // Add visual feedback for validation error?
            const card = questionContainer?.querySelector('.question-card');
            if(card) {
                card.style.animation = 'shake 0.3s ease-in-out';
                setTimeout(() => card.style.animation = '', 300);
            }
            return;
        }

        if(currentQuestionId !== 'START') collectAnswer(currentQuestionId);
        stopTimer();

        const nextId = getNextQuestionId();

        if(currentQuestionId && currentQuestionId !== 'START') questionHistory.push(currentQuestionId);

        currentQuestionId = nextId;

        if (currentQuestionId === 'FEEDBACK') showFeedbackSection();
        else if (currentQuestionId === 'COMPLETE') submitSurvey(); // Should be called after feedback handled
        else if (surveyQuestions[currentQuestionId]) renderQuestion(currentQuestionId);
        else {
            console.error(`Next question ID "${currentQuestionId}" is invalid.`);
            showFeedbackSection();
        }
    }

    function handlePreviousQuestion() {
        if (questionHistory.length === 0) return;
        stopTimer();

        currentQuestionId = questionHistory.pop();

        if (surveyQuestions[currentQuestionId]) {
            renderQuestion(currentQuestionId);
        } else {
             console.error(`Previous question ID "${currentQuestionId}" invalid.`);
             startSurvey(); // Fallback to start
        }
    }


    function updateNavigationButtons() {
         if (backButton) {
             if (questionHistory.length > 0) backButton.classList.add('visible');
             else backButton.classList.remove('visible');
         }
    }

    function updateProgressBar() {
         if (!progressBar) return;
         const questionIds = Object.keys(surveyQuestions).filter(id => !['START', 'FEEDBACK', 'COMPLETE'].includes(id));
         const totalQuestions = questionIds.length;
         // Find index based on history OR current ID if history is empty
         let currentIndex = questionHistory.length;
          if (currentQuestionId && currentQuestionId !== 'START' && !questionHistory.includes(currentQuestionId)) {
              // Attempt to find index of current question if not in history yet
              const qIndex = questionIds.indexOf(currentQuestionId);
              if (qIndex !== -1) currentIndex = qIndex; // Use actual index if possible
              else currentIndex = questionHistory.length; // Fallback if not found
          }

         let progress = totalQuestions > 0 ? ((currentIndex / totalQuestions) * 100) : 0;
         progress = Math.min(progress, 100);
         progressBar.style.width = `${progress}%`;
     }


    // --- Feedback Section ---
    function showFeedbackSection() {
        stopTimer();
        if(surveyForm) surveyForm.style.display = 'none';
        if(feedbackSection) feedbackSection.style.display = 'block';
        if(welcomeScreen) welcomeScreen.style.display = 'none';

        if(finalFeedbackInput) {
             finalFeedbackInput.value = userAnswers['FEEDBACK'] || '';
             updateCharCount();
         }
    }

    function updateCharCount() {
        if (!finalFeedbackInput || !charCountDisplay) return;
        const currentLength = finalFeedbackInput.value.length;
        charCountDisplay.textContent = `${currentLength} / ${MAX_FEEDBACK_CHARS} characters`;
        const isOverLimit = currentLength > MAX_FEEDBACK_CHARS;
        charCountDisplay.classList.toggle('limit-exceeded', isOverLimit);
        if(submitSurveyButton) submitSurveyButton.disabled = isOverLimit;
    }


    // --- Survey Start & Completion ---
    function startSurvey() {
         console.log("Starting Amazon survey...");
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
         stopTimer();
         console.log("Submitting Amazon survey...");

         if (finalFeedbackInput && feedbackSection?.style.display === 'block') {
             userAnswers['FEEDBACK'] = finalFeedbackInput.value.trim();
             if (userAnswers['FEEDBACK'].length > MAX_FEEDBACK_CHARS) {
                 alert(`Feedback is too long (max ${MAX_FEEDBACK_CHARS} chars).`);
                 return;
             }
         }

         const surveyEndTime = new Date();
         const surveyDuration = Math.round((surveyEndTime - surveyStartTime) / 1000);
         userAnswers['surveyMetaData'] = { startTime: surveyStartTime?.toISOString(), endTime: surveyEndTime.toISOString(), durationSeconds: surveyDuration, userAgent: navigator.userAgent };

         console.log("---- AMAZON SURVEY RESULTS ----");
         console.log(JSON.stringify(userAnswers, null, 2));
         console.log("---- SIMULATING BACKEND UPDATE ----");

         const userEmail = "customer_" + Math.random().toString(36).substring(2, 9) + "@realsurveys-example.com";
         console.log(`Identified user: ${userEmail}`);
         const rewardAmount = 0.75; // Example reward
         console.log(`Attempting to update balance for ${userEmail} by $${rewardAmount.toFixed(2)}...`);

         setTimeout(() => {
             console.log(`Balance update successful (simulated).`);
             if (completionMessage) completionMessage.textContent = `Reward of $${rewardAmount.toFixed(2)} processed for ${userEmail}.`;
         }, 1200);

         if (surveyForm) surveyForm.style.display = 'none';
         if (feedbackSection) feedbackSection.style.display = 'none';
         if (completionScreen) completionScreen.style.display = 'block';

        if (window.confetti) {
            confetti({ particleCount: 120, spread: 70, origin: { y: 0.6 } });
        }

         setTimeout(() => {
             console.log("Redirecting to surveys.html...");
             window.location.href = 'surveys.html';
         }, 6000);
    }


    // --- Event Listeners ---
     if (startButton) startButton.addEventListener('click', startSurvey);
     else console.error("Start Button not found");

     if (nextButton) nextButton.addEventListener('click', () => handleNextQuestion(false)); // Ensure normal validation on click
     else console.error("Next Button not found");

     if (backButton) backButton.addEventListener('click', handlePreviousQuestion);
     else console.error("Back Button not found");

     if (finalFeedbackInput) finalFeedbackInput.addEventListener('input', updateCharCount);

     if (skipFeedbackButton) skipFeedbackButton.addEventListener('click', () => {
            userAnswers['FEEDBACK'] = 'skipped';
            submitSurvey();
        });
     else console.error("Skip Feedback Button not found");

     if (submitSurveyButton) submitSurveyButton.addEventListener('click', submitSurvey);
     else console.error("Submit Survey Button not found");

     if (surveyForm) surveyForm.addEventListener('submit', (e) => e.preventDefault());


    // --- Initial Setup ---
    if(surveyForm) surveyForm.style.display = 'none';
    if(feedbackSection) feedbackSection.style.display = 'none';
    if(completionScreen) completionScreen.style.display = 'none';
    if(backButton) backButton.classList.remove('visible');

    console.log("Amazon Survey Initialized.");

}); // End DOMContentLoaded

// Helper function for visual feedback (optional)
Element.prototype.shake = function() {
    this.style.animation = 'shake 0.3s ease-in-out';
    setTimeout(() => this.style.animation = '', 300);
};

// Add CSS keyframes for shake if using the helper
const styleSheet = document.styleSheets[0]; // Or find the correct one
try {
 styleSheet.insertRule(`
    @keyframes shake {
      0%, 100% { transform: translateX(0); }
      25% { transform: translateX(-3px); }
      75% { transform: translateX(3px); }
    }
  `, styleSheet.cssRules.length);
} catch (e) {
    console.warn("Could not insert shake animation:", e);
}