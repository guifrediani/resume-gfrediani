// Pure rendering: content object in, HTML string out. Markup follows
// specs/001-one-page-resume/contracts/page-structure.md.

import {
  escapeHtml,
  paragraphs,
  formatYearMonth,
  isYearMonth,
  sortByStartDate,
  normalizeTel,
  ensureHandle,
} from "./format.js";

const EMPTY_MESSAGE = '<p class="copy copy--muted entry-list--empty">No entries yet.</p>';

const isBlank = (value) => typeof value !== "string" || value.trim().length === 0;
const isObject = (value) => value !== null && typeof value === "object" && !Array.isArray(value);

/** Fills the template placeholders and returns the complete page. */
export function renderPage(content, template) {
  const name = isBlank(content.profile?.name) ? "Resume" : content.profile.name.trim();
  const description = isBlank(content.profile?.description) ? "" : content.profile.description.trim();
  const values = {
    title: `${name} - Resume`,
    metaDescription: description.replace(/\s+/g, " ").slice(0, 160),
    name,
    year: String(new Date().getUTCFullYear()),
  };
  let html = template;
  for (const [key, value] of Object.entries(values)) {
    html = html.replaceAll(`{{${key}}}`, escapeHtml(value));
  }
  return html.replace("{{sections}}", renderSections(content));
}

/** The five sections in their fixed order. */
export function renderSections(content) {
  return [
    renderAbout(content.profile ?? {}, content.iconStatus ?? {}),
    renderExperienceSection("professional-experience", "Professional Experience", content.professionalExperience ?? []),
    renderExperienceSection("academic-experience", "Academic Experience", content.academicExperience ?? []),
    renderCertifications(content.certifications ?? []),
    renderTools(content.tools ?? []),
    renderLanguages(content.languages ?? []),
  ].join("\n");
}

function icon(kind, file, iconStatus) {
  if (iconStatus[kind] === false) return "";
  return `<img class="contact-list__icon" src="icons/${file}" alt="" width="24" height="24">`;
}

export function renderAbout(profile, iconStatus = {}) {
  const items = [];

  if (!isBlank(profile.location)) {
    items.push(`<li class="contact-list__item contact-list__item--location">
        ${icon("location", "location.png", iconStatus)}
        <span>${escapeHtml(profile.location.trim())}</span>
      </li>`);
  }

  if (!isBlank(profile.email) && /^[^@\s]+@[^@\s]+$/.test(profile.email.trim())) {
    const email = profile.email.trim();
    items.push(`<li class="contact-list__item contact-list__item--email">
        ${icon("email", "e-mail.png", iconStatus)}
        <a href="mailto:${escapeHtml(email)}">${escapeHtml(email)}</a>
      </li>`);
  }

  if (!isBlank(profile.phone)) {
    const phone = profile.phone.trim();
    // Non-breaking space and hyphen keep the number on one line (html-validate tel-non-breaking).
    const phoneText = escapeHtml(phone).replaceAll(" ", "&nbsp;").replaceAll("-", "&#8209;");
    items.push(`<li class="contact-list__item contact-list__item--phone">
        ${icon("phone", "phone.png", iconStatus)}
        <a href="tel:${escapeHtml(normalizeTel(phone))}">${phoneText}</a>
      </li>`);
  }

  if (isObject(profile.x) && !isBlank(profile.x.url)) {
    const url = profile.x.url.trim();
    const handle = ensureHandle(isBlank(profile.x.handle) ? url.replace(/^https:\/\/[^/]+\//, "").replace(/\/$/, "") : profile.x.handle);
    items.push(`<li class="contact-list__item contact-list__item--x">
        ${icon("x", "x.png", iconStatus)}
        <a href="${escapeHtml(url)}" target="_blank" rel="noopener noreferrer">${escapeHtml(handle)}<span class="external-mark" aria-hidden="true">↗</span><span class="visually-hidden">(opens in a new tab)</span></a>
      </li>`);
  }

  const name = isBlank(profile.name) ? "Your Name" : profile.name.trim();
  const contacts = items.length > 0 ? `<ul class="contact-list">\n      ${items.join("\n      ")}\n    </ul>` : "";

  return `<section id="about" class="section section--about content-gutter" aria-labelledby="about-heading">
    <div class="section__inner">
      <p class="eyebrow section--about__eyebrow">Resume</p>
      <h1 id="about-heading" class="heading heading--display">${escapeHtml(name)}</h1>
      <div class="copy copy--large section--about__description">
        ${paragraphs(profile.description)}
      </div>
      ${contacts}
    </div>
  </section>`;
}

function renderDate(value) {
  if (isYearMonth(value)) {
    return `<time datetime="${value}">${formatYearMonth(value)}</time>`;
  }
  return escapeHtml(String(value));
}

export function renderExperienceSection(id, heading, entries) {
  const valid = entries.filter(isObject);
  const items = sortByStartDate(valid).map((entry) => {
    const ongoing = entry.endDate === undefined || entry.endDate === null;
    const classes = ongoing ? "entry entry--current" : "entry";
    const start = entry.startDate === undefined ? "" : renderDate(entry.startDate);
    const end = ongoing ? '<span class="entry__present">Present</span>' : renderDate(entry.endDate);
    return `<li class="${classes}">
          <h3 class="entry__title heading heading--4">${escapeHtml(isBlank(entry.title) ? "Untitled" : entry.title.trim())}</h3>
          <p class="entry__dates eyebrow">${start} – ${end}</p>
${isBlank(entry.description) ? "" : `
          <div class="entry__description copy">
            ${paragraphs(entry.description)}
          </div>`}
        </li>`;
  });

  const body = items.length > 0 ? `<ol class="entry-list">\n        ${items.join("\n        ")}\n      </ol>` : EMPTY_MESSAGE;

  return `<section id="${id}" class="section content-gutter" aria-labelledby="${id}-heading">
    <div class="section__inner">
      <div class="section__header">
        <h2 id="${id}-heading" class="heading heading--2">${heading}</h2>
      </div>
      ${body}
    </div>
  </section>`;
}

export function renderCertifications(list) {
  const items = list.filter(isObject).map(
    (entry) => `<li class="entry entry--compact">
          <h3 class="entry__title heading heading--5">${escapeHtml(isBlank(entry.title) ? "Untitled" : entry.title.trim())}</h3>
          <p class="entry__dates eyebrow eyebrow--gold">${entry.date === undefined ? "" : renderDate(entry.date)}</p>
        </li>`,
  );
  const body = items.length > 0 ? `<ul class="entry-list entry-list--compact">\n        ${items.join("\n        ")}\n      </ul>` : EMPTY_MESSAGE;

  return `<section id="certifications" class="section content-gutter" aria-labelledby="certifications-heading">
    <div class="section__inner">
      <div class="section__header">
        <h2 id="certifications-heading" class="heading heading--2">Certifications</h2>
      </div>
      ${body}
    </div>
  </section>`;
}

export function renderTools(list) {
  const items = list
    .filter((entry) => isObject(entry) && !isBlank(entry.name))
    .map((entry) => `<li class="tool tag">${escapeHtml(entry.name.trim())}</li>`);
  const body = items.length > 0 ? `<ul class="tool-list">\n        ${items.join("\n        ")}\n      </ul>` : EMPTY_MESSAGE;

  return `<section id="tools" class="section content-gutter" aria-labelledby="tools-heading">
    <div class="section__inner">
      <div class="section__header">
        <h2 id="tools-heading" class="heading heading--2">Tools &amp; Games</h2>
      </div>
      ${body}
    </div>
  </section>`;
}

export function renderLanguages(list) {
  const items = list.filter(isObject).map(
    (entry) => `<li class="language">
          <span class="language__name heading heading--5">${escapeHtml(isBlank(entry.name) ? "Unnamed" : entry.name.trim())}</span>
          <span class="language__level tag">${escapeHtml(isBlank(entry.level) ? "" : entry.level.trim())}</span>
        </li>`,
  );
  const body = items.length > 0 ? `<ul class="language-list">\n        ${items.join("\n        ")}\n      </ul>` : EMPTY_MESSAGE;

  return `<section id="languages" class="section content-gutter" aria-labelledby="languages-heading">
    <div class="section__inner">
      <div class="section__header">
        <h2 id="languages-heading" class="heading heading--2">Languages</h2>
      </div>
      ${body}
    </div>
  </section>`;
}
