import "./characters.js";
import { readDemo, exitGuest } from "./demo-session.js";
const guest = readDemo().guest;
document
  .querySelectorAll("[data-year]")
  .forEach((el) => (el.textContent = new Date().getFullYear()));
if (guest)
  document.querySelectorAll("[data-account-link]").forEach((el) => {
    el.textContent = "Your preview";
    el.href = "balance.html";
  });
document.querySelector("[data-menu-toggle]")?.addEventListener("click", (e) => {
  const b = e.currentTarget;
  const expanded = b.getAttribute("aria-expanded") === "true";
  b.setAttribute("aria-expanded", String(!expanded));
  document.querySelector(".nav-links")?.classList.toggle("is-open", !expanded);
});
document.querySelectorAll("[data-logout]").forEach((b) =>
  b.addEventListener("click", async () => {
    if (readDemo().guest) exitGuest();
    else {
      try {
        const { logOut } = await import("./firebase-config.js");
        await logOut();
      } catch {}
    }
    try {
      sessionStorage.removeItem("mrs-account-mode");
    } catch {}
    location.assign("index.html");
  }),
);
