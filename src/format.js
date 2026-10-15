// Pure formatting helpers shared by the validator and the renderer.

const YEAR_MONTH = /^\d{4}-(0[1-9]|1[0-2])$/;

const monthYear = new Intl.DateTimeFormat("en-US", {
  month: "short",
  year: "numeric",
  timeZone: "UTC",
});

/** True when the value is a string of the form YYYY-MM with a valid month. */
export function isYearMonth(value) {
  return typeof value === "string" && YEAR_MONTH.test(value);
}

/** "2023-03" becomes "Mar 2023". Invalid input is returned unchanged. */
export function formatYearMonth(value) {
  if (!isYearMonth(value)) return value;
  const [year, month] = value.split("-").map(Number);
  return monthYear.format(new Date(Date.UTC(year, month - 1, 1)));
}

/**
 * Returns a new array sorted by startDate, newest first. The sort is stable, so
 * entries with the same startDate keep their file order. Entries whose startDate
 * is not a valid YYYY-MM string are placed last, also in file order.
 */
export function sortByStartDate(entries) {
  const valid = [];
  const invalid = [];
  for (const entry of entries) {
    (isYearMonth(entry?.startDate) ? valid : invalid).push(entry);
  }
  valid.sort((a, b) => (a.startDate < b.startDate ? 1 : a.startDate > b.startDate ? -1 : 0));
  return [...valid, ...invalid];
}

/** Keeps digits and a single leading plus sign for a tel: link. */
export function normalizeTel(phone) {
  const text = String(phone ?? "").trim();
  const digits = text.replace(/\D/g, "");
  return text.startsWith("+") ? `+${digits}` : digits;
}

/** Adds a leading @ when the handle lacks one. */
export function ensureHandle(handle) {
  const text = String(handle ?? "").trim();
  return text.startsWith("@") ? text : `@${text}`;
}

const HTML_ESCAPES = {
  "&": "&amp;",
  "<": "&lt;",
  ">": "&gt;",
  '"': "&quot;",
  "'": "&#39;",
};

/** Escapes text for safe insertion into HTML content or attribute values. */
export function escapeHtml(text) {
  return String(text ?? "").replace(/[&<>"']/g, (ch) => HTML_ESCAPES[ch]);
}

/** Splits text on newlines and wraps each non-blank line in an escaped <p>. */
export function paragraphs(text) {
  return String(text ?? "")
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter((line) => line.length > 0)
    .map((line) => `<p>${escapeHtml(line)}</p>`)
    .join("\n");
}
