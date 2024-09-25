import { updateBalance } from './update_balance.js'; // Adjust the path as necessary

// Survey questions array
const questions = [
    {
        question: "How would you rate your overall experience at Burger King?",
        options: ["Excellent", "Very Good", "Good", "Fair", "Poor"],
        isTextBox: false,
    },
    {
        question: "Which Burger King menu items do you enjoy the most? (Select all that apply)",
        options: ["Whopper", "Chicken Sandwich", "French Fries", "Onion Rings", "Salads", "Beverages", "Desserts"],
        isTextBox: false,
        multiSelect: true,
    },
    {
        question: "How often do you visit Burger King?",
        options: ["Daily", "Weekly", "Monthly", "Rarely", "Never"],
        isTextBox: false,
    },
    {
        question: "How satisfied are you with the variety of menu items?",
        options: ["Very Satisfied", "Satisfied", "Neutral", "Dissatisfied", "Very Dissatisfied"],
        isTextBox: false,
    },
    {
        question: "How would you rate the cleanliness of the restaurant?",
        options: ["Always Clean", "Usually Clean", "Sometimes Clean", "Rarely Clean", "Never Clean"],
        isTextBox: false,
    },
    {
        question: "What aspects of our customer service stood out to you?",
        options: [],
        isTextBox: true,
    },
    {
        question: "Rate the speed of service you received:",
        options: ["Very Fast", "Fast", "Average", "Slow", "Very Slow"],
        isTextBox: false,
    },
    {
        question: "How do our prices compare to other fast food restaurants?",
        options: ["Much Lower", "Lower", "About the Same", "Higher", "Much Higher"],
        isTextBox: false,
    },
    {
        question: "What improvements would you suggest for Burger King?",
        options: [],
        isTextBox: true,
    },
    {
        question: "Would you like to receive promotions and special offers from Burger King?",
        options: ["Yes, definitely!", "Maybe, depending on the offer.", "No, thank you."],
        isTextBox: false,
    },
    {
        question: "How likely are you to recommend Burger King to friends or family?",
        options: Array.from({ length: 10 }, (_, i) => (i + 1).toString()),
        isTextBox: false,
    },
    {
        question: "What other fast food chains do you frequently visit? (Please specify)",
        options: [],
        isTextBox: true,
    },
    {
        question: "Any additional comments or feedback?",
        options: [],
        isTextBox: true,
    },
];

let currentQuestion = 0;
let timer;

// Initialize the survey
function initSurvey() {
    displayQuestion();
    document.getElementById('nextButton').addEventListener('click', nextQuestion);
    document.getElementById('backButton').addEventListener('click', goBack);
}

// Start the timer
function startTimer() {
    let timeLeft = 10;
    const timerDisplay = document.getElementById('timer');
    timerDisplay.innerText = timeLeft;
    document.getElementById('nextButton').disabled = true;

    timer = setInterval(() => {
        timeLeft--;
        timerDisplay.innerText = timeLeft;
        if (timeLeft <= 0) {
            clearInterval(timer);
            document.getElementById('nextButton').disabled = false;
            timerDisplay.innerText = "Time's up!";
        }
    }, 1000);
}

// Display the current question
function displayQuestion() {
    const questionData = questions[currentQuestion];
    const questionContainer = document.getElementById('questionContainer');
    
    // Clear previous content
    questionContainer.innerHTML = `<h2>${questionData.question}</h2>`;

    // Generate input elements based on question type
    questionData.isTextBox ? createTextBox(questionContainer) : createOptions(questionContainer, questionData);
    
    startTimer();
    document.getElementById('backButton').style.display = currentQuestion > 0 ? 'inline-block' : 'none';
}

// Create a text box for open-ended questions
function createTextBox(container) {
    container.innerHTML += `<textarea placeholder="Your answer..." required></textarea>`;
}

// Create radio buttons or checkboxes for multiple choice questions
function createOptions(container, questionData) {
    questionData.options.forEach((option) => {
        const inputType = questionData.multiSelect ? 'checkbox' : 'radio';
        container.innerHTML += `
            <label>
                <input type="${inputType}" name="question${currentQuestion}" value="${option}" ${inputType === 'radio' ? 'required' : ''} />
                ${option}
            </label>
        `;
    });
}

// Handle the next question action
function nextQuestion() {
    if (!validateAnswer()) return;

    currentQuestion++;
    if (currentQuestion < questions.length) {
        displayQuestion();
    } else {
        endSurvey();
    }
}

// Validate the user's answer for the current question
function validateAnswer() {
    const questionData = questions[currentQuestion];
    
    if (questionData.isTextBox) {
        const textArea = document.querySelector('textarea');
        if (textArea && !textArea.value.trim()) {
            alert("Please provide an answer before proceeding.");
            return false;
        }
    } else {
        const selectedOptions = questionData.multiSelect 
            ? Array.from(document.querySelectorAll(`input[name="question${currentQuestion}"]:checked`)) 
            : document.querySelector(`input[name="question${currentQuestion}"]:checked`);
        
        if (questionData.multiSelect && selectedOptions.length === 0) {
            alert("Please select at least one option before proceeding.");
            return false;
        } else if (!questionData.multiSelect && !selectedOptions) {
            alert("Please select an option before proceeding.");
            return false;
        }
    }
    return true;
}

// Handle the back action
function goBack() {
    if (currentQuestion > 0) {
        currentQuestion--;
        displayQuestion();
    }
}

// End the survey and thank the user
function endSurvey() {
    clearInterval(timer);
    document.getElementById('questionContainer').innerHTML = "<p>Thank you for completing the survey!</p>";
    document.getElementById('nextButton').style.display = 'none';
    document.getElementById('backButton').style.display = 'none';
    rewardUser();

    // Redirect after a delay
    setTimeout(() => {
        window.location.href = 'surveys.html'; // Redirect to surveys.html
    }, 2000); // Redirects after 2 seconds
}

// Reward the user for completing the survey
function rewardUser() {
    const rewardAmount = 2; // Amount to reward
    console.log(`Rewarding $${rewardAmount} to the user.`);
    updateBalance(rewardAmount); // Update balance after completing the survey
}

// Initialize the survey when the page loads
initSurvey();
