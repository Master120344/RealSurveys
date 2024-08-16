// surveys.js
import { getDatabase, ref, onValue, update } from 'https://www.gstatic.com/firebasejs/9.22.0/firebase-database.js';
import { getAuth, onAuthStateChanged } from 'https://www.gstatic.com/firebasejs/9.22.0/firebase-auth.js';

const db = getDatabase();
const auth = getAuth();

function updateBalanceDisplay(balance) {
    const balanceSpan = document.getElementById('user-balance');
    if (balanceSpan) {
        balanceSpan.textContent = `$${balance.toFixed(2)}`;
    }
}

function handleSurveyClick(event) {
    event.preventDefault();
    const surveyButton = event.currentTarget;
    const surveyId = surveyButton.getAttribute('data-survey-id');
    const rewardAmount = parseFloat(surveyButton.getAttribute('data-reward'));

    if (!surveyId || isNaN(rewardAmount)) return;

    const user = auth.currentUser;
    if (!user) {
        alert('You need to be logged in to take a survey.');
        return;
    }

    const userRef = ref(db, `users/${user.uid}`);
    const surveyRef = ref(db, `surveys/${surveyId}`);

    onValue(userRef, (snapshot) => {
        const userData = snapshot.val();
        const currentBalance = userData ? userData.balance || 0 : 0;

        update(userRef, {
            balance: currentBalance + rewardAmount
        }).then(() => {
            onValue(surveyRef, (surveySnapshot) => {
                const surveyData = surveySnapshot.val();
                if (surveyData) {
                    const spotsLeft = surveyData.spotsLeft - 1;

                    update(surveyRef, {
                        spotsLeft: spotsLeft
                    }).then(() => {
                        alert(`You have successfully completed the survey and earned $${rewardAmount}!`);
                        updateBalanceDisplay(currentBalance + rewardAmount);
                    }).catch((error) => {
                        console.error('Error updating survey spots:', error);
                    });
                }
            });
        }).catch((error) => {
            console.error('Error updating user balance:', error);
        });
    });
}

document.addEventListener('DOMContentLoaded', () => {
    onAuthStateChanged(auth, (user) => {
        if (user) {
            const userRef = ref(db, `users/${user.uid}`);
            onValue(userRef, (snapshot) => {
                const userData = snapshot.val();
                if (userData) {
                    const balance = userData.balance || 0;
                    updateBalanceDisplay(balance);
                }
            });
        }
    });

    const surveyButtons = document.querySelectorAll('.take-survey');
    surveyButtons.forEach(button => {
        button.addEventListener('click', handleSurveyClick);
    });
});
