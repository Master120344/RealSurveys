document.addEventListener('DOMContentLoaded', () => {
    // --- DOM Elements ---
    const welcomeScreen = document.getElementById('welcome-screen');
    const startButton = document.getElementById('startButton');
    const surveyForm = document.getElementById('bkSurveyForm'); // Make sure ID matches HTML
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

    // --- Survey Configuration & State ---
    const TIME_PER_QUESTION = 10;
    const MAX_FEEDBACK_CHARS = 500;
    let currentQuestionId = null;
    let userAnswers = {};
    let questionHistory = [];
    let timerInterval = null;
    let timeLeft = TIME_PER_QUESTION;
    let surveyStartTime = null;

    // --- Survey Questions Definition (Burger King Focus) ---
    const surveyQuestions = {
        'START': { next: 'Q1_VISIT_FREQUENCY' },
        'Q1_VISIT_FREQUENCY': {
            text: "How often do you typically visit or order from Burger King?",
            type: 'radio', required: true,
            options: [
                { value: 'weekly', label: 'Once a week or more' },
                { value: 'monthly', label: 'A few times a month' },
                { value: 'quarterly', label: 'Every few months' },
                { value: 'rarely', label: 'Rarely (Once or twice a year)' },
                { value: 'never', label: 'Never / First time in a long while' }
            ],
            next: (ans) => ans['Q1_VISIT_FREQUENCY'] === 'never' ? 'Q_NEVER_REASON' : 'Q2_ORDER_METHOD'
        },
        'Q_NEVER_REASON': {
             text: "What's the main reason you don't visit Burger King?",
             type: 'radio', required: true,
             options: [
                 { value: 'prefer_competitor', label: 'Prefer competitors (McDonald\'s, Wendy\'s, etc.)' },
                 { value: 'location', label: 'No convenient locations nearby' },
                 { value: 'food_quality', label: 'Concerns about food quality/taste' },
                 { value: 'service', label: 'Past negative service experiences' },
                 { value: 'healthy_options', label: 'Lack of desired healthy options' },
                 { value: 'other', label: 'Other' }
             ],
             next: 'FEEDBACK' // Go to feedback if they never visit
        },
        'Q2_ORDER_METHOD': {
            text: "How did you place your MOST RECENT order at Burger King?",
            type: 'radio', required: true,
            options: [
                { value: 'dine_in', label: 'Dine-In (Inside the restaurant)' },
                { value: 'drive_thru', label: 'Drive-Thru' },
                { value: 'bk_app_pickup', label: 'BK App / Website for Pick-up' },
                { value: 'bk_app_delivery', label: 'BK App / Website for Delivery' },
                { value: 'third_party_delivery', label: 'Third-Party App (DoorDash, Uber Eats, etc.)' },
                { value: 'takeout_counter', label: 'Take-out (Ordered at counter)'}
            ],
            next: 'Q3_SATISFACTION_OVERALL'
        },
         'Q3_SATISFACTION_OVERALL': {
            text: "Overall, how satisfied were you with your most recent Burger King experience?",
            type: 'rating', required: true,
            options: [
                { value: 5, label: 'Very Satisfied' }, { value: 4, label: 'Satisfied' },
                { value: 3, label: 'Neutral' }, { value: 2, label: 'Dissatisfied' },
                { value: 1, label: 'Very Dissatisfied' }
            ],
            next: (ans) => ans['Q3_SATISFACTION_OVERALL'] <= 2 ? 'Q_DISSATISFACTION_REASON' : 'Q4_FOOD_ITEM'
        },
         'Q_DISSATISFACTION_REASON': {
            text: "What was the main reason for your dissatisfaction?",
            type: 'checkbox', required: true, maxSelection: 2,
            options: [
                { value: 'food_taste_temp', label: 'Food Taste / Temperature' },
                { value: 'order_accuracy', label: 'Order Accuracy' },
                { value: 'service_speed', label: 'Speed of Service' },
                { value: 'staff_friendliness', label: 'Staff Attitude / Friendliness' },
                { value: 'cleanliness', label: 'Restaurant Cleanliness' },
                { value: 'price_value', label: 'Price / Value for Money' },
                { value: 'other', label: 'Other Issue' }
            ],
            next: 'Q4_FOOD_ITEM' // Merge back
        },
        'Q4_FOOD_ITEM': {
            text: "What food items did you order during your most recent visit? (Select all that apply)",
            type: 'checkbox', required: true,
            options: [
                { value: 'whopper', label: 'Whopper / Impossible Whopper' },
                { value: 'other_burger', label: 'Other Burger / Sandwich' },
                { value: 'chicken_sandwich', label: 'Chicken Sandwich (Royal Crispy, etc.)' },
                { value: 'chicken_nuggets_fries', label: 'Chicken Nuggets / Chicken Fries' },
                { value: 'fries_rings', label: 'Fries / Onion Rings' },
                { value: 'breakfast', label: 'Breakfast Item' },
                { value: 'drink', label: 'Drink' },
                { value: 'dessert_shake', label: 'Dessert / Shake' },
                { value: 'value_meal', label: 'Value Meal Item' }
            ],
            next: 'Q5_FOOD_QUALITY'
        },
         'Q5_FOOD_QUALITY': {
            text: "How would you rate the quality (taste, freshness, temperature) of the food you received?",
            type: 'rating', required: true,
            options: [
                { value: 5, label: 'Excellent' }, { value: 4, label: 'Good' }, { value: 3, label: 'Average' },
                { value: 2, label: 'Below Average' }, { value: 1, label: 'Poor' }
            ],
            next: 'Q6_FLAME_GRILLED_PERCEPTION'
        },
         'Q6_FLAME_GRILLED_PERCEPTION': {
            text: "How important is Burger King's 'flame-grilled' cooking method to your decision to eat there?",
            type: 'rating', required: true,
            options: [
                { value: 5, label: 'Very Important (It\'s why I go)' }, { value: 4, label: 'Important' },
                { value: 3, label: 'Neutral (It\'s nice but not essential)' }, { value: 2, label: 'Not very important' },
                { value: 1, label: 'Not at all important' }
            ],
            next: 'Q7_SERVICE_SPEED_ACCURACY'
        },
        'Q7_SERVICE_SPEED_ACCURACY': {
            text: "How satisfied were you with the SPEED and ACCURACY of your order?",
            type: 'rating', required: true,
            options: [
                { value: 5, label: 'Very Satisfied' }, { value: 4, label: 'Satisfied' }, { value: 3, label: 'Neutral' },
                { value: 2, label: 'Dissatisfied' }, { value: 1, label: 'Very Dissatisfied' }
            ],
            next: 'Q8_STAFF_FRIENDLINESS'
        },
        'Q8_STAFF_FRIENDLINESS': {
            text: "How would you rate the friendliness and professionalism of the staff you interacted with?",
             type: 'rating', required: (ans) => ans['Q2_ORDER_METHOD'] !== 'bk_app_delivery' && ans['Q2_ORDER_METHOD'] !== 'third_party_delivery', // Required unless delivery app order
             options: [
                { value: 5, label: 'Very Friendly & Professional' }, { value: 4, label: 'Friendly & Professional' },
                { value: 3, label: 'Neutral / Minimal Interaction' }, { value: 2, label: 'Unfriendly / Unprofessional' },
                { value: 1, label: 'Very Unfriendly / Rude' }, { value: 0, label: 'N/A (No interaction)' }
            ],
            next: 'Q9_RESTAURANT_CLEANLINESS'
        },
         'Q9_RESTAURANT_CLEANLINESS': {
            text: "If you visited the restaurant (dine-in, takeout, drive-thru), how would you rate its cleanliness?",
            type: 'rating', required: (ans) => ans['Q2_ORDER_METHOD'] !== 'bk_app_delivery' && ans['Q2_ORDER_METHOD'] !== 'third_party_delivery', // Required unless delivery app order
            options: [
                { value: 5, label: 'Very Clean' }, { value: 4, label: 'Clean' }, { value: 3, label: 'Average' },
                { value: 2, label: 'Needs Improvement' }, { value: 1, label: 'Dirty' },
                { value: 0, label: 'N/A (Delivery Only / Didn\'t Notice)'}
            ],
            next: 'Q10_VALUE_PERCEPTION'
        },
        'Q10_VALUE_PERCEPTION': {
            text: "Considering the price paid, how would you rate the overall value for money?",
            type: 'rating', required: true,
             options: [
                { value: 5, label: 'Excellent Value' }, { value: 4, label: 'Good Value' }, { value: 3, label: 'Fair Value' },
                { value: 2, label: 'Poor Value' }, { value: 1, label: 'Very Poor Value' }
            ],
            next: 'Q11_RECOMMENDATION'
        },
        'Q11_RECOMMENDATION': {
            text: "How likely are you to recommend Burger King to others based on your recent experience(s)?",
            type: 'rating', required: true,
            options: [
                { value: 5, label: 'Very Likely' }, { value: 4, label: 'Likely' }, { value: 3, label: 'Neutral' },
                { value: 2, label: 'Unlikely' }, { value: 1, label: 'Very Unlikely' }
            ],
            next: 'FEEDBACK'
        },
        'FEEDBACK': { type: 'textarea', next: 'COMPLETE' },
        'COMPLETE': { type: 'completion' }
    };

    // --- Timer Functions --- (Identical to previous examples)
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
    function stopTimer() { clearInterval(timerInterval); timerInterval = null; timerContainer?.classList.remove('low-time'); }
    function updateTimerDisplay() { if (!timerDisplay) return; timerDisplay.textContent = `00:${String(timeLeft).padStart(2, '0')}`; }
    function handleAutoAdvance() { console.log(`Auto-advancing: ${currentQuestionId}`); collectAnswer(currentQuestionId); handleNextQuestion(true); }


    // --- Question Rendering & Navigation --- (Adapting structure, identical logic)
    function renderQuestion(questionId) {
        const question = surveyQuestions[questionId];
        if (!question || question.type === 'textarea' || question.type === 'completion' || !questionContainer) {
            console.error("Invalid question/render state:", questionId); showFeedbackSection(); return;
        }
        stopTimer();
        questionContainer.innerHTML = '';
        const fieldset = document.createElement('fieldset');
        fieldset.id = `q_${questionId}`; fieldset.classList.add('question-card'); fieldset.setAttribute('aria-labelledby', `legend_${questionId}`);
        const legend = document.createElement('legend');
        legend.id = `legend_${questionId}`; legend.innerHTML = question.text; fieldset.appendChild(legend);
        const optionsList = document.createElement('ul');
        optionsList.classList.add('options-list');
        if (question.type === 'radio' || question.type === 'rating') optionsList.setAttribute('role', 'radiogroup');
        else if (question.type === 'checkbox') { optionsList.setAttribute('role', 'group'); if (question.maxSelection) optionsList.setAttribute('aria-describedby', `info_${questionId}`); }

        if (question.options) {
            question.options.forEach((option, index) => {
                const li = document.createElement('li'); const id = `q_${questionId}_opt${index}`;
                const input = document.createElement('input');
                input.type = question.type === 'checkbox' ? 'checkbox' : 'radio';
                input.id = id; input.name = `q_${questionId}`; input.value = option.value;
                const ans = userAnswers[questionId];
                if (ans) { if (input.type === 'radio' && String(ans) === String(option.value)) input.checked = true; else if (input.type === 'checkbox' && Array.isArray(ans) && ans.includes(String(option.value))) input.checked = true; }
                const label = document.createElement('label'); label.htmlFor = id;
                const span = document.createElement('span'); span.textContent = option.label;
                label.appendChild(input); label.appendChild(span);
                input.addEventListener('change', (e) => handleInputChange(questionId, question, e));
                li.appendChild(label); optionsList.appendChild(li);
            });
            fieldset.appendChild(optionsList);
            if (question.type === 'checkbox' && question.maxSelection) { const help = document.createElement('p'); help.id = `info_${questionId}`; help.classList.add('checkbox-help-text'); help.textContent = `(Select up to ${question.maxSelection})`; fieldset.appendChild(help); }
        }
        questionContainer.appendChild(fieldset);
        updateNavigationButtons(); updateProgressBar(); validateCurrentQuestion(); startTimer();
    }

    function handleInputChange(questionId, questionDef, event = null) {
        if (questionDef.type === 'checkbox' && questionDef.maxSelection && event?.target.checked) {
            const checkedCount = questionContainer?.querySelectorAll(`input[name="q_${questionId}"]:checked`)?.length ?? 0;
            if (checkedCount > questionDef.maxSelection) { event.target.checked = false; alert(`Select up to ${questionDef.maxSelection} options.`); return; }
        }
        validateCurrentQuestion();
    }

    function validateCurrentQuestion(isAutoAdvance = false) {
        if (!currentQuestionId || !nextButton) return false;
        const question = surveyQuestions[currentQuestionId]; if (isAutoAdvance) { nextButton.disabled = false; return true; }
        let isRequired = question?.required; if(typeof isRequired === 'function') isRequired = isRequired(userAnswers);
        if (!question || !isRequired) { nextButton.disabled = false; return true; }
        let isValid = false;
        if (questionContainer) {
            if (question.type === 'radio' || question.type === 'rating') isValid = questionContainer.querySelector(`input[name="q_${currentQuestionId}"]:checked`) !== null;
            else if (question.type === 'checkbox') isValid = questionContainer.querySelectorAll(`input[name="q_${currentQuestionId}"]:checked`).length > 0;
            else isValid = true;
        }
        nextButton.disabled = !isValid; return isValid;
    }

    function collectAnswer(questionId) {
        if (!questionId || !questionContainer) return; const question = surveyQuestions[questionId]; if (!question || question.type === 'textarea' || question.type === 'completion') return;
        let answer;
        if (question.type === 'radio' || question.type === 'rating') answer = questionContainer.querySelector(`input[name="q_${questionId}"]:checked`)?.value;
        else if (question.type === 'checkbox') { const ch = Array.from(questionContainer.querySelectorAll(`input[name="q_${questionId}"]:checked`)); answer = ch.length > 0 ? ch.map(cb => cb.value) : undefined; }
        if (answer !== undefined) userAnswers[questionId] = answer; else delete userAnswers[questionId];
    }

    function getNextQuestionId() {
        if (!currentQuestionId) return surveyQuestions['START'].next; const question = surveyQuestions[currentQuestionId]; if (!question || !question.next) return 'FEEDBACK';
        if (typeof question.next === 'string') return question.next; if (typeof question.next === 'function') return question.next(userAnswers);
        if (typeof question.next === 'object') { const ans = userAnswers[currentQuestionId]; if (ans !== undefined && question.next[String(ans)]) return question.next[String(ans)]; else if (question.next['default']) return question.next['default']; }
        return 'FEEDBACK';
    }

    function handleNextQuestion(isAutoAdvance = false) {
        if (!isAutoAdvance && !validateCurrentQuestion()) { console.warn("Validation failed."); questionContainer?.querySelector('.question-card')?.shake?.(); return; }
        if(currentQuestionId !== 'START') collectAnswer(currentQuestionId); stopTimer(); const nextId = getNextQuestionId();
        if(currentQuestionId && currentQuestionId !== 'START') questionHistory.push(currentQuestionId); currentQuestionId = nextId;
        if (currentQuestionId === 'FEEDBACK') showFeedbackSection();
        else if (currentQuestionId === 'COMPLETE') submitSurvey();
        else if (surveyQuestions[currentQuestionId]) renderQuestion(currentQuestionId);
        else { console.error(`Invalid next ID: ${currentQuestionId}`); showFeedbackSection(); }
    }

    function handlePreviousQuestion() { if (questionHistory.length === 0) return; stopTimer(); currentQuestionId = questionHistory.pop(); if (surveyQuestions[currentQuestionId]) renderQuestion(currentQuestionId); else { console.error(`Invalid prev ID: ${currentQuestionId}`); startSurvey(); } }
    function updateNavigationButtons() { if (backButton) backButton.classList.toggle('visible', questionHistory.length > 0); }
    function updateProgressBar() { if (!progressBar) return; const qIds = Object.keys(surveyQuestions).filter(id => !['START', 'FEEDBACK', 'COMPLETE'].includes(id)); const total = qIds.length; let currentIdx = questionHistory.length; if (currentQuestionId && currentQuestionId !== 'START' && !questionHistory.includes(currentQuestionId)) { const qIdx = qIds.indexOf(currentQuestionId); if(qIdx !== -1) currentIdx = qIdx; } const progress = total > 0 ? Math.min((currentIdx / total) * 100, 100) : 0; progressBar.style.width = `${progress}%`; }


    // --- Feedback Section --- (Identical logic)
    function showFeedbackSection() { stopTimer(); if(surveyForm) surveyForm.style.display = 'none'; if(feedbackSection) feedbackSection.style.display = 'block'; if(welcomeScreen) welcomeScreen.style.display = 'none'; if(finalFeedbackInput) { finalFeedbackInput.value = userAnswers['FEEDBACK'] || ''; updateCharCount(); } }
    function updateCharCount() { if (!finalFeedbackInput || !charCountDisplay) return; const len = finalFeedbackInput.value.length; charCountDisplay.textContent = `${len} / ${MAX_FEEDBACK_CHARS} chars`; const isOver = len > MAX_FEEDBACK_CHARS; charCountDisplay.classList.toggle('limit-exceeded', isOver); if(submitSurveyButton) submitSurveyButton.disabled = isOver; }


    // --- Survey Start & Completion --- (Identical logic, updated console logs/reward)
    function startSurvey() { console.log("Starting BK survey..."); surveyStartTime = new Date(); userAnswers = {}; questionHistory = []; currentQuestionId = 'START'; if (welcomeScreen) welcomeScreen.style.display = 'none'; if (surveyForm) surveyForm.style.display = 'block'; if (feedbackSection) feedbackSection.style.display = 'none'; if (completionScreen) completionScreen.style.display = 'none'; handleNextQuestion(); }
    function submitSurvey() {
        stopTimer(); console.log("Submitting BK survey...");
        if (finalFeedbackInput && feedbackSection?.style.display === 'block') { userAnswers['FEEDBACK'] = finalFeedbackInput.value.trim(); if (userAnswers['FEEDBACK'].length > MAX_FEEDBACK_CHARS) { alert(`Feedback > ${MAX_FEEDBACK_CHARS} chars.`); return; } }
        const endTime = new Date(); const duration = Math.round(((endTime - surveyStartTime) || 0) / 1000); userAnswers['meta'] = { start: surveyStartTime?.toISOString(), end: endTime.toISOString(), durationS: duration, ua: navigator.userAgent };
        console.log("---- BK SURVEY RESULTS ----"); console.log(JSON.stringify(userAnswers, null, 2));
        console.log("---- SIMULATING BACKEND ----");
        const email = "bk_fan_" + Math.random().toString(36).substring(2, 8) + "@realsurveys-example.com"; console.log(`User: ${email}`); const reward = 0.65; console.log(`Updating balance: +$${reward.toFixed(2)}...`);
        setTimeout(() => { console.log(`Balance update OK.`); if (completionMessage) completionMessage.textContent = `Reward $${reward.toFixed(2)} processed for ${email}.`; }, 1100);
        if (surveyForm) surveyForm.style.display = 'none'; if (feedbackSection) feedbackSection.style.display = 'none'; if (completionScreen) completionScreen.style.display = 'block';
        if (window.confetti) confetti({ particleCount: 130, spread: 75, origin: { y: 0.6 } });
        setTimeout(() => { console.log("Redirecting..."); window.location.href = 'surveys.html'; }, 6000);
    }

    // --- Event Listeners & Init --- (Identical logic)
    if (startButton) startButton.addEventListener('click', startSurvey); else console.error("Start Button missing");
    if (nextButton) nextButton.addEventListener('click', () => handleNextQuestion(false)); else console.error("Next Button missing");
    if (backButton) backButton.addEventListener('click', handlePreviousQuestion); else console.error("Back Button missing");
    if (finalFeedbackInput) finalFeedbackInput.addEventListener('input', updateCharCount);
    if (skipFeedbackButton) skipFeedbackButton.addEventListener('click', () => { userAnswers['FEEDBACK'] = 'skipped'; submitSurvey(); }); else console.error("Skip Button missing");
    if (submitSurveyButton) submitSurveyButton.addEventListener('click', submitSurvey); else console.error("Submit Button missing");
    if (surveyForm) surveyForm.addEventListener('submit', (e) => e.preventDefault());
    if(surveyForm) surveyForm.style.display = 'none'; if(feedbackSection) feedbackSection.style.display = 'none'; if(completionScreen) completionScreen.style.display = 'none'; if(backButton) backButton.classList.remove('visible');
    console.log("BK Survey Initialized.");

}); // End DOMContentLoaded

// Optional Shake Helper (Identical)
Element.prototype.shake = function() { this.style.animation = 'shake 0.3s ease-in-out'; setTimeout(() => this.style.animation = '', 300); };
try { const sheet = document.styleSheets[0]; sheet.insertRule(`@keyframes shake { 0%, 100% { transform: translateX(0); } 25% { transform: translateX(-3px); } 75% { transform: translateX(3px); } }`, sheet.cssRules.length); } catch (e) { console.warn("Shake animation insert failed:", e); }