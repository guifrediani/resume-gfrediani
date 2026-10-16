import { test } from "node:test";
import assert from "node:assert/strict";
import { parseResume, describePath } from "../src/markdown.js";

const sample = `<!-- editor notes are ignored -->
---
name: Test Person
location: City, Country
email: test@example.com
phone: +55 11 91234-5678
linkedin: https://www.linkedin.com/in/test/
x: https://x.com/test
x-handle: @test
---

# About

Hello **world**.

# Match History

## Product Owner
company: Acme
start: 2024-01
end: present

Intro paragraph.

- First win
- Second win

### Highlights

See [the launch](https://example.com/launch).

<b>raw</b>

## Intern
company: Acme
start: 2022-01
end: 2023-01

# Quests Completed

## Degree
start: 2018-02
end: 2021-12

# Achievements

## Certificate
date: 2024-05

# Tools & Games

- Jira
- League of Legends

# Languages

- Portuguese: Native
- English: Fluent
`;

test("front matter becomes the profile, including LinkedIn and X", () => {
  const { content, errors, warnings } = parseResume(sample);
  assert.deepEqual(errors, []);
  assert.deepEqual(warnings, []);
  const { name, location, email, phone, linkedin, x } = content.profile;
  assert.deepEqual(
    { name, location, email, phone, linkedin, x },
    {
      name: "Test Person",
      location: "City, Country",
      email: "test@example.com",
      phone: "+55 11 91234-5678",
      linkedin: "https://www.linkedin.com/in/test/",
      x: { handle: "@test", url: "https://x.com/test" },
    },
  );
  assert.equal(content.profile.descriptionHtml, "<p>Hello <strong>world</strong>.</p>");
  assert.equal(content.profile.description, "Hello world.");
});

test("entries read their key: value lines, and end: present means ongoing", () => {
  const { content } = parseResume(sample);
  const [owner, intern] = content.professionalExperience;
  assert.equal(owner.title, "Product Owner");
  assert.equal(owner.company, "Acme");
  assert.equal(owner.startDate, "2024-01");
  assert.equal(owner.endDate, null);
  assert.equal(intern.endDate, "2023-01");
  assert.equal(intern.descriptionHtml, "");
  assert.equal(content.academicExperience[0].startDate, "2018-02");
  assert.deepEqual(
    content.certifications.map(({ title, date }) => ({ title, date })),
    [{ title: "Certificate", date: "2024-05" }],
  );
});

test("descriptions support bullets, shifted sub-headings, and external links; raw HTML is escaped", () => {
  const html = parseResume(sample).content.professionalExperience[0].descriptionHtml;
  assert.ok(html.includes("<ul>\n<li>First win</li>\n<li>Second win</li>\n</ul>"));
  assert.ok(html.includes('<h4 class="md-heading">Highlights</h4>'), "### renders below the h3 entry title");
  assert.ok(html.includes('<a href="https://example.com/launch" target="_blank" rel="noopener noreferrer">the launch'));
  assert.ok(html.includes("&lt;b&gt;raw&lt;/b&gt;"));
  assert.ok(!html.includes("<b>"));
});

test("tools and languages come from bullet lists", () => {
  const { content } = parseResume(sample);
  assert.deepEqual(content.tools.map((t) => t.name), ["Jira", "League of Legends"]);
  assert.deepEqual(
    content.languages.map(({ name, level }) => ({ name, level })),
    [{ name: "Portuguese", level: "Native" }, { name: "English", level: "Fluent" }],
  );
});

test("an unknown section is an error with its line number", () => {
  const { content, errors } = parseResume(sample.replace("# Quests Completed", "# Education"));
  assert.equal(content, null);
  assert.equal(errors.length, 1);
  assert.match(errors[0].path, /^content\/resume\.md:\d+$/);
  assert.match(errors[0].message, /unknown section "# Education"/);
});

test("missing front matter is an error", () => {
  const { content, errors } = parseResume("# About\n\nHi\n");
  assert.equal(content, null);
  assert.match(errors[0].message, /front matter/);
});

test("a missing section warns but still parses", () => {
  const { content, warnings } = parseResume(sample.replace(/# Languages[\s\S]*$/, ""));
  assert.deepEqual(content.languages, []);
  assert.ok(warnings.some((w) => /"# Languages" is missing/.test(w.message)));
});

test("line numbers survive editor comments spanning several lines", () => {
  const text = `<!--\none\ntwo\n-->\n${sample}`;
  const { content } = parseResume(text);
  const lines = text.split("\n");
  assert.equal(lines[content.professionalExperience[0]._line - 1], "## Product Owner");
});

test("validator paths point to the Markdown line and item", () => {
  const { content } = parseResume(sample);
  const line = content.professionalExperience[0]._line;
  assert.equal(
    describePath("professionalExperience[0].startDate", content),
    `content/resume.md:${line} (Match History › "Product Owner" › start)`,
  );
  assert.match(describePath("profile.x.url", content), /^content\/resume\.md:\d+ \(front matter › x\)$/);
});
