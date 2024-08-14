function loginUser(event) {
  event.preventDefault();
  const email = document.getElementById('email').value;
  const password = document.getElementById('password').value;

  firebase.auth().signInWithEmailAndPassword(email, password)
  .then((userCredential) => {
    // User signed in successfully
    document.querySelector('.redirecting').style.display = 'block';
    setTimeout(() => {
      window.location.href = 'welcome.html';
    }, 2000);
  })
  .catch((error) => {
    // Handle any errors that occur during login
    console.error(error);
  });
}
