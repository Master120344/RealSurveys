import { readDemo, escapeHTML as esc } from "./demo-session.js";
import { activeSurveys } from "./catalog.js";
const demo = readDemo();
document.getElementById("balanceValue").textContent =
  `$${demo.completed.length.toFixed(2)}`;
document.getElementById("activityList").innerHTML = demo.completed.length
  ? demo.completed
      .map(
        (x) =>
          `<li><span>${esc(activeSurveys.find((s) => s.id === x.id)?.name || "Sample survey")}<br><small>Sample completed</small></span><strong>+$1 demo</strong></li>`,
      )
      .join("")
  : "<li><span>No samples completed yet.</span></li>";
if (demo.guest)
  document.getElementById("accountStatus").textContent =
    "Guest preview · progress saved in this tab only.";
else if (sessionStorage.getItem("mrs-account-mode") === "firebase") {
  document.getElementById("accountStatus").textContent =
    "Local preview progress · sign in to view an existing account record.";
  try {
    const { auth, db, onAuthStateChanged } =
      await import("./firebase-config.js");
    onAuthStateChanged(auth, async (user) => {
      if (!user) return;
      document.getElementById("accountStatus").textContent =
        user.email || "Your account";
      document.getElementById("realBalanceSection").hidden = false;
      const el = document.getElementById("realBalanceValue");
      try {
        const { doc, getDoc } =
          await import("https://www.gstatic.com/firebasejs/9.22.0/firebase-firestore.js");
        const d = await getDoc(doc(db, "users", user.uid));
        const balance = Number(d.data()?.balance || 0);
        el.textContent = Number.isFinite(balance)
          ? `Recorded balance: $${balance.toFixed(2)}. This is separate from demo credits. Withdrawals are not available.`
          : "Your balance could not be read.";
      } catch {
        el.textContent =
          "Your recorded balance could not be loaded. Demo credits are separate from your account.";
      }
    });
  } catch {
    document.getElementById("accountStatus").textContent =
      "Account service is unavailable. Local preview progress is still shown.";
  }
}

window.addEventListener("pageshow", (event) => {
  if (event.persisted) location.reload();
});
