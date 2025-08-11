document.addEventListener('DOMContentLoaded', () => {
    // --- DOM Elements ---
    const welcomeScreen = document.getElementById('welcome-screen');
    const startButton = document.getElementById('startButton');
    const surveyForm = document.getElementById('bestbuySurveyForm');
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

    // --- Config & State --- (Identical setup)
    const TIME_PER_QUESTION = 10; const MAX_FEEDBACK_CHARS = 500;
    let currentQuestionId = null; let userAnswers = {}; let questionHistory = [];
    let timerInterval = null; let timeLeft = TIME_PER_QUESTION; let surveyStartTime = null;

    // --- Survey Questions (Best Buy Focus) ---
    const surveyQuestions = {
        'START': { next: 'Q1_VISIT_TYPE' },
        'Q1_VISIT_TYPE': {
            text: "Thinking about your most recent interaction with Best Buy, was it primarily online or in a physical store?",
            type: 'radio', required: true,
            options: [
                { value: 'online', label: 'Online (Website / App)' },
                { value: 'instore', label: 'In-Store' },
                { value: 'both', label: 'Both Online and In-Store' },
                { value: 'phone', label: 'Over the Phone / Chat Support' },
                { value: 'none_recently', label: 'Haven\'t interacted recently' }
            ],
            next: (ans) => ans['Q1_VISIT_TYPE'] === 'none_recently' ? 'FEEDBACK' : (ans['Q1_VISIT_TYPE'] === 'instore' || ans['Q1_VISIT_TYPE'] === 'both' ? 'Q2A_INSTORE_PURPOSE' : 'Q2B_ONLINE_PURPOSE')
        },
        // --- In-Store Path ---
        'Q2A_INSTORE_PURPOSE': {
            text: "What was the main purpose of your recent IN-STORE visit?",
            type: 'radio', required: true,
            options: [
                { value: 'browse', label: 'Browsing / Researching products' },
                { value: 'purchase', label: 'Making a specific purchase' },
                { value: 'pickup', label: 'Picking up an online order' },
                { value: 'return_exchange', label: 'Returning or exchanging an item' },
                { value: 'geek_squad', label: 'Geek Squad service / consultation' },
                { value: 'other', label: 'Other' }
            ],
            next: 'Q3A_INSTORE_ASSISTANCE'
        },
        'Q3A_INSTORE_ASSISTANCE': {
            text: "Did you interact with a Best Buy employee (Blue Shirt or Geek Squad) during your visit?",
            type: 'radio', required: true,
            options: [ { value: 'yes', label: 'Yes' }, { value: 'no', label: 'No' } ],
            next: (ans) => ans['Q3A_INSTORE_ASSISTANCE'] === 'yes' ? 'Q4A_STAFF_HELPFULNESS' : 'Q5A_INSTORE_CHECKOUT' // Skip staff rating if no interaction
        },
        'Q4A_STAFF_HELPFULNESS': {
            text: "How helpful and knowledgeable was the employee you interacted with?",
            type: 'rating', required: true,
            options: [
                { value: 5, label: 'Very Helpful & Knowledgeable' }, { value: 4, label: 'Helpful & Knowledgeable' },
                { value: 3, label: 'Neutral / Average' }, { value: 2, label: 'Not Very Helpful / Knowledgeable' },
                { value: 1, label: 'Not at all Helpful / Knowledgeable' }, {value: 0, label: 'N/A - Minimal Interaction'}
            ],
            next: 'Q5A_INSTORE_CHECKOUT'
        },
        'Q5A_INSTORE_CHECKOUT': {
            text: "If you made a purchase or return, how satisfied were you with the checkout/customer service process?",
             type: 'rating', required: (ans) => ['purchase', 'return_exchange'].includes(ans['Q2A_INSTORE_PURPOSE']), // Required if purpose was purchase/return
             options: [
                { value: 5, label: 'Very Satisfied' }, { value: 4, label: 'Satisfied' }, { value: 3, label: 'Neutral' },
                { value: 2, label: 'Dissatisfied' }, { value: 1, label: 'Very Dissatisfied' }, {value: 0, label: 'N/A - Did not check out'}
            ],
             next: 'Q6_GEEK_SQUAD_USE' // Merge point
        },
        // --- Online Path ---
        'Q2B_ONLINE_PURPOSE': {
            text: "What was the main purpose of your recent ONLINE interaction (Website/App)?",
            type: 'radio', required: true,
            options: [
                { value: 'browse_research', label: 'Browsing products / Researching' },
                { value: 'purchase_delivery', label: 'Making a purchase for delivery' },
                { value: 'purchase_pickup', label: 'Making a purchase for in-store pickup' },
                { value: 'check_order', label: 'Checking order status / Managing account' },
                { value: 'support', label: 'Seeking customer support / Geek Squad help' },
                { value: 'other', label: 'Other' }
            ],
            next: 'Q3B_ONLINE_EASE'
        },
        'Q3B_ONLINE_EASE': {
            text: "How easy was it to find what you were looking for or accomplish your task on the Best Buy website/app?",
            type: 'rating', required: true,
            options: [
                { value: 5, label: 'Very Easy' }, { value: 4, label: 'Easy' }, { value: 3, label: 'Neutral' },
                { value: 2, label: 'Difficult' }, { value: 1, label: 'Very Difficult' }
            ],
            next: 'Q4B_ONLINE_CHECKOUT'
        },
         'Q4B_ONLINE_CHECKOUT': {
            text: "If you made a purchase, how satisfied were you with the online checkout process?",
            type: 'rating', required: (ans) => ['purchase_delivery', 'purchase_pickup'].includes(ans['Q2B_ONLINE_PURPOSE']),
            options: [
                { value: 5, label: 'Very Satisfied' }, { value: 4, label: 'Satisfied' }, { value: 3, label: 'Neutral' },
                { value: 2, label: 'Dissatisfied' }, { value: 1, label: 'Very Dissatisfied' }, {value: 0, label: 'N/A - Did not purchase'}
            ],
             next: 'Q6_GEEK_SQUAD_USE' // Merge point
        },
        // --- Merged Path ---
        'Q6_GEEK_SQUAD_USE': {
            text: "Have you used Geek Squad services (in-store, online, or in-home) in the past year?",
            type: 'radio', required: true,
            options: [ { value: 'yes', label: 'Yes' }, { value: 'no', label: 'No' } ],
            next: (ans) => ans['Q6_GEEK_SQUAD_USE'] === 'yes' ? 'Q7_GEEK_SQUAD_SATISFACTION' : 'Q8_TOTALTECH_MEMBER'
        },
        'Q7_GEEK_SQUAD_SATISFACTION': {
            text: "How satisfied were you with your recent Geek Squad service experience?",
            type: 'rating', required: true,
            options: [
                { value: 5, label: 'Very Satisfied' }, { value: 4, label: 'Satisfied' }, { value: 3, label: 'Neutral' },
                { value: 2, label: 'Dissatisfied' }, { value: 1, label: 'Very Dissatisfied' }
            ],
            next: 'Q8_TOTALTECH_MEMBER'
        },
        'Q8_TOTALTECH_MEMBER': {
             text: "Are you currently a Best Buy Totaltech™ or My Best Buy Plus™/Total™ member?",
             type: 'radio', required: true,
             options: [
                { value: 'yes_totaltech', label: 'Yes, legacy Totaltech' }, // May phase out
                { value: 'yes_plus', label: 'Yes, My Best Buy Plus™' },
                { value: 'yes_total', label: 'Yes, My Best Buy Total™' },
                { value: 'no', label: 'No' },
                { value: 'unsure', label: 'Not sure' }
            ],
            next: (ans) => ['yes_totaltech', 'yes_plus', 'yes_total'].includes(ans['Q8_TOTALTECH_MEMBER']) ? 'Q9_MEMBERSHIP_VALUE' : 'Q10_PRODUCT_CATEGORY'
        },
        'Q9_MEMBERSHIP_VALUE': {
            text: "How satisfied are you with the value and benefits of your Best Buy membership?",
            type: 'rating', required: true,
             options: [
                { value: 5, label: 'Very Satisfied' }, { value: 4, label: 'Satisfied' }, { value: 3, label: 'Neutral' },
                { value: 2, label: 'Dissatisfied' }, { value: 1, label: 'Very Dissatisfied' }
            ],
             next: 'Q10_PRODUCT_CATEGORY'
        },
        'Q10_PRODUCT_CATEGORY': {
             text: "Which types of products do you most often consider purchasing from Best Buy? (Select up to 3)",
             type: 'checkbox', required: true, maxSelection: 3,
             options: [
                { value: 'computers', label: 'Computers & Tablets' }, { value: 'tv_home_theater', label: 'TV & Home Theater' },
                { value: 'cell_phones', label: 'Cell Phones' }, { value: 'audio', label: 'Audio (Headphones, Speakers)' },
                { value: 'gaming', label: 'Video Games, Consoles & VR' }, { value: 'appliances', label: 'Major Appliances' },
                { value: 'small_appliances', label: 'Small Appliances' }, { value: 'smart_home', label: 'Smart Home, Security & Wi-Fi' },
                { value: 'wearables', label: 'Wearable Technology' }, { value: 'cameras', label: 'Cameras & Camcorders' },
                { value: 'other', label: 'Other'}
            ],
             next: 'Q11_PRICE_COMPETITIVENESS'
        },
        'Q11_PRICE_COMPETITIVENESS': {
            text: "How do you perceive Best Buy's prices compared to other retailers (like Amazon, Walmart, Target, etc.)?",
            type: 'radio', required: true,
            options: [
                { value: 'higher', label: 'Generally Higher' }, { value: 'similar', label: 'Generally Similar' },
                { value: 'lower', label: 'Generally Lower' }, { value: 'varies', label: 'Varies Greatly by Product' },
                { value: 'unsure', label: 'Not Sure / Don\'t Compare Often' }
            ],
            next: 'Q12_RECOMMENDATION'
        },
        'Q12_RECOMMENDATION': {
            text: "How likely are you to recommend Best Buy to a friend or family member looking for electronics or appliances?",
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

    // --- Timer Functions --- (Standard Implementation)
    function startTimer() { stopTimer(); timeLeft = TIME_PER_QUESTION; updateTimerDisplay(); timerContainer?.classList.remove('low-time'); timerInterval = setInterval(() => { timeLeft--; updateTimerDisplay(); if (timeLeft <= 3 && timerContainer) timerContainer.classList.add('low-time'); if (timeLeft <= 0) { stopTimer(); handleAutoAdvance(); } }, 1000); }
    function stopTimer() { clearInterval(timerInterval); timerInterval = null; timerContainer?.classList.remove('low-time'); }
    function updateTimerDisplay() { if (!timerDisplay) return; timerDisplay.textContent = `00:${String(timeLeft).padStart(2, '0')}`; }
    function handleAutoAdvance() { console.log(`Auto-advancing: ${currentQuestionId}`); collectAnswer(currentQuestionId); handleNextQuestion(true); }

    // --- Question Rendering & Navigation --- (Standard Implementation)
    function renderQuestion(questionId) { const question = surveyQuestions[questionId]; if (!question || question.type === 'textarea' || question.type === 'completion' || !questionContainer) { console.error("Invalid question/render state:", questionId); showFeedbackSection(); return; } stopTimer(); questionContainer.innerHTML = ''; const fieldset = document.createElement('fieldset'); fieldset.id = `q_${questionId}`; fieldset.classList.add('question-card'); fieldset.setAttribute('aria-labelledby', `legend_${questionId}`); const legend = document.createElement('legend'); legend.id = `legend_${questionId}`; legend.innerHTML = question.text; fieldset.appendChild(legend); const optionsList = document.createElement('ul'); optionsList.classList.add('options-list'); if (question.type === 'radio' || question.type === 'rating') optionsList.setAttribute('role', 'radiogroup'); else if (question.type === 'checkbox') { optionsList.setAttribute('role', 'group'); if (question.maxSelection) optionsList.setAttribute('aria-describedby', `info_${questionId}`); } if (question.options) { question.options.forEach((option, index) => { const li = document.createElement('li'); const id = `q_${questionId}_opt${index}`; const input = document.createElement('input'); input.type = question.type === 'checkbox' ? 'checkbox' : 'radio'; input.id = id; input.name = `q_${questionId}`; input.value = option.value; const ans = userAnswers[questionId]; if (ans) { if (input.type === 'radio' && String(ans) === String(option.value)) input.checked = true; else if (input.type === 'checkbox' && Array.isArray(ans) && ans.includes(String(option.value))) input.checked = true; } const label = document.createElement('label'); label.htmlFor = id; const span = document.createElement('span'); span.textContent = option.label; label.appendChild(input); label.appendChild(span); input.addEventListener('change', (e) => handleInputChange(questionId, question, e)); li.appendChild(label); optionsList.appendChild(li); }); fieldset.appendChild(optionsList); if (question.type === 'checkbox' && question.maxSelection) { const help = document.createElement('p'); help.id = `info_${questionId}`; help.classList.add('checkbox-help-text'); help.textContent = `(Select up to ${question.maxSelection})`; fieldset.appendChild(help); } } questionContainer.appendChild(fieldset); updateNavigationButtons(); updateProgressBar(); validateCurrentQuestion(); startTimer(); }
    function handleInputChange(questionId, questionDef, event = null) { if (questionDef.type === 'checkbox' && questionDef.maxSelection && event?.target.checked) { const count = questionContainer?.querySelectorAll(`input[name="q_${questionId}"]:checked`)?.length ?? 0; if (count > questionDef.maxSelection) { event.target.checked = false; alert(`Select up to ${questionDef.maxSelection} options.`); return; } } validateCurrentQuestion(); }
    function validateCurrentQuestion(isAutoAdvance = false) { if (!currentQuestionId || !nextButton) return false; const question = surveyQuestions[currentQuestionId]; if (isAutoAdvance) { nextButton.disabled = false; return true; } let isRequired = question?.required; if(typeof isRequired === 'function') isRequired = isRequired(userAnswers); if (!question || !isRequired) { nextButton.disabled = false; return true; } let isValid = false; if (questionContainer) { if (question.type === 'radio' || question.type === 'rating') isValid = questionContainer.querySelector(`input[name="q_${currentQuestionId}"]:checked`) !== null; else if (question.type === 'checkbox') isValid = questionContainer.querySelectorAll(`input[name="q_${currentQuestionId}"]:checked`).length > 0; else isValid = true; } nextButton.disabled = !isValid; return isValid; }
    function collectAnswer(questionId) { if (!questionId || !questionContainer) return; const question = surveyQuestions[questionId]; if (!question || question.type === 'textarea' || question.type === 'completion') return; let answer; if (question.type === 'radio' || question.type === 'rating') answer = questionContainer.querySelector(`input[name="q_${questionId}"]:checked`)?.value; else if (question.type === 'checkbox') { const ch = Array.from(questionContainer.querySelectorAll(`input[name="q_${questionId}"]:checked`)); answer = ch.length > 0 ? ch.map(cb => cb.value) : undefined; } if (answer !== undefined) userAnswers[questionId] = answer; else delete userAnswers[questionId]; }
    function getNextQuestionId() { if (!currentQuestionId) return surveyQuestions['START'].next; const question = surveyQuestions[currentQuestionId]; if (!question || !question.next) return 'FEEDBACK'; if (typeof question.next === 'string') return question.next; if (typeof question.next === 'function') return question.next(userAnswers); if (typeof question.next === 'object') { const ans = userAnswers[currentQuestionId]; if (ans !== undefined && question.next[String(ans)]) return question.next[String(ans)]; else if (question.next['default']) return question.next['default']; } return 'FEEDBACK'; }
    function handleNextQuestion(isAutoAdvance = false) { if (!isAutoAdvance && !validateCurrentQuestion()) { console.warn("Validation failed."); questionContainer?.querySelector('.question-card')?.shake?.(); return; } if(currentQuestionId !== 'START') collectAnswer(currentQuestionId); stopTimer(); const nextId = getNextQuestionId(); if(currentQuestionId && currentQuestionId !== 'START') questionHistory.push(currentQuestionId); currentQuestionId = nextId; if (currentQuestionId === 'FEEDBACK') showFeedbackSection(); else if (currentQuestionId === 'COMPLETE') submitSurvey(); else if (surveyQuestions[currentQuestionId]) renderQuestion(currentQuestionId); else { console.error(`Invalid next ID: ${currentQuestionId}`); showFeedbackSection(); } }
    function handlePreviousQuestion() { if (questionHistory.length === 0) return; stopTimer(); currentQuestionId = questionHistory.pop(); if (surveyQuestions[currentQuestionId]) renderQuestion(currentQuestionId); else { console.error(`Invalid prev ID: ${currentQuestionId}`); startSurvey(); } }
    function updateNavigationButtons() { if (backButton) backButton.classList.toggle('visible', questionHistory.length > 0); }
    function updateProgressBar() { if (!progressBar) return; const qIds = Object.keys(surveyQuestions).filter(id => !['START', 'FEEDBACK', 'COMPLETE'].includes(id)); const total = qIds.length; let currentIdx = questionHistory.length; if (currentQuestionId && currentQuestionId !== 'START' && !questionHistory.includes(currentQuestionId)) { const qIdx = qIds.indexOf(currentQuestionId); if(qIdx !== -1) currentIdx = qIdx; } const progress = total > 0 ? Math.min((currentIdx / total) * 100, 100) : 0; progressBar.style.width = `${progress}%`; }

    // --- Feedback Section --- (Standard Implementation)
    function showFeedbackSection() { stopTimer(); if(surveyForm) surveyForm.style.display = 'none'; if(feedbackSection) feedbackSection.style.display = 'block'; if(welcomeScreen) welcomeScreen.style.display = 'none'; if(finalFeedbackInput) { finalFeedbackInput.value = userAnswers['FEEDBACK'] || ''; updateCharCount(); } }
    function updateCharCount() { if (!finalFeedbackInput || !charCountDisplay) return; const len = finalFeedbackInput.value.length; charCountDisplay.textContent = `${len} / ${MAX_FEEDBACK_CHARS} chars`; const isOver = len > MAX_FEEDBACK_CHARS; charCountDisplay.classList.toggle('limit-exceeded', isOver); if(submitSurveyButton) submitSurveyButton.disabled = isOver; }

    // --- Survey Start & Completion --- (Standard Implementation)
    function startSurvey() { console.log("Starting Best Buy survey..."); surveyStartTime = new Date(); userAnswers = {}; questionHistory = []; currentQuestionId = 'START'; if (welcomeScreen) welcomeScreen.style.display = 'none'; if (surveyForm) surveyForm.style.display = 'block'; if (feedbackSection) feedbackSection.style.display = 'none'; if (completionScreen) completionScreen.style.display = 'none'; handleNextQuestion(); }
    function submitSurvey() {
        stopTimer(); console.log("Submitting Best Buy survey...");
        if (finalFeedbackInput && feedbackSection?.style.display === 'block') { userAnswers['FEEDBACK'] = finalFeedbackInput.value.trim(); if (userAnswers['FEEDBACK'].length > MAX_FEEDBACK_CHARS) { alert(`Feedback > ${MAX_FEEDBACK_CHARS} chars.`); return; } }
        const endTime = new Date(); const duration = Math.round(((endTime - surveyStartTime) || 0) / 1000); userAnswers['meta'] = { start: surveyStartTime?.toISOString(), end: endTime.toISOString(), durationS: duration, ua: navigator.userAgent };
        console.log("---- BEST BUY SURVEY RESULTS ----"); console.log(JSON.stringify(userAnswers, null, 2));
        console.log("---- SIMULATING BACKEND ----");
        const email = "techie_" + Math.random().toString(36).substring(2, 9) + "@realsurveys-example.com"; console.log(`User: ${email}`); const reward = 0.80; console.log(`Updating balance: +$${reward.toFixed(2)}...`);
        setTimeout(() => { console.log(`Balance update OK.`); if (completionMessage) completionMessage.textContent = `Reward $${reward.toFixed(2)} processed for ${email}.`; }, 1300);
        if (surveyForm) surveyForm.style.display = 'none'; if (feedbackSection) feedbackSection.style.display = 'none'; if (completionScreen) completionScreen.style.display = 'block';
        if (window.confetti) confetti({ particleCount: 140, spread: 80, origin: { y: 0.6 } });
        setTimeout(() => { console.log("Redirecting..."); window.location.href = 'surveys.html'; }, 6000);
    }

    // --- Event Listeners & Init --- (Standard Implementation)
    if (startButton) startButton.addEventListener('click', startSurvey); else console.error("Start Button missing");
    if (nextButton) nextButton.addEventListener('click', () => handleNextQuestion(false)); else console.error("Next Button missing");
    if (backButton) backButton.addEventListener('click', handlePreviousQuestion); else console.error("Back Button missing");
    if (finalFeedbackInput) finalFeedbackInput.addEventListener('input', updateCharCount);
    if (skipFeedbackButton) skipFeedbackButton.addEventListener('click', () => { userAnswers['FEEDBACK'] = 'skipped'; submitSurvey(); }); else console.error("Skip Button missing");
    if (submitSurveyButton) submitSurveyButton.addEventListener('click', submitSurvey); else console.error("Submit Button missing");
    if (surveyForm) surveyForm.addEventListener('submit', (e) => e.preventDefault());
    if(surveyForm) surveyForm.style.display = 'none'; if(feedbackSection) feedbackSection.style.display = 'none'; if(completionScreen) completionScreen.style.display = 'none'; if(backButton) backButton.classList.remove('visible');
    console.log("Best Buy Survey Initialized.");

}); // End DOMContentLoaded

// Optional Shake Helper (Standard Implementation)
Element.prototype.shake = function() { this.style.animation = 'shake 0.3s ease-in-out'; setTimeout(() => this.style.animation = '', 300); }; try { const sheet = document.styleSheets[0]; sheet.insertRule(`@keyframes shake { 0%, 100% { transform: translateX(0); } 25% { transform: translateX(-3px); } 75% { transform: translateX(3px); } }`, sheet.cssRules.length); } catch (e) { console.warn("Shake animation insert failed:", e); }