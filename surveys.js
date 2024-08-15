// Initialize Firebase
const firebaseConfig = {
    apiKey: "YOUR_API_KEY",
    authDomain: "YOUR_PROJECT_ID.firebaseapp.com",
    databaseURL: "https://YOUR_PROJECT_ID.firebaseio.com",
    projectId: "YOUR_PROJECT_ID",
    storageBucket: "YOUR_PROJECT_ID.appspot.com",
    messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
    appId: "YOUR_APP_ID"
};
firebase.initializeApp(firebaseConfig);

const db = firebase.database();
const auth = firebase.auth();

window.onload = function() {
    // Get the current user
    auth.onAuthStateChanged(user => {
        if (user) {
            const userId = user.uid;

            // Update balance display
            db.ref(`users/${userId}/balance`).on('value', snapshot => {
                const balance = snapshot.val() || 0;
                document.getElementById('balance-link').textContent = `Balance: $${balance}`;
            });

            // Handle survey completion
            document.querySelectorAll('.take-survey').forEach(button => {
                button.addEventListener('click', function(event) {
                    event.preventDefault();

                    const surveyId = this.getAttribute('data-survey-id');
                    const reward = parseFloat(this.closest('.survey-item').getAttribute('data-reward'));

                    // Update balance in Firebase
                    db.ref(`users/${userId}`).transaction(userData => {
                        if (userData) {
                            userData.balance = (userData.balance || 0) + reward;
                        } else {
                            userData = { balance: reward };
                        }
                        return userData;
                    }).then(() => {
                        // Optionally, mark survey as completed in your database
                        alert('Survey completed. Reward added!');
                    }).catch(error => {
                        console.error('Error updating balance:', error);
                    });
                });
            });
        } else {
            // Handle user not logged in
            console.log('User is not logged in.');
        }
    });
};
