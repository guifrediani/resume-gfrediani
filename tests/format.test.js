import { test } from "node:test";
import assert from "node:assert/strict";
import {
  isYearMonth,
  formatYearMonth,
  sortByStartDate,
  normalizeTel,
  ensureHandle,
  escapeHtml,
  paragraphs,
} from "../src/format.js";

test("isYearMonth accepts valid months", () => {
  assert.equal(isYearMonth("2024-01"), true);
  assert.equal(isYearMonth("2024-12"), true);
});

test("isYearMonth rejects other shapes", () => {
  for (const value of ["2024-13", "2024-1", "2024", "2024-01-15", "", null, undefined, 202401, "24-01"]) {
    assert.equal(isYearMonth(value), false, `${JSON.stringify(value)} should be rejected`);
  }
});

test("formatYearMonth renders English-US month and year", () => {
  assert.equal(formatYearMonth("2023-03"), "Mar 2023");
  assert.equal(formatYearMonth("2023-01"), "Jan 2023");
  assert.equal(formatYearMonth("2023-12"), "Dec 2023");
});

test("formatYearMonth returns invalid input unchanged", () => {
  assert.equal(formatYearMonth("2024-13"), "2024-13");
  assert.equal(formatYearMonth("soon"), "soon");
});

test("sortByStartDate sorts newest first and is stable", () => {
  const entries = [
    { title: "a", startDate: "2020-01" },
    { title: "b", startDate: "2022-06" },
    { title: "c", startDate: "2022-06" },
    { title: "d", startDate: "2021-03" },
  ];
  const sorted = sortByStartDate(entries);
  assert.deepEqual(sorted.map((e) => e.title), ["b", "c", "d", "a"]);
});

test("sortByStartDate puts invalid dates last in file order and does not mutate input", () => {
  const entries = [
    { title: "bad1", startDate: "nope" },
    { title: "ok", startDate: "2020-01" },
    { title: "bad2" },
  ];
  const sorted = sortByStartDate(entries);
  assert.deepEqual(sorted.map((e) => e.title), ["ok", "bad1", "bad2"]);
  assert.deepEqual(entries.map((e) => e.title), ["bad1", "ok", "bad2"]);
});

test("normalizeTel keeps digits and a leading plus", () => {
  assert.equal(normalizeTel("+55 (11) 91234-5678"), "+5511912345678");
  assert.equal(normalizeTel("(11) 91234-5678"), "11912345678");
  assert.equal(normalizeTel(""), "");
});

test("ensureHandle adds a missing @", () => {
  assert.equal(ensureHandle("guilherme"), "@guilherme");
  assert.equal(ensureHandle("@guilherme"), "@guilherme");
  assert.equal(ensureHandle("  name "), "@name");
});

test("escapeHtml escapes the five special characters", () => {
  assert.equal(escapeHtml(`<a href="x">Tom & Jerry's</a>`), "&lt;a href=&quot;x&quot;&gt;Tom &amp; Jerry&#39;s&lt;/a&gt;");
  assert.equal(escapeHtml(undefined), "");
});

test("paragraphs splits on newlines and drops blank lines", () => {
  assert.equal(paragraphs("First.\n\nSecond <b>bold</b>.\r\n  "), "<p>First.</p>\n<p>Second &lt;b&gt;bold&lt;/b&gt;.</p>");
  assert.equal(paragraphs(""), "");
});
