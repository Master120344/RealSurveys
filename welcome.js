firebase.auth().onAuthStateChanged((user) => {
if (user) {
const userId = user.uid;
firebase.database().ref('users/' + userId).on('value', (snapshot) => {
const userData = snapshot.val();
document.getElementById('username').innerHTML = userData.username;
document.getElementById('email').innerHTML = userData.email;
document.getElementById('balance').innerHTML = userData.balance;
});
} else {
window.location.href = 'index.html';
}
});
