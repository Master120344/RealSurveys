function registerUser(event) {
  event.preventDefault();
  const username = document.getElementById('username').value;
  const password = document.getElementById('password').value;
  const email = document.getElementById('email').value;

  // Create a new user with Firebase Authentication
  firebase.auth().createUserWithEmailAndPassword(email, password)
  .then((userCredential) => {
    // Get the user's ID
    const userId = userCredential.user.uid;

    // Create a user object to store in Realtime Database
    const user = {
      username,
      email,
      balance: 0
    };

    // Store the user object in Realtime Database
    firebase.database().ref('users/' + userId).set(user);

    // Redirect to welcome.html
    document.querySelector('.redirecting').style.display = 'block';
    setTimeout(() => {
      window.location.href = 'welcome.html';
    }, 2000);
  })
  .catch((error) => {
    // Handle any errors that occur during registration
    console.error(error);
  });
}
