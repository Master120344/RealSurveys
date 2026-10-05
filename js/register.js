import { exitGuest } from "./demo-session.js";
const form = document.getElementById("registerForm"),
  status = document.getElementById("registerMessage");
const show = (text, error = false) => {
  status.textContent = text;
  status.className = "status" + (error ? " error" : "");
  status.hidden = false;
};
form?.addEventListener("submit", async (e) => {
  e.preventDefault();
  const password = form.elements.password.value;
  if (!(
    password.length >= 12 &&
    /[a-z]/.test(password) &&
    /[A-Z]/.test(password) &&
    /\d/.test(password) &&
    /[^A-Za-z0-9]/.test(password)
  ))
    return show(
      "Use 12+ characters with uppercase, lowercase, a number, and a symbol.",
      true,
    );
  if (password !== form.elements.confirmPassword.value)
    return show("The two passwords don’t match.", true);
  const b = form.querySelector("button");
  b.disabled = true;
  try {
    const { register, db } = await import("./firebase-config.js");
    const { doc, setDoc, serverTimestamp } =
      await import("https://www.gstatic.com/firebasejs/9.22.0/firebase-firestore.js");
    const result = await register(form.elements.email.value.trim(), password);
    exitGuest();
    sessionStorage.setItem("mrs-account-mode", "firebase");
    try {
      await setDoc(
        doc(db, "users", result.user.uid),
        { email: result.user.email, balance: 0, createdAt: serverTimestamp() },
        { merge: true },
      );
    } catch {
      show(
        "Your sign-in account was created, but its profile could not be saved. You can log in and explore sample surveys.",
      );
      return;
    }
    sessionStorage.setItem("mrs-account-mode", "firebase");
    location.assign("surveys.html");
  } catch (err) {
    show(
      err.code === "auth/email-already-in-use"
        ? "That email already has an account. Try logging in."
        : "Account registration isn’t available right now. You can explore using guest / password.",
      true,
    );
  } finally {
    b.disabled = false;
  }
});
