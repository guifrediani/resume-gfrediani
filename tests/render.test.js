import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import {
  renderPage,
  renderSections,
  renderAbout,
  renderExperienceSection,
  renderCertifications,
  renderTools,
  renderLanguages,
} from "../src/render.js";

const template = readFileSync(new URL("../src/template.html", import.meta.url), "utf8");

const allIcons = { location: true, email: true, phone: true, x: true };

const fixture = () => ({
  profile: {
    name: "Test Person",
    description: "Line one.\nLine two.",
    location: "City, Country",
    email: "test@example.com",
    phone: "+55 (11) 91234-5678",
    x: { handle: "test", url: "https://x.com/test" },
  },
  iconStatus: allIcons,
  professionalExperience: [
    { title: "Old Role", description: "Older.", startDate: "2019-01", endDate: "2020-06" },
    { title: "New Role", description: "Newer.", startDate: "2023-03", endDate: null },
  ],
  academicExperience: [
    { title: "Degree", description: "Studied.", startDate: "2017-02", endDate: "2021-12" },
  ],
  certifications: [
    { title: "Cert B", date: "2022-05" },
    { title: "Cert A", date: "2024-11" },
  ],
  tools: [{ name: "Figma" }, { name: "Jira" }],
  languages: [
    { name: "Portuguese", level: "Native" },
    { name: "English", level: "C1" },
  ],
});

const SECTION_IDS = ["about", "professional-experience", "academic-experience", "certifications", "tools", "languages"];

function indexOfAll(html, needles) {
  return needles.map((n) => {
    const i = html.indexOf(n);
    assert.notEqual(i, -1, `expected to find ${n}`);
    return i;
  });
}

test("renderPage fills title, description, name, year and contains the five sections in order", () => {
  const html = renderPage(fixture(), template);
  assert.ok(html.includes("<title>Test Person - Resume</title>"));
  assert.ok(html.includes('<meta name="description" content="Line one. Line two.">'));
  assert.ok(html.includes(`© ${new Date().getUTCFullYear()} Test Person`));
  assert.equal((html.match(/<h1[\s>]/g) ?? []).length, 1);
  const positions = indexOfAll(html, SECTION_IDS.map((id) => `<section id="${id}"`));
  assert.deepEqual([...positions].sort((a, b) => a - b), positions);
  assert.ok(!html.includes("{{"), "no placeholders remain");
});

test("renderPage escapes profile values inserted into the template", () => {
  const content = fixture();
  content.profile.name = "Tom & <Jerry>";
  const html = renderPage(content, template);
  assert.ok(html.includes("<title>Tom &amp; &lt;Jerry&gt; - Resume</title>"));
  assert.ok(!html.includes("<Jerry>"));
});

test("renderSections returns sections in the fixed order with aria-labelledby", () => {
  const html = renderSections(fixture());
  for (const id of SECTION_IDS) {
    assert.ok(html.includes(`<section id="${id}"`));
    assert.ok(html.includes(`aria-labelledby="${id}-heading"`));
  }
});

test("about section renders h1, paragraphs, and contacts in order with icons", () => {
  const html = renderAbout(fixture().profile, allIcons);
  assert.ok(html.includes('<h1 id="about-heading" class="heading heading--display">Test Person</h1>'));
  assert.ok(html.includes("<p>Line one.</p>\n<p>Line two.</p>"));
  const positions = indexOfAll(html, [
    'contact-list__item--location',
    'contact-list__item--email',
    'contact-list__item--phone',
    'contact-list__item--x',
  ]);
  assert.deepEqual([...positions].sort((a, b) => a - b), positions);
  for (const file of ["location.png", "e-mail.png", "phone.png", "x.png"]) {
    assert.ok(html.includes(`<img class="contact-list__icon" src="icons/${file}" alt="" width="24" height="24">`), file);
  }
});

test("about section links e-mail with mailto and phone with normalized tel", () => {
  const html = renderAbout(fixture().profile, allIcons);
  assert.ok(html.includes('<a href="mailto:test@example.com">test@example.com</a>'));
  assert.ok(html.includes('<a href="tel:+5511912345678">+55&nbsp;(11)&nbsp;91234&#8209;5678</a>'));
});

test("X link opens in a new tab, is marked external, and gets a leading @", () => {
  const html = renderAbout(fixture().profile, allIcons);
  assert.ok(html.includes('<a href="https://x.com/test" target="_blank" rel="noopener noreferrer">@test<span class="external-mark" aria-hidden="true">↗</span><span class="visually-hidden">(opens in a new tab)</span></a>'));
});

test("blank contact details are omitted entirely", () => {
  const profile = fixture().profile;
  profile.phone = "";
  delete profile.location;
  const html = renderAbout(profile, allIcons);
  assert.ok(!html.includes("contact-list__item--phone"));
  assert.ok(!html.includes("contact-list__item--location"));
  assert.ok(html.includes("contact-list__item--email"));
});

test("a missing icon file renders the detail as text without an image", () => {
  const html = renderAbout(fixture().profile, { ...allIcons, email: false });
  assert.ok(!html.includes("icons/e-mail.png"));
  assert.ok(html.includes('href="mailto:test@example.com"'));
});

test("content is HTML-escaped", () => {
  const profile = fixture().profile;
  profile.description = "Uses <b>bold</b> & more";
  const html = renderAbout(profile, allIcons);
  assert.ok(html.includes("Uses &lt;b&gt;bold&lt;/b&gt; &amp; more"));
  assert.ok(!html.includes("<b>"));
});

test("experience entries render title, two dates, and description, newest first", () => {
  const html = renderExperienceSection("professional-experience", "Professional Experience", fixture().professionalExperience);
  assert.ok(html.includes('<h2 id="professional-experience-heading" class="heading heading--2">Professional Experience</h2>'));
  assert.ok(html.includes('<ol class="entry-list">'));
  const positions = indexOfAll(html, ["New Role", "Old Role"]);
  assert.ok(positions[0] < positions[1], "newest entry first");
  assert.ok(html.includes('<time datetime="2019-01">Jan 2019</time> – <time datetime="2020-06">Jun 2020</time>'));
  assert.ok(html.includes("<p>Older.</p>"));
  assert.ok(html.includes('<h3 class="entry__title heading heading--4">Old Role</h3>'));
});

test("ongoing entries render Present without a datetime and get the current class", () => {
  const html = renderExperienceSection("academic-experience", "Academic Experience", [
    { title: "Now", description: "d", startDate: "2023-03" },
  ]);
  assert.ok(html.includes('<li class="entry entry--current">'));
  assert.ok(html.includes('<time datetime="2023-03">Mar 2023</time> – <span class="entry__present">Present</span>'));
});

test("malformed dates fall back to the raw string", () => {
  const html = renderExperienceSection("academic-experience", "Academic Experience", [
    { title: "T", description: "d", startDate: "2020-01", endDate: "2024-13" },
  ]);
  assert.ok(html.includes("– 2024-13</p>"));
});

test("certifications keep file order and format dates", () => {
  const html = renderCertifications(fixture().certifications);
  const positions = indexOfAll(html, ["Cert B", "Cert A"]);
  assert.ok(positions[0] < positions[1], "file order preserved, not sorted");
  assert.ok(html.includes('<time datetime="2024-11">Nov 2024</time>'));
  assert.ok(html.includes('<ul class="entry-list entry-list--compact">'));
  assert.ok(html.includes('class="entry__title heading heading--5">Cert B</h3>'));
});

test("tools render as tags in file order with escaping", () => {
  const html = renderTools([{ name: "Figma" }, { name: "Jira" }, { name: "A <b>C</b>" }, { name: "  " }, "bad"]);
  assert.ok(html.includes('<h2 id="tools-heading" class="heading heading--2">Tools &amp; Games</h2>'));
  assert.ok(html.includes('<section id="tools" class="section content-gutter" aria-labelledby="tools-heading">'));
  assert.ok(html.includes('<ul class="tool-list">'));
  const positions = indexOfAll(html, ['<li class="tool tag">Figma</li>', '<li class="tool tag">Jira</li>']);
  assert.ok(positions[0] < positions[1], "file order preserved");
  assert.ok(html.includes('<li class="tool tag">A &lt;b&gt;C&lt;/b&gt;</li>'));
  assert.ok(!html.includes("<b>"));
  assert.equal((html.match(/<li class="tool tag">/g) ?? []).length, 3, "blank and non-object entries skipped");
});

test("empty tools list renders the No entries yet message and keeps the heading", () => {
  const html = renderTools([]);
  assert.ok(html.includes('<p class="copy copy--muted entry-list--empty">No entries yet.</p>'));
  assert.ok(!html.includes("<ul"));
  assert.ok(html.includes('<h2 id="tools-heading"'));
});

test("tools section sits between certifications and languages", () => {
  const html = renderSections(fixture());
  const c = html.indexOf('<section id="certifications"');
  const t = html.indexOf('<section id="tools"');
  const l = html.indexOf('<section id="languages"');
  assert.ok(c < t && t < l);
});

test("languages render name and level tag in file order", () => {
  const html = renderLanguages(fixture().languages);
  const positions = indexOfAll(html, ["Portuguese", "English"]);
  assert.ok(positions[0] < positions[1]);
  assert.ok(html.includes('<span class="language__level tag">C1</span>'));
  assert.ok(html.includes('<ul class="language-list">'));
});

test("empty lists render the No entries yet message and no list element", () => {
  const empty = '<p class="copy copy--muted entry-list--empty">No entries yet.</p>';
  const exp = renderExperienceSection("professional-experience", "Professional Experience", []);
  assert.ok(exp.includes(empty));
  assert.ok(!exp.includes("<ol"));
  const cert = renderCertifications([]);
  assert.ok(cert.includes(empty));
  assert.ok(!cert.includes("<ul"));
  const lang = renderLanguages([]);
  assert.ok(lang.includes(empty));
  assert.ok(!lang.includes("<ul"));
  assert.ok(lang.includes("<h2"), "heading still present");
});

test("professional entries show the company under the title and hide it when blank", () => {
  const html = renderExperienceSection("professional-experience", "Professional Experience", [
    { title: "Owner", company: "Acme <Games>", description: "d", startDate: "2024-01" },
    { title: "Intern", company: "  ", description: "d", startDate: "2020-01", endDate: "2021-01" },
  ]);
  assert.ok(html.includes('<p class="entry__company">Acme &lt;Games&gt;</p>'));
  assert.ok(html.indexOf("Owner</h3>") < html.indexOf("entry__company"));
  assert.equal((html.match(/entry__company/g) ?? []).length, 1);
});
