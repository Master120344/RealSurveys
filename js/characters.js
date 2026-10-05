// These helpers are illustration hints, not chatbots. No network or personal-data access.
const documentRoot = document.documentElement;
const reduced = matchMedia("(prefers-reduced-motion: reduce)");
let paused = reduced.matches;
try {
  paused ||= sessionStorage.getItem("mrs-motion-paused") === "true";
} catch {}
function syncMotion() {
  documentRoot.classList.toggle("motion-off", paused || reduced.matches);
  document.querySelectorAll("[data-motion]").forEach((button) => {
    button.disabled = reduced.matches;
    button.textContent = reduced.matches
      ? "Reduced motion enabled"
      : paused
        ? "Play animations"
        : "Pause animations";
    button.setAttribute("aria-pressed", String(paused || reduced.matches));
  });
}
syncMotion();
reduced.addEventListener?.("change", syncMotion);
document.addEventListener("click", (event) => {
  const close = event.target.closest("[data-tip-close]");
  if (close) {
    const id = close.dataset.tipClose;
    const bubble = document.getElementById(id);
    const open = document.querySelector(`[data-tip-open="${id}"]`);
    if (bubble) bubble.hidden = true;
    if (open) {
      open.hidden = false;
      open.focus({ preventScroll: true });
    }
    return;
  }
  const open = event.target.closest("[data-tip-open]");
  if (open) {
    const bubble = document.getElementById(open.dataset.tipOpen);
    if (bubble) {
      bubble.hidden = false;
      open.hidden = true;
      bubble.querySelector("button")?.focus({ preventScroll: true });
    }
    return;
  }
  if (event.target.closest("[data-motion]")) {
    paused = !paused;
    try {
      sessionStorage.setItem("mrs-motion-paused", String(paused));
    } catch {}
    syncMotion();
  }
});
const observer =
  "IntersectionObserver" in window
    ? new IntersectionObserver(
        (entries) => {
          for (const entry of entries)
            entry.target.classList.toggle("in-view", entry.isIntersecting);
        },
        { threshold: 0.15 },
      )
    : null;
export function observeCharacters(scope = document) {
  scope.querySelectorAll("[data-animated]").forEach((el) => {
    if (observer) observer.observe(el);
    else el.classList.add("in-view");
  });
  syncMotion();
}
observeCharacters();
export function feedbackGuide() {
  return `<div class="character-guide feedback-guide"><div class="character-sprite privacy-person" data-animated role="img" aria-label="An illustrated guide checking her clipboard"></div><div class="tip-container"><aside class="tip-bubble" id="feedback-hint" aria-label="Helpful hint"><button type="button" class="tip-close" data-tip-close="feedback-hint" aria-label="Dismiss hint">×</button><strong>Anonymous is already selected.</strong><p>Your message can stand on its own. Only add details if you want to.</p></aside><button type="button" class="tip-reopen" data-tip-open="feedback-hint" aria-controls="feedback-hint" hidden>Show tip</button></div></div>`;
}
