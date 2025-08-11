// js/tacobell_survey.js
import { auth, db, setupAuthUI } from './firebase-config.js';
import { doc, updateDoc, increment } from 'https://www.gstatic.com/firebasejs/9.22.0/firebase-firestore.js';

AOS.init({ duration: 1200, once: true, easing: 'ease-in-out' });

particlesJS('particles-js', {
    particles: {
        number: { value: 80, density: { enable: true, value_area: 1000 } },
        color: { value: '#f4e500' },
        shape: { type: 'circle' },
        opacity: { value: 0.6, random: true },
        size: { value: 4, random: true },
        line_linked: { enable: true, distance: 140, color: '#6a00a2', opacity: 0.4, width: 1.5 },
        move: { enable: true, speed: 3, direction: 'none', random: true }
    },
    interactivity: {
        detect_on: 'canvas',
        events: { onhover: { enable: true, mode: 'repulse' }, onclick: { enable: true, mode: 'push' } },
        modes: { repulse: { distance: 100 }, push: { particles_nb: 4 } }
    },
    retina_detect: true
});

// Theme Toggle
document.getElementById('theme-toggle').addEventListener('click', () => {
    document.body.classList.toggle('light-mode');
    document.getElementById('theme-toggle').innerHTML = document.body.classList.contains('light-mode') 
        ? '<i class="fas fa-sun"></i>' 
        : '<i class="fas fa-moon"></i>';
});

// Navigation Buttons
document.querySelectorAll('.nav-btn:not(#logout-btn)').forEach(button => {
    button.addEventListener('click', () => {
        const href = button.getAttribute('data-href');
        if (href) window.location.href = href;
    });
});

document.addEventListener('DOMContentLoaded', () => {
    setupAuthUI('user-menu', 'login-link', 'user-email', 'logout-btn');

    const questions = [
        { question: "How satisfied were you with your last Taco Bell visit?", options: ["Very Satisfied", "Satisfied", "Neutral", "Dissatisfied", "Very Dissatisfied"] },
        { question: "How often do you crave Taco Bell?", options: ["Daily", "Weekly", "Monthly", "Rarely", "Never"] },
        { question: "Rate our food quality:", options: ["Epic", "Great", "Okay", "Meh", "Yikes"] },
        { question: "Would you shout Taco Bell from the rooftops?", options: ["Heck Yes", "Probably", "Maybe", "Nah", "No Way"] }
    ];

    let currentQuestionIndex = 0;
    const questionContainer = document.getElementById('questionContainer');
    const nextBtn = document.getElementById('nextBtn');
    const submitBtn = document.getElementById('submitBtn');
    const surveyForm = document.getElementById('surveyForm');
    const thankYouMessage = document.getElementById('thankYouMessage');
    const progressFill = document.getElementById('progress');

    function updateProgress() {
        const progressPercentage = ((currentQuestionIndex + 1) / questions.length) * 100;
        progressFill.style.width = `${progressPercentage}%`;
    }

    function displayQuestion(index) {
        if (index >= questions.length) return;

        const q = questions[index];
        questionContainer.innerHTML = `
            <h3>${q.question}</h3>
            ${q.options.map((option, i) => `
                <label>
                    <input type="radio" name="q${index}" value="${option}" ${i === 0 ? 'required' : ''}>
                    ${option}
                </label>
            `).join('')}
        `;
        updateProgress();

        nextBtn.style.display = index === questions.length - 1 ? 'none' : 'inline-block';
        submitBtn.style.display = index === questions.length - 1 ? 'inline-block' : 'none';
    }

    function updateBalance() {
        const user = auth.currentUser;
        if (user) {
            const userRef = doc(db, 'users', user.uid);
            return updateDoc(userRef, { balance: increment(5) })
                .catch(error => {
                    console.error('Error updating balance:', error);
                    throw error;
                });
        } else {
            console.error('No user logged in');
            return Promise.reject('No user logged in');
        }
    }

    nextBtn.addEventListener('click', () => {
        const selected = document.querySelector(`input[name="q${currentQuestionIndex}"]:checked`);
        if (selected) {
            currentQuestionIndex++;
            displayQuestion(currentQuestionIndex);
        } else {
            alert('Pick an option, fam!');
        }
    });

    submitBtn.addEventListener('click', () => {
        const selected = document.querySelector(`input[name="q${currentQuestionIndex}"]:checked`);
        if (selected) {
            updateBalance()
                .then(() => {
                    surveyForm.style.display = 'none';
                    thankYouMessage.style.display = 'block';
                    let countdown = 3;
                    const countdownText = thankYouMessage.querySelector('p');
                    const interval = setInterval(() => {
                        countdown--;
                        countdownText.textContent = `You’ve earned $5! Redirecting to more surveys in ${countdown}...`;
                        if (countdown <= 0) {
                            clearInterval(interval);
                            window.location.href = 'surveys.html';
                        }
                    }, 1000);
                })
                .catch(() => {
                    alert('Something went wrong with your reward. Try again!');
                });
        } else {
            alert('One last choice, please!');
        }
    });

    // Start with the first question
    displayQuestion(currentQuestionIndex);
});