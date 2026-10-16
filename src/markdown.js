// Reads content/resume.md into the same content object the JSON format produced, so
// validation and rendering stay shared. Format:
//
//   ---                       front matter: one "key: value" per line
//   name: ...                 keys: name, location, email, phone, linkedin, x, x-handle
//   ---
//   # About                   section headings (fixed names, see SECTIONS)
//   free Markdown             -> profile.description
//   # Match History           entry sections: each "## Title" is one entry, followed by
//   ## Role                   "key: value" lines (company, start, end / date) and then
//   company: ...              free Markdown for the description
//   # Tools & Games           list sections: one "- item" per line
//   # Languages               "- Language: Level"

import { Marked } from "marked";
import { escapeHtml } from "./format.js";

const SECTIONS = {
  about: { key: "profile" },
  "match history": { key: "professionalExperience", entryKeys: ["company", "start", "end"] },
  "quests completed": { key: "academicExperience", entryKeys: ["start", "end"] },
  achievements: { key: "certifications", entryKeys: ["date"] },
  "tools & games": { key: "tools" },
  languages: { key: "languages" },
};

export const SECTION_LABELS = {
  professionalExperience: "Match History",
  academicExperience: "Quests Completed",
  certifications: "Achievements",
  tools: "Tools & Games",
  languages: "Languages",
};

const FRONT_MATTER_KEYS = ["name", "location", "email", "phone", "linkedin", "x", "x-handle"];
const ENTRY_FIELD = { start: "startDate", end: "endDate", date: "date", company: "company" };

/** Markdown renderer for descriptions. Headings shift down one level per `shift`
 * so they stay below the entry title; external links open in a new tab. */
function createMarkdown(shift) {
  return new Marked({
    gfm: true,
    renderer: {
      heading({ tokens, depth }) {
        const level = Math.min(6, depth + shift);
        return `<h${level} class="md-heading">${this.parser.parseInline(tokens)}</h${level}>\n`;
      },
      link({ href, title, tokens }) {
        const text = this.parser.parseInline(tokens);
        const titleAttr = title ? ` title="${escapeHtml(title)}"` : "";
        if (/^https?:\/\//i.test(href)) {
          return `<a href="${escapeHtml(href)}"${titleAttr} target="_blank" rel="noopener noreferrer">${text}<span class="external-mark" aria-hidden="true">↗</span><span class="visually-hidden">(opens in a new tab)</span></a>`;
        }
        return `<a href="${escapeHtml(href)}"${titleAttr}>${text}</a>`;
      },
      // Raw HTML in the Markdown is shown as text rather than injected into the page.
      html({ text }) {
        return escapeHtml(text);
      },
    },
  });
}

const markdown = createMarkdown(1);

const plainText = (html) =>
  html.replace(/<\/(p|li|h[1-6]|ul|ol|blockquote)>|<br\s*\/?>/g, " ").replace(/<[^>]+>/g, "").replace(/&amp;/g, "&").replace(/&lt;/g, "<").replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"').replace(/&#39;/g, "'").replace(/\s+/g, " ").trim();

function renderDescription(markdown, renderer) {
  const source = markdown.trim();
  if (source.length === 0) return { description: "", descriptionHtml: "" };
  const descriptionHtml = renderer.parse(source).trim();
  return { description: plainText(descriptionHtml), descriptionHtml };
}

/**
 * Parses the Markdown resume. Returns { content, errors, warnings } where messages are
 * { severity, path, message } with path "content/resume.md:LINE".
 */
export function parseResume(text, file = "content/resume.md") {
  const errors = [];
  const warnings = [];
  const at = (line) => `${file}:${line}`;
  const error = (line, message) => errors.push({ severity: "ERROR", path: at(line), message });
  const warn = (line, message) => warnings.push({ severity: "WARN", path: at(line), message });

  // Comments are notes for the editor, never content. Blank them out line for line so
  // reported line numbers still match the file.
  const source = text
    .replace(/^﻿/, "")
    .replace(/\r\n?/g, "\n")
    .replace(/<!--[\s\S]*?-->/g, (comment) => comment.replace(/[^\n]/g, ""));
  const lines = source.split("\n");

  const content = {
    profile: {},
    professionalExperience: [],
    academicExperience: [],
    certifications: [],
    tools: [],
    languages: [],
  };

  // ---- Front matter ---------------------------------------------------------
  let index = 0;
  while (index < lines.length && lines[index].trim() === "") index += 1;
  if (lines[index]?.trim() !== "---") {
    error(index + 1, 'expected front matter starting with "---" (name, location, email, phone, linkedin, x, x-handle).');
    return { content: null, errors, warnings };
  }
  const front = {};
  index += 1;
  for (; index < lines.length && lines[index].trim() !== "---"; index += 1) {
    const line = lines[index];
    if (line.trim() === "") continue;
    const match = line.match(/^\s*([A-Za-z-]+)\s*:\s*(.*)$/);
    if (!match) {
      warn(index + 1, `expected "key: value" in the front matter, found ${JSON.stringify(line.trim())}; the line is ignored.`);
      continue;
    }
    const key = match[1].toLowerCase();
    if (!FRONT_MATTER_KEYS.includes(key)) {
      warn(index + 1, `unknown front matter key "${match[1]}"; expected one of ${FRONT_MATTER_KEYS.join(", ")}.`);
      continue;
    }
    front[key] = { value: match[2].trim(), line: index + 1 };
  }
  if (index >= lines.length) {
    error(lines.length, 'front matter is not closed; add a line with "---" after the last key.');
    return { content: null, errors, warnings };
  }
  index += 1;

  const value = (key) => front[key]?.value ?? "";
  Object.assign(content.profile, {
    name: value("name"),
    location: value("location"),
    email: value("email"),
    phone: value("phone"),
    linkedin: value("linkedin"),
    description: "",
  });
  if (front.x) content.profile.x = { handle: value("x-handle"), url: value("x") };
  content.profile._lines = Object.fromEntries(Object.entries(front).map(([key, { line }]) => [key, line]));

  // ---- Body: split into sections (#) and entries (##), ignoring code fences ----
  let section = null; // { spec, line, lines: [{ text, line }] }
  const sections = [];
  let fenced = false;
  for (; index < lines.length; index += 1) {
    const line = lines[index];
    if (/^\s*(```|~~~)/.test(line)) fenced = !fenced;
    const heading = !fenced && line.match(/^#\s+(.+?)\s*#*\s*$/);
    if (heading) {
      const name = heading[1].trim();
      const spec = SECTIONS[name.toLowerCase()];
      if (!spec) {
        error(index + 1, `unknown section "# ${name}"; expected one of ${Object.keys(SECTIONS).map((s) => `"# ${titleCase(s)}"`).join(", ")}.`);
        section = null;
        continue;
      }
      if (sections.some((s) => s.spec === spec)) {
        error(index + 1, `section "# ${name}" appears twice.`);
        section = null;
        continue;
      }
      section = { spec, name, line: index + 1, lines: [] };
      sections.push(section);
      continue;
    }
    if (section) {
      section.lines.push({ text: line, line: index + 1 });
    } else if (line.trim() !== "") {
      warn(index + 1, "text outside any section is ignored; put it under a \"# Section\" heading.");
    }
  }

  for (const { spec, name, line, lines: body } of sections) {
    if (spec.key === "profile") {
      Object.assign(content.profile, renderDescription(body.map((l) => l.text).join("\n"), markdown));
      content.profile._lines.description = line;
    } else if (spec.entryKeys) {
      content[spec.key] = parseEntries(body, spec, name, warn);
    } else {
      content[spec.key] = parseListItems(body, spec.key, name, warn);
    }
  }

  for (const [label, spec] of Object.entries(SECTIONS)) {
    if (!sections.some((s) => s.spec === spec)) {
      warn(lines.length, `section "# ${titleCase(label)}" is missing; it will show "No entries yet."`);
    }
  }

  return { content: errors.length > 0 ? null : content, errors, warnings };
}

function titleCase(text) {
  return text.replace(/\b\w/g, (c) => c.toUpperCase());
}

function parseEntries(body, spec, sectionName, warn) {
  const entries = [];
  let current = null;
  let fenced = false;
  for (const { text, line } of body) {
    if (/^\s*(```|~~~)/.test(text)) fenced = !fenced;
    const heading = !fenced && text.match(/^##\s+(.+?)\s*#*\s*$/);
    if (heading) {
      current = { entry: { title: heading[1].trim(), _line: line }, metadata: true, description: [] };
      entries.push(current);
      continue;
    }
    if (!current) {
      if (text.trim() !== "") warn(line, `text before the first "## Title" in "# ${sectionName}" is ignored.`);
      continue;
    }
    if (current.metadata) {
      if (text.trim() === "") {
        if (Object.keys(current.entry).length > 2 || current.description.length > 0) current.metadata = false;
        continue;
      }
      const match = text.match(/^\s*([A-Za-z]+)\s*:\s*(.*)$/);
      const key = match?.[1].toLowerCase();
      if (match && spec.entryKeys.includes(key)) {
        let value = match[2].trim();
        if (key === "end" && (value === "" || /^present$/i.test(value))) value = null;
        current.entry[ENTRY_FIELD[key]] = value;
        continue;
      }
      current.metadata = false;
    }
    current.description.push(text);
  }

  return entries.map(({ entry, description }) => {
    if (spec.key !== "certifications") {
      Object.assign(entry, renderDescription(description.join("\n"), markdown));
    } else if (description.join("").trim() !== "") {
      warn(entry._line, `"${entry.title}" has text after its date; achievements show only the title and date, so it is ignored.`);
    }
    return entry;
  });
}

function parseListItems(body, key, sectionName, warn) {
  const items = [];
  for (const { text, line } of body) {
    if (text.trim() === "") continue;
    const match = text.match(/^\s*[-*+]\s+(.*)$/);
    if (!match) {
      warn(line, `expected a "- item" line in "# ${sectionName}", found ${JSON.stringify(text.trim())}; the line is ignored.`);
      continue;
    }
    const item = match[1].trim();
    if (key === "tools") {
      items.push({ name: item, _line: line });
    } else {
      const split = item.indexOf(":");
      items.push(split === -1
        ? { name: item, level: "", _line: line }
        : { name: item.slice(0, split).trim(), level: item.slice(split + 1).trim(), _line: line });
    }
  }
  return items;
}

const PROFILE_FIELDS = { "x.url": "x", "x.handle": "x-handle" };

/** Rewrites a validator path such as professionalExperience[1].startDate into a pointer
 * the Markdown author can find: content/resume.md:23 (Match History › "Role" › start). */
export function describePath(path, content, file = "content/resume.md") {
  const list = path.match(/^(professionalExperience|academicExperience|certifications|tools|languages)(?:\[(\d+)\])?(?:\.(\w+))?$/);
  if (list) {
    const [, key, i, field] = list;
    const label = SECTION_LABELS[key];
    if (i === undefined) return `${file} (# ${label})`;
    const item = content[key]?.[Number(i)];
    const name = item?.title ?? item?.name ?? `item ${Number(i) + 1}`;
    const fieldName = { startDate: "start", endDate: "end" }[field] ?? field;
    return `${file}:${item?._line ?? "?"} (${label} › "${name}"${fieldName ? ` › ${fieldName}` : ""})`;
  }
  const profile = path.match(/^profile\.(.+)$/);
  if (profile) {
    const key = PROFILE_FIELDS[profile[1]] ?? profile[1];
    if (key === "description") return `${file}:${content.profile?._lines?.description ?? "?"} (# About)`;
    const line = content.profile?._lines?.[key];
    return `${file}${line ? `:${line}` : ""} (front matter › ${key})`;
  }
  return path;
}
