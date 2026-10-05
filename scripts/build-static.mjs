import { mkdirSync, rmSync, copyFileSync, cpSync, existsSync } from "node:fs";
const pages = [
  "index",
  "surveys",
  "survey",
  "login",
  "register",
  "balance",
  "contact",
  "giveaways",
  "privacy",
];
rmSync("dist", { recursive: true, force: true });
mkdirSync("dist");
for (const page of pages) copyFileSync(`${page}.html`, `dist/${page}.html`);
for (const dir of ["assets", "surveycards"])
  cpSync(dir, `dist/${dir}`, { recursive: true });
mkdirSync("dist/css");
copyFileSync("css/site.css", "dist/css/site.css");
mkdirSync("dist/js");
for (const f of [
  "site",
  "characters",
  "demo-session",
  "catalog",
  "questions",
  "login",
  "register",
  "surveys",
  "survey",
  "balance",
  "firebase-config",
])
  copyFileSync(`js/${f}.js`, `dist/js/${f}.js`);
// Keep the existing mobile/desktop entry links, while publishing only the audited application.
for (const page of pages)
  for (const kind of ["mobile", "desktop"]) {
    const p = `${page}_${kind}.html`;
    if (existsSync(p)) copyFileSync(p, `dist/${p}`);
  }
console.log(
  "Built static preview. Legacy scripts, environment files, and credentials excluded.",
);
