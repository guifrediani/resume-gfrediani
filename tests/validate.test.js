import { test } from "node:test";
import assert from "node:assert/strict";
import { mkdtempSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { validate, formatMessage } from "../src/validate.js";

const ICONS = "icons";

const baseContent = () => ({
  profile: {
    name: "Test Person",
    description: "A description.",
    location: "City, Country",
    email: "test@example.com",
    phone: "+55 11 91234-5678",
    x: { handle: "@test", url: "https://x.com/test" },
  },
  professionalExperience: [
    { title: "Role", description: "Did things.", startDate: "2023-03", endDate: null },
  ],
  academicExperience: [
    { title: "Degree", description: "Studied things.", startDate: "2017-02", endDate: "2021-12" },
  ],
  certifications: [{ title: "Cert", date: "2024-11" }],
  tools: [{ name: "Figma" }],
  languages: [{ name: "English", level: "Fluent" }],
});

const run = (content, opts = { iconsDir: ICONS }) =>
  validate(typeof content === "string" ? content : JSON.stringify(content), opts);

const paths = (messages) => messages.map((m) => m.path);
const find = (messages, path) => messages.find((m) => m.path === path);

test("formatMessage renders SEVERITY path: message", () => {
  assert.equal(
    formatMessage({ severity: "WARN", path: "profile.phone", message: "missing; the phone contact detail will be omitted." }),
    "WARN profile.phone: missing; the phone contact detail will be omitted.",
  );
});

test("valid sample content produces no errors and no warnings", () => {
  const { errors, warnings, content } = run(baseContent());
  assert.deepEqual(errors, []);
  assert.deepEqual(warnings, []);
  assert.equal(content.profile.name, "Test Person");
});

// Structural errors

test("invalid JSON is an error at (root)", () => {
  const { errors, content } = run("{ not json");
  assert.equal(content, null);
  assert.equal(errors.length, 1);
  assert.equal(errors[0].severity, "ERROR");
  assert.equal(errors[0].path, "(root)");
  assert.match(errors[0].message, /^content\/resume\.json is not valid JSON: /);
});

test("missing top-level keys are errors", () => {
  const { errors } = run({});
  assert.deepEqual(paths(errors), [
    "profile",
    "professionalExperience",
    "academicExperience",
    "certifications",
    "tools",
    "languages",
  ]);
});

test("a list key that is not an array is an error with the contract wording", () => {
  const content = baseContent();
  content.certifications = {};
  const { errors } = run(content);
  assert.equal(formatMessage(errors[0]), "ERROR certifications: expected an array, found object.");
});

test("profile that is not an object is an error", () => {
  const content = baseContent();
  content.profile = "nope";
  const { errors } = run(content);
  assert.equal(formatMessage(errors[0]), "ERROR profile: expected an object, found string.");
});

test("a top-level array is an error", () => {
  const { errors } = run("[]");
  assert.equal(formatMessage(errors[0]), "ERROR (root): expected an object, found array.");
});

// Profile rules (User Story 1)

test("blank name and description warn", () => {
  const content = baseContent();
  content.profile.name = "  ";
  delete content.profile.description;
  const { warnings } = run(content);
  assert.ok(find(warnings, "profile.name"));
  assert.ok(find(warnings, "profile.description"));
});

test("malformed email warns and names the omission", () => {
  const content = baseContent();
  content.profile.email = "not-an-email";
  const { warnings } = run(content);
  const w = find(warnings, "profile.email");
  assert.ok(w);
  assert.match(w.message, /will be omitted/);
});

test("X url outside allowed hosts warns with the contract wording", () => {
  const content = baseContent();
  content.profile.x.url = "http://example.com";
  const { warnings } = run(content);
  assert.equal(
    formatMessage(find(warnings, "profile.x.url")),
    'WARN profile.x.url: expected an https://x.com/ or https://twitter.com/ profile, found "http://example.com".',
  );
});

test("twitter.com profile urls are accepted", () => {
  const content = baseContent();
  content.profile.x.url = "https://twitter.com/test";
  const { warnings } = run(content);
  assert.equal(find(warnings, "profile.x.url"), undefined);
});

test("missing contact detail warns with the contract wording", () => {
  const content = baseContent();
  delete content.profile.phone;
  const { warnings } = run(content);
  assert.equal(
    formatMessage(find(warnings, "profile.phone")),
    "WARN profile.phone: missing; the phone contact detail will be omitted.",
  );
});

test("missing x object warns", () => {
  const content = baseContent();
  delete content.profile.x;
  const { warnings } = run(content);
  assert.ok(find(warnings, "profile.x"));
});

test("missing icon file warns with the icons path and reports status", () => {
  const emptyIcons = mkdtempSync(join(tmpdir(), "icons-"));
  const { warnings, content } = run(baseContent(), { iconsDir: emptyIcons });
  assert.equal(
    formatMessage(find(warnings, "icons/e-mail.png")),
    "WARN icons/e-mail.png: file not found; the e-mail detail will render without an icon.",
  );
  assert.equal(content.iconStatus.email, false);
  assert.equal(content.iconStatus.x, false);
});

test("icon status is true when files exist", () => {
  const { content } = run(baseContent());
  assert.deepEqual(content.iconStatus, { location: true, email: true, phone: true, x: true });
});

test("a missing icon does not warn when its contact detail is absent", () => {
  const emptyIcons = mkdtempSync(join(tmpdir(), "icons-"));
  const content = baseContent();
  delete content.profile.phone;
  const { warnings } = run(content, { iconsDir: emptyIcons });
  assert.equal(find(warnings, "icons/phone.png"), undefined);
});

// Experience rules (User Story 2)

test("blank experience title and description warn with bracket paths", () => {
  const content = baseContent();
  content.professionalExperience.push({ title: "", description: " ", startDate: "2020-01" });
  const { warnings } = run(content);
  assert.ok(find(warnings, "professionalExperience[1].title"));
  assert.ok(find(warnings, "professionalExperience[1].description"));
});

test("academic experience description is optional", () => {
  const content = baseContent();
  delete content.academicExperience[0].description;
  const { warnings } = run(content);
  assert.equal(find(warnings, "academicExperience[0].description"), undefined);
});

test("malformed startDate warns with the contract wording", () => {
  const content = baseContent();
  content.academicExperience[0].startDate = "2024-13";
  const { warnings } = run(content);
  assert.equal(
    formatMessage(find(warnings, "academicExperience[0].startDate")),
    'WARN academicExperience[0].startDate: expected YYYY-MM, found "2024-13".',
  );
});

test("missing startDate warns", () => {
  const content = baseContent();
  delete content.professionalExperience[0].startDate;
  const { warnings } = run(content);
  assert.ok(find(warnings, "professionalExperience[0].startDate"));
});

test("endDate null or omitted is accepted silently", () => {
  const content = baseContent();
  content.professionalExperience.push({ title: "A", description: "B", startDate: "2020-01" });
  const { warnings } = run(content);
  assert.deepEqual(warnings, []);
});

test("malformed endDate warns", () => {
  const content = baseContent();
  content.professionalExperience[0].endDate = "2024-13";
  const { warnings } = run(content);
  assert.equal(
    formatMessage(find(warnings, "professionalExperience[0].endDate")),
    'WARN professionalExperience[0].endDate: expected YYYY-MM, found "2024-13".',
  );
});

test("startDate after endDate warns on the entry path", () => {
  const content = baseContent();
  content.professionalExperience.push({ title: "A", description: "B", startDate: "2023-05", endDate: "2022-01" });
  const { warnings } = run(content);
  assert.equal(
    formatMessage(find(warnings, "professionalExperience[1]")),
    "WARN professionalExperience[1]: startDate 2023-05 is after endDate 2022-01.",
  );
});

test("a non-object experience entry warns and is skipped", () => {
  const content = baseContent();
  content.academicExperience.push("oops");
  const { warnings } = run(content);
  assert.match(find(warnings, "academicExperience[1]").message, /expected an object, found string/);
});

// Certification and language rules (User Story 3)

test("certification with blank title or bad date warns", () => {
  const content = baseContent();
  content.certifications.push({ title: "", date: "2024" });
  const { warnings } = run(content);
  assert.ok(find(warnings, "certifications[1].title"));
  assert.equal(
    formatMessage(find(warnings, "certifications[1].date")),
    'WARN certifications[1].date: expected YYYY-MM, found "2024".',
  );
});

test("language with blank name or level warns", () => {
  const content = baseContent();
  content.languages.push({ name: "", level: "" });
  const { warnings } = run(content);
  assert.ok(find(warnings, "languages[1].name"));
  assert.ok(find(warnings, "languages[1].level"));
});

test("tool with blank name warns and a non-object tool entry warns", () => {
  const content = baseContent();
  content.tools.push({ name: " " }, "Jira");
  const { warnings } = run(content);
  assert.equal(
    formatMessage(find(warnings, "tools[1].name")),
    "WARN tools[1].name: missing or blank; expected the tool name.",
  );
  assert.match(find(warnings, "tools[2]").message, /expected an object, found string/);
});

test("empty lists warn with the contract wording for each list", () => {
  const content = baseContent();
  for (const key of ["professionalExperience", "academicExperience", "certifications", "tools", "languages"]) {
    content[key] = [];
  }
  const { warnings } = run(content);
  assert.equal(
    formatMessage(find(warnings, "languages")),
    'WARN languages: list is empty; the section will show "No entries yet."',
  );
  for (const key of ["professionalExperience", "academicExperience", "certifications", "tools"]) {
    assert.ok(find(warnings, key), `${key} should warn when empty`);
  }
});

test("validate reads a file written to disk the same as inline text", () => {
  const dir = mkdtempSync(join(tmpdir(), "content-"));
  const file = join(dir, "resume.json");
  writeFileSync(file, JSON.stringify(baseContent()));
  const { errors } = run(JSON.stringify(baseContent()));
  assert.deepEqual(errors, []);
});
