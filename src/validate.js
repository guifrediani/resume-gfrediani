// Content validation. Produces errors (nothing sensible can be rendered) and
// warnings (rendered with a fallback). Message format follows
// specs/001-one-page-resume/contracts/build-cli.md.

import { existsSync } from "node:fs";
import { join } from "node:path";
import { isYearMonth, LINKEDIN_URL } from "./format.js";

const LIST_KEYS = ["professionalExperience", "academicExperience", "certifications", "tools", "languages"];

const CONTACT_ICONS = {
  location: "location.png",
  email: "e-mail.png",
  phone: "phone.png",
  linkedin: "linkedin.png",
  x: "x.png",
};

const X_URL = /^https:\/\/(x\.com|twitter\.com)\/[^/\s]+\/?$/;
const EMAIL = /^[^@\s]+@[^@\s]+$/;

/** Formats one message as "SEVERITY path: message". */
export function formatMessage({ severity, path, message }) {
  return `${severity} ${path}: ${message}`;
}

function describeType(value) {
  if (value === null) return "null";
  if (Array.isArray(value)) return "array";
  return typeof value;
}

function isBlank(value) {
  return typeof value !== "string" || value.trim().length === 0;
}

/**
 * Validates the raw text of content/resume.json.
 * Returns { content, errors, warnings }. When errors are present, content is null.
 */
export function validate(rawText, { iconsDir = "icons" } = {}) {
  const errors = [];
  const warnings = [];
  const error = (path, message) => errors.push({ severity: "ERROR", path, message });
  const warn = (path, message) => warnings.push({ severity: "WARN", path, message });

  let content;
  try {
    content = JSON.parse(rawText);
  } catch (err) {
    error("(root)", `content/resume.json is not valid JSON: ${err.message}.`);
    return { content: null, errors, warnings };
  }

  if (content === null || typeof content !== "object" || Array.isArray(content)) {
    error("(root)", `expected an object, found ${describeType(content)}.`);
    return { content: null, errors, warnings };
  }

  if (!("profile" in content)) {
    error("profile", "missing; expected an object with name and description.");
  } else if (content.profile === null || typeof content.profile !== "object" || Array.isArray(content.profile)) {
    error("profile", `expected an object, found ${describeType(content.profile)}.`);
  }

  for (const key of LIST_KEYS) {
    if (!(key in content)) {
      error(key, "missing; expected an array.");
    } else if (!Array.isArray(content[key])) {
      error(key, `expected an array, found ${describeType(content[key])}.`);
    }
  }

  if (errors.length > 0) {
    return { content: null, errors, warnings };
  }

  validateProfile(content.profile, warn);
  const iconStatus = checkIcons(content.profile, iconsDir, warn);
  validateExperiences(content.professionalExperience, "professionalExperience", warn);
  // Academic entries often need only a degree and dates, so their description is optional.
  validateExperiences(content.academicExperience, "academicExperience", warn, { descriptionRequired: false });
  validateCertifications(content.certifications, warn);
  validateTools(content.tools, warn);
  validateLanguages(content.languages, warn);
  for (const key of LIST_KEYS) {
    if (content[key].length === 0) {
      warn(key, 'list is empty; the section will show "No entries yet."');
    }
  }

  return { content: { ...content, iconStatus }, errors, warnings };
}

function validateProfile(profile, warn) {
  if (isBlank(profile.name)) warn("profile.name", "missing or blank; expected the full name.");
  if (isBlank(profile.description)) warn("profile.description", "missing or blank; expected a short paragraph.");

  if (isBlank(profile.location)) {
    warn("profile.location", "missing; the location contact detail will be omitted.");
  }
  if (isBlank(profile.email)) {
    warn("profile.email", "missing; the e-mail contact detail will be omitted.");
  } else if (!EMAIL.test(profile.email.trim())) {
    warn("profile.email", `expected an e-mail address, found "${profile.email}"; the e-mail contact detail will be omitted.`);
  }
  if (isBlank(profile.phone)) {
    warn("profile.phone", "missing; the phone contact detail will be omitted.");
  }

  // LinkedIn is optional: missing or blank hides it without a warning.
  if (profile.linkedin !== undefined && profile.linkedin !== null && profile.linkedin !== "") {
    if (typeof profile.linkedin !== "string" || !LINKEDIN_URL.test(profile.linkedin.trim())) {
      warn("profile.linkedin", `expected an https://www.linkedin.com/in/ profile URL, found ${JSON.stringify(profile.linkedin)}; the LinkedIn contact detail will be omitted.`);
    }
  }

  const x = profile.x;
  if (x === undefined || x === null || x === "") {
    warn("profile.x", "missing; the X contact detail will be omitted.");
  } else if (typeof x !== "object" || Array.isArray(x)) {
    warn("profile.x", `expected an object with handle and url, found ${describeType(x)}; the X contact detail will be omitted.`);
  } else {
    if (isBlank(x.handle)) warn("profile.x.handle", "missing or blank; expected the display handle such as @name.");
    if (isBlank(x.url)) {
      warn("profile.x.url", "missing; the X contact detail will be omitted.");
    } else if (!X_URL.test(x.url.trim())) {
      warn("profile.x.url", `expected an https://x.com/ or https://twitter.com/ profile, found "${x.url}".`);
    }
  }
}

/** Returns a map of contact kind to boolean: whether the icon file exists. */
function checkIcons(profile, iconsDir, warn) {
  const status = {};
  const present = {
    location: !isBlank(profile.location),
    email: !isBlank(profile.email),
    phone: !isBlank(profile.phone),
    linkedin: !isBlank(profile.linkedin),
    x: profile.x && typeof profile.x === "object" && !isBlank(profile.x.url),
  };
  const labels = { location: "location", email: "e-mail", phone: "phone", linkedin: "LinkedIn", x: "X" };
  for (const [kind, file] of Object.entries(CONTACT_ICONS)) {
    const exists = existsSync(join(iconsDir, file));
    status[kind] = exists;
    if (!exists && present[kind]) {
      warn(`icons/${file}`, `file not found; the ${labels[kind]} detail will render without an icon.`);
    }
  }
  return status;
}

function validateExperiences(list, key, warn, { descriptionRequired = true } = {}) {
  list.forEach((entry, index) => {
    const path = `${key}[${index}]`;
    if (entry === null || typeof entry !== "object" || Array.isArray(entry)) {
      warn(path, `expected an object, found ${describeType(entry)}; the entry will be skipped.`);
      return;
    }
    if (isBlank(entry.title)) warn(`${path}.title`, "missing or blank; expected the entry title.");
    // company is optional; a blank string simply hides it.
    if (entry.company !== undefined && typeof entry.company !== "string") {
      warn(`${path}.company`, `expected a string, found ${describeType(entry.company)}; it will be ignored.`);
    }
    if (descriptionRequired && isBlank(entry.description)) warn(`${path}.description`, "missing or blank; expected a description.");
    if (entry.startDate === undefined) {
      warn(`${path}.startDate`, "missing; expected YYYY-MM.");
    } else if (!isYearMonth(entry.startDate)) {
      warn(`${path}.startDate`, `expected YYYY-MM, found ${JSON.stringify(entry.startDate)}.`);
    }
    if (entry.endDate !== undefined && entry.endDate !== null && !isYearMonth(entry.endDate)) {
      warn(`${path}.endDate`, `expected YYYY-MM, found ${JSON.stringify(entry.endDate)}.`);
    }
    if (isYearMonth(entry.startDate) && isYearMonth(entry.endDate) && entry.startDate > entry.endDate) {
      warn(path, `startDate ${entry.startDate} is after endDate ${entry.endDate}.`);
    }
  });
}

function validateCertifications(list, warn) {
  list.forEach((entry, index) => {
    const path = `certifications[${index}]`;
    if (entry === null || typeof entry !== "object" || Array.isArray(entry)) {
      warn(path, `expected an object, found ${describeType(entry)}; the entry will be skipped.`);
      return;
    }
    if (isBlank(entry.title)) warn(`${path}.title`, "missing or blank; expected the certification title.");
    if (entry.date === undefined) {
      warn(`${path}.date`, "missing; expected YYYY-MM.");
    } else if (!isYearMonth(entry.date)) {
      warn(`${path}.date`, `expected YYYY-MM, found ${JSON.stringify(entry.date)}.`);
    }
  });
}

function validateTools(list, warn) {
  list.forEach((entry, index) => {
    const path = `tools[${index}]`;
    if (entry === null || typeof entry !== "object" || Array.isArray(entry)) {
      warn(path, `expected an object, found ${describeType(entry)}; the entry will be skipped.`);
      return;
    }
    if (isBlank(entry.name)) warn(`${path}.name`, "missing or blank; expected the tool name.");
  });
}

function validateLanguages(list, warn) {
  list.forEach((entry, index) => {
    const path = `languages[${index}]`;
    if (entry === null || typeof entry !== "object" || Array.isArray(entry)) {
      warn(path, `expected an object, found ${describeType(entry)}; the entry will be skipped.`);
      return;
    }
    if (isBlank(entry.name)) warn(`${path}.name`, "missing or blank; expected the language name.");
    if (isBlank(entry.level)) warn(`${path}.level`, "missing or blank; expected the proficiency level.");
  });
}
