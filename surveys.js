// Initialize Firebase
import { getDatabase, ref, onValue, update } from "https://www.gstatic.com/firebasejs/9.22.0/firebase-database.js";
import { getAuth, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/9.22.0/firebase-auth.js";

const db = getDatabase();
const auth = getAuth();

// Function to update the balance display
function updateBalanceDisplay(balance) {
    const balanceSpan = document.getElementById('user-balance');
    if (balanceSpan) {
        balanceSpan.textContent = balance;
    }
}

// Function to handle survey participation
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

        // Update the user's balance after taking the survey
        update(userRef, {
            balance: currentBalance + rewardAmount
        }).then(() => {
            // Also update the survey participation
            onValue(surveyRef, (surveySnapshot) => {
                const surveyData = surveySnapshot.val();
                if (surveyData) {
                    const spotsLeft = surveyData.spotsLeft - 1;

                    // Update survey spots left
                    update(surveyRef, {
                        spotsLeft: spotsLeft
                    }).then(() => {
                        // Notify the user
                        alert(`You have successfully completed the survey and earned $${rewardAmount}!`);
                        // Update balance display
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

// Add event listeners to survey buttons
document.addEventListener('DOMContentLoaded', () => {
    const surveyButtons = document.querySelectorAll('.take-survey');
    surveyButtons.forEach(button => {
        button.addEventListener('click', handleSurveyClick);
    });

    // Update balance on page load
    const user = auth.currentUser;
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
