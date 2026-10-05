import { feedbackGuide, observeCharacters } from "./characters.js";
import { activeSurveys } from "./catalog.js";
import { getQuestion } from "./questions.js";
import { readDemo, completeDemo, escapeHTML as esc } from "./demo-session.js";
const id = new URLSearchParams(location.search).get("brand");
const survey = activeSurveys.find((x) => x.id === id);
const root = document.getElementById("questionRoot"),
  form = document.getElementById("surveyForm"),
  runner = document.getElementById("runner"),
  done = document.getElementById("completion");
let step = 0,
  answers = [],
  feedback = "",
  anonymous = true,
  info = { name: "", email: "", details: "", consent: false };
function error(message) {
  const e = document.getElementById("surveyError");
  e.textContent = message;
  e.hidden = !message;
}
function finishView(already = false) {
  runner.hidden = true;
  done.hidden = false;
  done.innerHTML = `<div class="completion-mark" aria-hidden="true">✓</div><span class="eyebrow">${already ? "Already explored" : "Ten questions. One real perspective."}</span><h1 tabindex="-1">${already ? "You’ve tried this one." : "That’s a wrap."}</h1><p>${already ? "This sample is complete in your current tab. Explore another brand to keep going." : "Thanks for trying the " + esc(survey.name) + " sample. Your answers and optional details haven’t been sent to a company."}</p><div class="completion-amount">$1</div><small>Demo credit · no cash value · no withdrawal</small><div><a class="button" href="surveys.html">Explore another survey</a></div><p><a class="text-link" href="balance.html">See your preview progress</a></p>`;
  done.querySelector("h1").focus();
}
function captureFeedback() {
  feedback = document.getElementById("feedback")?.value || "";
  if (!anonymous) {
    info = {
      name: document.getElementById("optionalName")?.value || "",
      email: document.getElementById("optionalEmail")?.value || "",
      details: document.getElementById("optionalDetails")?.value || "",
      consent: document.getElementById("infoConsent")?.checked || false,
    };
  }
}
function infoPanel() {
  const panel = document.getElementById("optionalInfo");
  panel.hidden = anonymous;
  panel.innerHTML = anonymous
    ? ""
    : `<p>Only add what you’re comfortable sharing. Every field is optional. In this preview, these details stay on this page and are discarded when you finish.</p><div class="two-fields"><div class="field"><label for="optionalName">Name <small>(optional)</small></label><input id="optionalName" maxlength="100" autocomplete="off" value="${esc(info.name)}"></div><div class="field"><label for="optionalEmail">Email <small>(optional)</small></label><input id="optionalEmail" type="email" maxlength="254" autocomplete="off" value="${esc(info.email)}"></div></div><div class="field"><label for="optionalDetails">Anything else you choose to share <small>(optional)</small></label><textarea id="optionalDetails" maxlength="500" rows="3" placeholder="Please don’t include sensitive information.">${esc(info.details)}</textarea></div><label class="checkline"><input id="infoConsent" type="checkbox" ${info.consent ? "checked" : ""}><span>I choose to include these details with this preview response. They will not be transmitted.</span></label><button type="button" class="quiet-button" id="neverMind">Never mind — stay anonymous</button>`;
  document.getElementById("neverMind")?.addEventListener("click", () => {
    captureFeedback();
    anonymous = true;
    info = { name: "", email: "", details: "", consent: false };
    document.getElementById("anonymousChoice").checked = true;
    infoPanel();
    document.getElementById("anonymousChoice").focus();
  });
}
function render() {
  error("");
  const last = step === 10;
  document.getElementById("questionCount").textContent = last
    ? "10 of 10 complete"
    : "Question " + (step + 1) + " of 10";
  document.getElementById("progressCaption").textContent = last
    ? "Your final word · optional"
    : "Your perspective matters.";
  document
    .getElementById("surveyProgress")
    .setAttribute("aria-valuenow", String(step));
  document.getElementById("progressBar").style.width = step * 10 + "%";
  document.getElementById("backButton").hidden = step === 0;
  document.getElementById("nextButton").textContent = last
    ? "Finish preview"
    : "Continue";
  if (last) {
    root.innerHTML = `${feedbackGuide()}<span class="question-kicker">An optional final note</span><h1 class="question-title" id="questionTitle" tabindex="-1">What else would you like ${esc(survey.name)} to hear?</h1><p class="question-help">A pain point, a good idea, or something we didn’t ask. Skip this if your ten answers say it all.</p><div class="field feedback-area"><label for="feedback">Your message <small>(optional)</small></label><textarea id="feedback" maxlength="1500" rows="5" placeholder="If you could change one thing…">${esc(feedback)}</textarea><small>Please avoid personal information in the message. Up to 1,500 characters.</small></div><div class="privacy-options" role="radiogroup" aria-label="How to identify your final feedback"><label class="option"><input id="anonymousChoice" type="radio" name="privacy" value="anonymous" ${anonymous ? "checked" : ""}><span>Stay anonymous<small>No identifying details. The default.</small></span></label><label class="option"><input type="radio" name="privacy" value="details" ${!anonymous ? "checked" : ""}><span>Add optional information<small>You choose exactly what to include.</small></span></label></div><div id="optionalInfo" class="optional-info" hidden></div><button type="button" class="quiet-button" id="skipFeedback">Skip the final note</button>`;
    observeCharacters(root);
    infoPanel();
    root.querySelectorAll("[name=privacy]").forEach((input) =>
      input.addEventListener("change", () => {
        captureFeedback();
        anonymous = input.value === "anonymous";
        if (anonymous)
          info = { name: "", email: "", details: "", consent: false };
        infoPanel();
      }),
    );
    document.getElementById("skipFeedback").addEventListener("click", () => {
      feedback = "";
      anonymous = true;
      info = { name: "", email: "", details: "", consent: false };
      complete();
    });
  } else {
    const question = getQuestion(survey, step, answers);
    root.innerHTML = `<span class="question-kicker">${esc(survey.name)} · ${esc(survey.category)}</span><h1 class="question-title" id="questionTitle" tabindex="-1">${esc(question.prompt)}</h1><p class="question-help" id="questionHelp">${esc(question.help)}</p><div class="options" role="radiogroup" aria-labelledby="questionTitle" aria-describedby="questionHelp">${question.options.map((option, i) => `<label class="option"><input type="radio" name="answer" value="${esc(option)}" required ${answers[step] === option ? "checked" : ""}><span>${esc(option)}</span></label>`).join("")}</div>`;
  }
  root.querySelector(".question-title").focus({ preventScroll: true });
  window.scrollTo({ top: 0, behavior: "instant" });
}
function complete() {
  if (!completeDemo(survey.id)) {
    error(
      "Your browser couldn’t save the completion. Allow tab storage and try again.",
    );
    return;
  }
  answers = [];
  feedback = "";
  info = { name: "", email: "", details: "", consent: false };
  root.replaceChildren();
  finishView();
}
form.addEventListener("submit", (e) => {
  e.preventDefault();
  if (step < 10) {
    const chosen = new FormData(form).get("answer");
    if (!chosen) return error("Choose an answer to continue.");
    if (answers[step] !== chosen) answers = answers.slice(0, step);
    answers[step] = chosen;
    step++;
    render();
  } else {
    captureFeedback();
    if (
      !anonymous &&
      (info.name.trim() || info.email.trim() || info.details.trim()) &&
      !info.consent
    )
      return error(
        "Confirm your choice to include details, or choose “Never mind” to finish anonymously.",
      );
    complete();
  }
});
document.getElementById("backButton").addEventListener("click", () => {
  if (step === 10) captureFeedback();
  if (step > 0) {
    step--;
    render();
  }
});
async function initialize() {
  if (!survey) {
    runner.hidden = true;
    done.hidden = false;
    done.innerHTML =
      '<h1>Survey not found.</h1><p>Choose a sample from the catalog to continue.</p><a class="button" href="surveys.html">Browse samples</a>';
    return;
  }
  document.getElementById("surveyBrand").innerHTML =
    `<img src="surveycards/${survey.image}" alt="" width="44" height="35"><span>${esc(survey.name)}</span>`;
  if (!readDemo().guest) {
    let signedIn = false;
    try {
      if (sessionStorage.getItem("mrs-account-mode") === "firebase") {
        const { auth, onAuthStateChanged } =
          await import("./firebase-config.js");
        signedIn = await new Promise((resolve) => {
          let unsubscribe = () => {};
          const timer = setTimeout(() => {
            unsubscribe();
            resolve(false);
          }, 8000);
          unsubscribe = onAuthStateChanged(auth, (user) => {
            clearTimeout(timer);
            unsubscribe();
            resolve(!!user);
          });
        });
      }
    } catch {}
    if (!signedIn) {
      location.replace(
        "login.html?next=" +
          encodeURIComponent("survey.html?brand=" + survey.id),
      );
      return;
    }
  }
  if (readDemo().completed.some((s) => s.id === survey.id)) {
    finishView(true);
    return;
  }
  render();
}
initialize();
