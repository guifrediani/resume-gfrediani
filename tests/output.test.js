import { test, before } from "node:test";
import assert from "node:assert/strict";
import { execFileSync, spawnSync } from "node:child_process";
import { mkdtempSync, readdirSync, readFileSync, writeFileSync, existsSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = fileURLToPath(new URL("..", import.meta.url));
const BUILD = join(ROOT, "src", "build.js");
const CONTENT = join(ROOT, "content", "resume.json");
const SECTION_IDS = ["about", "professional-experience", "academic-experience", "certifications", "tools", "languages"];

let out;
let html;
let stdout;

before(() => {
  out = mkdtempSync(join(tmpdir(), "resume-dist-"));
  stdout = execFileSync(process.execPath, [BUILD, "--out", out, "--content", CONTENT], { encoding: "utf8" });
  html = readFileSync(join(out, "index.html"), "utf8");
});

test("build prints the summary line and copies assets", () => {
  assert.match(stdout, /^Built .*index\.html \(0 errors, \d+ warnings\)\s*$/);
  assert.ok(existsSync(join(out, "styles.css")));
  assert.ok(existsSync(join(out, "enhance.js")));
  for (const file of ["location.png", "e-mail.png", "phone.png", "x.png"]) {
    assert.ok(existsSync(join(out, "icons", file)), file);
  }
});

test("exactly one HTML file is produced", () => {
  const htmlFiles = readdirSync(out).filter((f) => f.toLowerCase().endsWith(".html"));
  assert.deepEqual(htmlFiles, ["index.html"]);
});

test("document is English-US, loads only its own enhancement script, and has no input surface", () => {
  assert.ok(html.includes('<html lang="en-US">'));
  for (const tag of ["<form", "<input", "<textarea", "<button"]) {
    assert.ok(!html.toLowerCase().includes(tag), `${tag} must not appear`);
  }
  const sources = [...html.matchAll(/<script\b[^>]*\bsrc="([^"]+)"/g)].map((m) => m[1]);
  assert.deepEqual(sources, ["enhance.js"]);
});

test("the five sections appear in the fixed order", () => {
  const positions = SECTION_IDS.map((id) => html.indexOf(`<section id="${id}"`));
  assert.ok(positions.every((p) => p >= 0), "all sections present");
  assert.deepEqual([...positions].sort((a, b) => a - b), positions);
});

test("every nav link is a fragment that resolves to an id on the page", () => {
  const ids = new Set([...html.matchAll(/\sid="([^"]+)"/g)].map((m) => m[1]));
  const nav = html.slice(html.indexOf("<nav"), html.indexOf("</nav>"));
  const hrefs = [...nav.matchAll(/href="([^"]+)"/g)].map((m) => m[1]);
  assert.equal(hrefs.length, 6);
  assert.ok(hrefs.includes("#tools"));
  for (const href of hrefs) {
    assert.ok(href.startsWith("#"), `${href} must be a fragment`);
    assert.ok(ids.has(href.slice(1)), `${href} must resolve to an id`);
  }
});

test("skip link, brand link, and back-to-top link target existing ids", () => {
  const ids = new Set([...html.matchAll(/\sid="([^"]+)"/g)].map((m) => m[1]));
  assert.ok(html.includes('class="skip-link" href="#main"'));
  assert.ok(html.includes('class="site-header__brand" href="#about"'));
  assert.ok(html.includes('href="#top"'));
  for (const id of ["main", "about", "top"]) assert.ok(ids.has(id), id);
});

test("no link leaves the page except mailto, tel, and marked external links", () => {
  const anchors = [...html.matchAll(/<a\s[^>]*>/g)].map((m) => m[0]);
  for (const a of anchors) {
    const href = a.match(/href="([^"]*)"/)?.[1] ?? "";
    if (href.startsWith("#") || href.startsWith("mailto:") || href.startsWith("tel:")) continue;
    assert.ok(/^https?:\/\//.test(href), `${href} must be absolute, not another page`);
    assert.ok(!/\.html?(["#?]|$)/.test(href), `${href} must not point to another HTML file`);
    assert.ok(a.includes('target="_blank"'), `${href} must open in a new tab`);
    assert.ok(a.includes('rel="noopener noreferrer"'), `${href} must have rel`);
  }
});

test("each contact detail in the sample content has its icon image", () => {
  const content = JSON.parse(readFileSync(CONTENT, "utf8"));
  const expected = [
    [content.profile.location, "location.png"],
    [content.profile.email, "e-mail.png"],
    [content.profile.phone, "phone.png"],
    [content.profile.x?.url, "x.png"],
  ];
  for (const [value, file] of expected) {
    if (value) assert.ok(html.includes(`src="icons/${file}"`), file);
  }
});

test("no element declares a fixed width wider than 360px", () => {
  const widths = [...html.matchAll(/width="(\d+)"/g)].map((m) => Number(m[1]));
  assert.ok(widths.every((w) => w <= 360), `widths found: ${widths.join(", ")}`);
  assert.ok(!/style="[^"]*(min-)?width:\s*(\d{3,})px/.test(html));
});

test("warnings do not block the build but --strict does", () => {
  const dir = mkdtempSync(join(tmpdir(), "resume-warn-"));
  const content = JSON.parse(readFileSync(CONTENT, "utf8"));
  content.professionalExperience[0].endDate = "2024-13";
  const file = join(dir, "resume.json");
  writeFileSync(file, JSON.stringify(content));

  const lenient = spawnSync(process.execPath, [BUILD, "--out", join(dir, "out"), "--content", file], { encoding: "utf8" });
  assert.equal(lenient.status, 0);
  assert.match(lenient.stderr, /WARN professionalExperience\[0\]\.endDate: expected YYYY-MM, found "2024-13"\./);
  assert.ok(existsSync(join(dir, "out", "index.html")));

  const strict = spawnSync(process.execPath, [BUILD, "--strict", "--out", join(dir, "strict"), "--content", file], { encoding: "utf8" });
  assert.equal(strict.status, 1);
  assert.ok(!existsSync(join(dir, "strict", "index.html")));
});

test("structural errors exit 1 and usage errors exit 2", () => {
  const dir = mkdtempSync(join(tmpdir(), "resume-err-"));
  const bad = join(dir, "bad.json");
  writeFileSync(bad, "{ not json");
  const err = spawnSync(process.execPath, [BUILD, "--out", join(dir, "out"), "--content", bad], { encoding: "utf8" });
  assert.equal(err.status, 1);
  assert.match(err.stderr, /^ERROR \(root\): content\/resume\.json is not valid JSON/m);

  const unknown = spawnSync(process.execPath, [BUILD, "--bogus"], { encoding: "utf8" });
  assert.equal(unknown.status, 2);

  const missing = spawnSync(process.execPath, [BUILD, "--out", join(dir, "out"), "--content", join(dir, "nope.json")], { encoding: "utf8" });
  assert.equal(missing.status, 2);
});
