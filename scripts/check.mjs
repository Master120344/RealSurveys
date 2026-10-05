import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { activeSurveys } from "../js/catalog.js";
import { getQuestion, noRecentExperience } from "../js/questions.js";
let count = 0;
for (const survey of activeSurveys) {
  for (let route = 0; route < 30; route++) {
    const answers = [];
    for (let step = 0; step < 10; step++) {
      const q = getQuestion(survey, step, answers);
      assert(q.prompt && q.options.length >= 3, `${survey.id} step ${step}`);
      assert(q.options.every((x) => typeof x === "string" && x.length));
      answers[step] =
        step === 0 && route === 0
          ? noRecentExperience
          : q.options[route % q.options.length];
      count++;
    }
  }
  assert(fs.existsSync(path.join("surveycards", survey.image)));
}
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
for (const name of pages) {
  const html = fs.readFileSync(name + ".html", "utf8");
  for (const match of html.matchAll(/(?:href|src)="([^"#][^"]*)"/g)) {
    const value = match[1];
    if (/^[a-z]+:/.test(value)) continue;
    const target = value.split(/[?#]/)[0];
    assert(fs.existsSync(target), `${name}: missing ${target}`);
  }
}
assert(!fs.existsSync("dist/.env"));
assert(!fs.existsSync("dist/js/.env"));
console.log(
  `Passed ${count} question instances and all public page asset/link references.`,
);
