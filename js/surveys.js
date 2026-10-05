import { activeSurveys } from "./catalog.js";
import { readDemo, escapeHTML as esc } from "./demo-session.js";
let completed = new Set(readDemo().completed.map((s) => s.id));
function card(s) {
  const done = completed.has(s.id);
  return `<article class="survey-card" style="--card-color:${s.color}"><a href="survey.html?brand=${s.id}" aria-label="${done ? "View completed" : "Try"} ${esc(s.name)} sample survey"><div class="card-visual"><span class="card-category">${esc(s.category)}</span><span class="card-price">${done ? "Completed" : "$1"}</span><img class="brand-art" src="surveycards/${s.image}" alt="${esc(s.name)} logo" width="132" height="88" loading="lazy"></div><div class="card-content"><span class="brand-name">${esc(s.name)}</span><h3>${esc(s.title)}</h3><div class="card-bottom"><span class="card-meta">10 questions · Sample survey</span><span class="card-cta">${done ? "View completion" : "Try this survey"}</span></div></div></a></article>`;
}
const featured = document.getElementById("featuredGrid");
if (featured) featured.innerHTML = activeSurveys.slice(0, 3).map(card).join("");
const grid = document.getElementById("surveyGrid"),
  search = document.getElementById("surveySearch");
let category = "All";
function render() {
  if (!grid) return;
  const query = (search?.value || "").trim().toLowerCase();
  const list = activeSurveys.filter(
    (s) =>
      (category === "All" || s.category === category) &&
      `${s.name} ${s.title} ${s.category}`.toLowerCase().includes(query),
  );
  grid.innerHTML = list.length
    ? list.map(card).join("")
    : '<div class="empty"><h3>No surveys found.</h3><p>Try another brand or browse all the samples.</p><button class="button outline" id="resetFilters">Clear filters</button></div>';
  document.getElementById("catalogCount").textContent =
    `${list.length} sample survey${list.length === 1 ? "" : "s"} · 10 questions each · $1 planned reward`;
  document.getElementById("resetFilters")?.addEventListener("click", () => {
    category = "All";
    search.value = "";
    document
      .querySelectorAll("[data-filter]")
      .forEach((b) =>
        b.setAttribute("aria-pressed", String(b.dataset.filter === "All")),
      );
    render();
    search.focus();
  });
}
search?.addEventListener("input", render);
document.querySelectorAll("[data-filter]").forEach((b) =>
  b.addEventListener("click", () => {
    category = b.dataset.filter;
    document
      .querySelectorAll("[data-filter]")
      .forEach((x) => x.setAttribute("aria-pressed", String(x === b)));
    render();
  }),
);
const amount = document.getElementById("demoBalance");
if (amount) amount.textContent = `$${completed.size.toFixed(2)}`;
render();

window.addEventListener("pageshow", (event) => {
  if (!event.persisted) return;
  completed = new Set(readDemo().completed.map((s) => s.id));
  if (featured)
    featured.innerHTML = activeSurveys.slice(0, 3).map(card).join("");
  if (amount) amount.textContent = `$${completed.size.toFixed(2)}`;
  render();
});
