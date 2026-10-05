import { enterGuest, exitGuest, safeNext } from "./demo-session.js";
const form = document.getElementById("loginForm");
const show = (el, text, error = false) => {
  el.textContent = text;
  el.className = "status" + (error ? " error" : "");
  el.hidden = false;
};
form?.addEventListener("submit", async (e) => {
  e.preventDefault();
  const button = form.querySelector("button");
  const identity = form.elements.identity.value.trim();
  const password = form.elements.password.value;
  const status = document.getElementById("loginMessage");
  button.disabled = true;
  try {
    if (identity.toLowerCase() === "guest") {
      if (password !== "password")
        throw Error("For the preview, use guest and the password password.");
      if (!enterGuest())
        throw Error(
          "Your browser is blocking tab storage. Allow it to use guest mode.",
        );
    } else {
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(identity))
        throw Error("Enter guest, or a valid account email address.");
      const { signIn } = await import("./firebase-config.js");
      await signIn(identity, password);
      exitGuest();
      sessionStorage.setItem("mrs-account-mode", "firebase");
    }
    show(status, "You’re in. Opening your survey…");
    location.assign(safeNext());
  } catch (err) {
    show(
      status,
      err.code
        ? "Account sign-in is unavailable or the details didn’t match. You can still use guest / password to explore."
        : err.message || "Unable to sign in. Try guest / password.",
      true,
    );
  } finally {
    button.disabled = false;
  }
});
document.getElementById("resetForm")?.addEventListener("submit", async (e) => {
  e.preventDefault();
  const f = e.currentTarget,
    b = f.querySelector("button"),
    m = document.getElementById("resetMessage");
  b.disabled = true;
  try {
    const { resetPassword } = await import("./firebase-config.js");
    await resetPassword(f.elements.email.value.trim());
    show(m, "If this account is eligible, a reset email will arrive shortly.");
  } catch {
    show(
      m,
      "Unable to send a reset email right now. Guest preview is still available.",
      true,
    );
  } finally {
    b.disabled = false;
  }
});
