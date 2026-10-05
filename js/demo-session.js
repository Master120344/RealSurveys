// Guest progress is an explicitly local preview, never an authentication or payment boundary.
const KEY = "mrs-preview-v1";
const empty = () => ({ guest: false, completed: [] });
export function readDemo() {
  try {
    const d = JSON.parse(sessionStorage.getItem(KEY));
    return d && Array.isArray(d.completed) ? d : empty();
  } catch {
    return empty();
  }
}
export function writeDemo(value) {
  try {
    sessionStorage.setItem(KEY, JSON.stringify(value));
    return true;
  } catch {
    return false;
  }
}
export function enterGuest() {
  try {
    sessionStorage.removeItem("mrs-account-mode");
  } catch {}
  const d = readDemo();
  d.guest = true;
  return writeDemo(d);
}
export function exitGuest() {
  const d = readDemo();
  d.guest = false;
  writeDemo(d);
}
export function completeDemo(id) {
  const d = readDemo();
  if (!d.completed.some((x) => x.id === id))
    d.completed.push({ id, at: new Date().toISOString() });
  return writeDemo(d);
}
export function safeNext() {
  const n = new URLSearchParams(location.search).get("next");
  return n &&
    /^(survey\.html\?brand=[a-z]+|surveys\.html|balance\.html)$/.test(n)
    ? n
    : "surveys.html";
}
export const escapeHTML = (value) =>
  String(value ?? "").replace(
    /[&<>"']/g,
    (c) =>
      ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[
        c
      ],
  );
