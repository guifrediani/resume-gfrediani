---

description: "Task list for the one-page resume website"
---

# Tasks: One-Page Resume Website

**Input**: Design documents from `/specs/001-one-page-resume/`

**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/, quickstart.md

**Tests**: Test tasks are included. The plan's project structure defines four `node --test`
suites, and the constitution's Definition of Done requires automated link, HTML, and
spell checks before any deploy. Within each story, test tasks come first so they fail
before the implementation lands.

**Organization**: Tasks are grouped by user story so each story can be implemented and
verified on its own.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies on unfinished tasks)
- **[Story]**: Which user story this task belongs to (US1, US2, US3, US4)
- Every task names the exact file it touches

## Path Conventions

Single flat project at the repository root, per plan.md:

- `content/resume.json` is the only file the owner edits
- `src/` holds the build script, template, and stylesheet
- `tests/` holds the `node --test` suites
- `icons/` already exists and is copied unchanged into `dist/icons/`
- `dist/` is generated and ignored by git

Contract references used below: [page-structure.md](contracts/page-structure.md) for
markup, [build-cli.md](contracts/build-cli.md) for commands and messages,
[resume-content.schema.json](contracts/resume-content.schema.json) and
[data-model.md](data-model.md) for validation rules.

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Create the project skeleton, tooling configuration, and sample content.

- [X] T001 Create the directories `content/`, `src/`, `tests/`, and `.github/workflows/` at the repository root
- [X] T002 Create `package.json` at the repository root with `"type": "module"`, `"private": true`, `"engines": { "node": ">=20" }`, the scripts `build` (`node src/build.js`), `test` (`node --test tests/`), and `check` (`npm run build -- --strict && npm test && html-validate dist/index.html && cspell --no-progress "dist/index.html" "content/resume.json"`), and devDependencies `html-validate` and `cspell` pinned to their current stable majors
- [X] T003 [P] Create `.gitignore` at the repository root containing `dist/` and `node_modules/`
- [X] T004 [P] Create `cspell.json` at the repository root with `"language": "en-US"`, `"version": "0.2"`, an empty `words` array for proper nouns, and `ignorePaths` of `node_modules/**`
- [X] T005 [P] Create `.htmlvalidate.json` at the repository root extending `html-validate:recommended`
- [X] T006 [P] Create `content/resume.json` with placeholder sample content that satisfies `contracts/resume-content.schema.json`: a profile with name, description, location, email, phone, and `x` (`handle` plus an `https://x.com/` URL); one ongoing professional entry (`endDate: null`); one finished academic entry; one certification; two languages
- [X] T007 Run `npm install` at the repository root so `package-lock.json` exists and `html-validate` and `cspell` are available for the `check` script

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: The build pipeline that every story renders through. After this phase,
`npm run build` produces a valid but content-empty page and `npm test` runs.

**⚠️ CRITICAL**: No user story work can begin until this phase is complete.

- [X] T008 [P] Implement `src/format.js` exporting `isYearMonth(value)` (matches `^\d{4}-(0[1-9]|1[0-2])$`), `formatYearMonth(value)` (returns `Mar 2023` via `Intl.DateTimeFormat("en-US", { month: "short", year: "numeric", timeZone: "UTC" })`, or the raw string when invalid), `sortByStartDate(entries)` (stable, descending by `startDate`, invalid dates last), `normalizeTel(phone)` (keeps digits and a leading `+`), `ensureHandle(handle)` (adds a missing leading `@`), `escapeHtml(text)`, and `paragraphs(text)` (splits on newlines into escaped `<p>` elements)
- [X] T009 [P] Implement `src/validate.js` exporting `validate(rawText, { iconsDir })` that returns `{ content, errors, warnings }` where each message is `{ severity, path, message }`, plus `formatMessage(m)` producing `SEVERITY path: message` exactly as in `contracts/build-cli.md`; cover the structural errors only in this task: invalid JSON (path `(root)`), missing top-level keys, list keys that are not arrays, `profile` that is not an object
- [X] T010 [P] Create `src/template.html` per the Document and Header sections of `contracts/page-structure.md`: `<html lang="en-US">`, charset and viewport metas, `<title>{{title}}</title>`, `<meta name="description" content="{{metaDescription}}">`, preconnect links to `https://fonts.googleapis.com` and `https://fonts.gstatic.com`, a Google Fonts stylesheet link for Inter Tight 800 and 900 and Inter 400 and 700 with `display=swap`, `<link rel="stylesheet" href="styles.css">`, the skip link, the fixed header with brand link `{{name}}` and the five-item `<nav aria-label="Sections">`, `<main id="main">{{sections}}</main>`, and the footer with `© {{year}} {{name}}` and the `#top` back-to-top link; no `<script>` element anywhere
- [X] T011 Implement `src/render.js` skeleton exporting `renderPage(content, template)` that fills `{{title}}` (`<name> - Resume`), `{{metaDescription}}` (first 160 characters of the description), `{{name}}`, `{{year}}`, and `{{sections}}` using `renderSections(content)`, which returns an empty string until User Story 1 fills it; all inserted values go through `escapeHtml` from `src/format.js`
- [X] T012 Implement `src/build.js` per `contracts/build-cli.md`: parse `--strict`, `--out <dir>` (default `dist`), and `--content <file>` (default `content/resume.json`), exit 2 on an unknown flag, unreadable content path, or missing `src/template.html`; call `validate` with `iconsDir` `icons/`; print every message to stderr, errors first; exit 1 without writing when there are errors or, under `--strict`, warnings; otherwise delete and recreate the output directory, write `index.html` from `renderPage`, copy `src/styles.css` to `<out>/styles.css`, copy `icons/*.png` to `<out>/icons/`, and print `Built <out>/index.html (E errors, W warnings)` to stdout
- [X] T013 [P] Create `src/styles.css` base layer: the `:root` token block copied verbatim from design-system.md section 9; `html`/`body` rules from section 3.2 with `background: var(--color-bg)` and `color: var(--color-text)`; heading classes `heading--display`, `heading--2`, `heading--4`, `heading--5` using the section 3.3 scale at the 550px and 960px breakpoints; `copy`, `copy--large`, `copy--small`, `copy--muted` with `max-width: 467px`; `eyebrow`; `visually-hidden`; `skip-link` (visible on focus); a global link focus ring `box-shadow: 0 0 0 2px var(--color-gold)`; `content-gutter` padding 20/40/80px; `main` as a column with `row-gap` 50px, 100px at 960px; the fixed opaque header at 50px, 70px at 960px, with matching top padding on `main`; `html { scroll-padding-top: 90px; }`; footer layout
- [X] T014 [P] Write `tests/validate.test.js` with `node:test` covering the structural rules from T009 and the exact `formatMessage` output format, including the `(root)` path for invalid JSON and `certifications: expected an array, found object.` style wording
- [X] T015 Run `npm run build` and `npm test`; confirm exit code 0, that `dist/index.html`, `dist/styles.css`, and `dist/icons/` exist, and that the page opens in a browser showing the header, empty main area, and footer

**Checkpoint**: Foundation ready. User stories can now be implemented.

---

## Phase 3: User Story 1 - Visitor reads the complete resume on one page (Priority: P1) 🎯 MVP

**Goal**: A visitor opening the page sees About Me with name, description, and four
iconed contact details, then Professional Experience, Academic Experience,
Certifications, and Languages, all on one page, with the X handle linking to the
profile in a new tab.

**Independent Test**: Build with the sample content, open `dist/index.html`, and walk
the quickstart section 5 rows "Section order", "Icons", "X link", "E-mail and phone",
and "Responsive". `npm test` passes the render and output suites.

### Tests for User Story 1

- [X] T016 [P] [US1] Write `tests/render.test.js` asserting, from `renderPage` output with a fixture content object: the five section ids appear in the fixed order; exactly one `<h1>` containing the name; description newlines become separate `<p>` elements; the contact list has items in the order location, e-mail, phone, X with `<img src="icons/location.png">`, `icons/e-mail.png`, `icons/phone.png`, `icons/x.png`, each with `alt=""`, `width="24"`, `height="24"`; a blank `phone` produces no phone `<li>`; the e-mail href is `mailto:` and the phone href is `tel:` with the normalized number; the X anchor has `target="_blank"`, `rel="noopener noreferrer"`, the visible `↗` mark, and the visually hidden "(opens in a new tab)" text; an entry renders an `<h3>`, two `<time>` elements with `datetime`, and its description; content containing `<b>` is escaped
- [X] T017 [P] [US1] Write `tests/output.test.js` that runs `node src/build.js --out <temp dir> --content content/resume.json` through `child_process.execFileSync`, then asserts on the produced `index.html`: only one `.html` file exists in the output directory; `<html lang="en-US">`; no `<script`, `<form`, `<input`, or `<textarea`; the five section ids appear in order; every `<a href>` not starting with `#`, `mailto:`, or `tel:` carries `target="_blank"` and `rel="noopener noreferrer"`; each contact detail present in the sample content has its icon `<img>`
- [X] T018 [P] [US1] Extend `tests/validate.test.js` with profile rules: blank `name` or `description` warns; malformed `email` warns; an `x.url` outside `https://x.com/` or `https://twitter.com/` warns with the exact message from `contracts/build-cli.md`; a missing contact field warns `profile.phone: missing; the phone contact detail will be omitted.`; a missing icon file warns with path `icons/e-mail.png`

### Implementation for User Story 1

- [X] T019 [US1] Implement profile validation in `src/validate.js`: blank `name`/`description`, `email` pattern, `x` object shape, `x.url` allowed hosts, missing contact detail warnings, and existence check of the four icon files in `iconsDir` with the warning wording from `contracts/build-cli.md`
- [X] T020 [US1] Implement `renderAbout(profile, iconStatus)` in `src/render.js` per the About Me section of `contracts/page-structure.md`: eyebrow "Resume", `<h1 id="about-heading">`, description paragraphs, and the `contact-list` with fixed order, omission of blank details, decorative icon images (skipped when the icon file is missing), `mailto:` and `tel:` links, and the X external link with mark and hidden text
- [X] T021 [US1] Implement `renderExperienceSection(id, heading, entries)` in `src/render.js` per the Experience sections contract: `<section aria-labelledby>`, `section__header` with `<h2>`, `<ol class="entry-list">`, each entry an `<li class="entry">` with `<h3 class="entry__title heading heading--4">`, `<p class="entry__dates eyebrow">` holding two `<time datetime>` elements separated by an en dash, and description paragraphs; entries in file order in this task
- [X] T022 [US1] Implement `renderCertifications(list)` and `renderLanguages(list)` in `src/render.js` per the contract (compact entry list with `<h3 class="heading--5">` and a `<time>`; language list with name and `<span class="language__level tag">`), then complete `renderSections(content)` to return About Me, Professional Experience, Academic Experience, Certifications, and Languages in that order
- [X] T023 [US1] Add About Me and entry styles to `src/styles.css`: hero name as `heading--display` uppercase with `line-height: 0.9`; `contact-list` as a vertical flex list with 24px icons using `filter: invert(0.9)`; `external-mark` spacing; `entry-list` reset, `entry` spacing, `entry__title`, `entry__dates`, `entry__description`; `language-list` and `tag` from design-system section 7.3; alternate section backgrounds with `--color-bg-deep`; responsive adjustments at 550px and 960px
- [X] T024 [US1] Run `npm run build` and `npm test`, open `dist/index.html`, and verify the quickstart section 5 rows "Section order", "Icons", "X link", "E-mail and phone", and "Responsive" (360, 768, 1024, 1440); fix any failures in `src/render.js` or `src/styles.css`

**Checkpoint**: User Story 1 is a shareable resume page. This is the MVP.

---

## Phase 4: User Story 2 - Owner adds, edits, or removes an experience entry (Priority: P2)

**Goal**: Editing only `content/resume.json` adds, changes, or removes professional and
academic entries; entries sort newest first; an ongoing entry shows "Present"; bad
dates warn without blocking a local build and fail a strict build.

**Independent Test**: Follow quickstart section 4 steps 1 through 6 with the sample
content. `npm test` passes the format and validate suites.

### Tests for User Story 2

- [X] T025 [P] [US2] Write `tests/format.test.js` covering `isYearMonth` (accepts `2024-01` and `2024-12`, rejects `2024-13`, `2024-1`, `2024`, `2024-01-15`), `formatYearMonth` (`2023-03` gives `Mar 2023`, `2023-01` gives `Jan 2023`, `2023-12` gives `Dec 2023`, invalid input returns the raw string), `sortByStartDate` (descending, stable for equal dates, invalid dates last), `normalizeTel` (`+55 (11) 91234-5678` gives `+5511912345678`), and `ensureHandle`
- [X] T026 [P] [US2] Extend `tests/validate.test.js` with experience rules for both lists: blank `title` or `description` warns; `startDate` missing or not `YYYY-MM` warns with `expected YYYY-MM, found "2024-13".`; `endDate` `null` or omitted is accepted silently; `endDate` malformed warns; `startDate` after `endDate` warns `startDate 2023-05 is after endDate 2022-01.`; a non-object entry warns; paths use bracket indexes like `professionalExperience[1].endDate`
- [X] T027 [US2] Implement experience entry validation in `src/validate.js` for `professionalExperience` and `academicExperience` per the Experience Entry table in `data-model.md`, reusing `isYearMonth` from `src/format.js`
- [X] T028 [US2] Update `renderExperienceSection` in `src/render.js` to sort entries with `sortByStartDate`, render `Present` as plain text (no `datetime`) when `endDate` is missing or `null`, and fall back to the raw string for a malformed date
- [X] T029 [US2] Add the current-role marker to `src/styles.css`: ongoing entries get a class `entry--current` whose `Present` label uses `var(--color-accent)`, the design system's reserved use of red for the current experience
- [X] T030 [US2] Walk quickstart section 4 steps 1 through 6 (add an ongoing entry, edit a description, remove an entry, break an `endDate`, confirm `WARN` with exit 0, confirm `--strict` exits 1), then restore `content/resume.json` to the sample content

**Checkpoint**: User Stories 1 and 2 both work. The owner can maintain experience without touching layout files.

---

## Phase 5: User Story 3 - Owner maintains certifications and languages (Priority: P2)

**Goal**: Certifications (title plus obtained date) and languages (name plus level) are
edited in the same content file, render in file order, and an empty list shows "No
entries yet." instead of breaking the layout.

**Independent Test**: Add a certification and a language, change a language level,
remove a certification, empty one list, rebuild, and confirm the sections reflect
exactly those changes. `npm test` passes.

### Tests for User Story 3

- [X] T031 [P] [US3] Extend `tests/validate.test.js` with certification rules (blank `title` warns, `date` not `YYYY-MM` warns), language rules (blank `name` or `level` warns), and the empty-list warning `languages: list is empty; the section will show "No entries yet."` for each of the four lists
- [X] T032 [P] [US3] Extend `tests/render.test.js` with certification and language cases: two certifications render in file order (not sorted) with `Nov 2024` style dates; languages render name and level in file order; each of the four lists, when empty, renders `<p class="copy copy--muted entry-list--empty">No entries yet.</p>` and no `<ol>` or `<ul>`
- [X] T033 [US3] Implement certification and language validation and the empty-list warning for all four lists in `src/validate.js` per `data-model.md`
- [X] T034 [US3] Implement empty-state rendering in `src/render.js` for the four list sections and confirm certifications and languages keep file order
- [X] T035 [US3] Add certification and language styles to `src/styles.css`: `entry--compact` spacing, certification date eyebrow in `var(--color-gold)`, `language-list` as a wrapping flex row at 550px and above, `tag` sizing, and `entry-list--empty` muted text
- [X] T036 [US3] Rebuild and verify: add a certification and a language, change a level, remove a certification, temporarily empty `certifications`, check the section shows the heading and "No entries yet.", then restore the sample content

**Checkpoint**: All list sections are owner-maintainable from one file.

---

## Phase 6: User Story 4 - Visitor jumps to a section with in-page navigation (Priority: P3)

**Goal**: Header links scroll to sections on the same page, smoothly unless reduced
motion is requested, with headings fully visible below the fixed header and visible
keyboard focus on every link.

**Independent Test**: Quickstart section 5 rows "Anchor navigation", "Reduced motion",
and "Keyboard". `npm test` passes the anchor assertions in the output suite.

### Tests for User Story 4

- [X] T037 [P] [US4] Extend `tests/output.test.js` with anchor assertions: every `href` inside `<nav>` starts with `#` and matches an `id` in the page; the skip link targets `#main`; the back-to-top link targets `#top`; the brand link targets `#about`; no `<a href>` points to another `.html` file or a relative path

### Implementation for User Story 4

- [X] T038 [US4] Add navigation styles to `src/styles.css`: header as a flex row with the brand left and `nav ul` as a horizontal list that wraps to a second row below 550px with all five links visible (no menu toggle); nav links uppercase 11px bold per the eyebrow style with an accent underline on hover; `@media (prefers-reduced-motion: no-preference) { html { scroll-behavior: smooth; } }`; `scroll-padding-top` of 70px on mobile and 90px at 960px so headings clear the header
- [X] T039 [US4] Rebuild and verify the quickstart rows "Anchor navigation" (address bar shows the fragment, heading not under the header), "Reduced motion" (instant jump with the DevTools emulation), and "Keyboard" (skip link first, gold focus ring on every link, Enter activates); fix in `src/styles.css` or `src/template.html`

**Checkpoint**: All four user stories are independently functional.

---

## Phase 7: Polish & Cross-Cutting Concerns

**Purpose**: Print output, motion, deployment, and the full pre-deploy gate.

- [X] T040 Add the `@media print` block to `src/styles.css` per the Print contract in `contracts/page-structure.md`: hide the header nav and back-to-top link, static positioning, white background with `#2B2A29` text, icons without the invert filter, `a[href^="https"]::after { content: " (" attr(href) ")"; }`, and `break-inside: avoid` on `.entry`
- [X] T041 Add the About Me entrance animation to `src/styles.css` inside `@media (prefers-reduced-motion: no-preference)`: the `reveal-up` keyframes from design-system section 6.2 with the `--ease` curve, 1s duration, and staggered delays of 0.4s for the eyebrow, 0.8s for the name, and 1.2s for the description and contact list
- [X] T042 [P] Create `.github/workflows/deploy.yml` that runs on push to `main`: `actions/checkout`, `actions/setup-node` with Node 20 and npm cache, `npm ci`, `npm run check`, `actions/configure-pages`, `actions/upload-pages-artifact` with path `dist`, and `actions/deploy-pages`, with `permissions` of `contents: read`, `pages: write`, `id-token: write`
- [X] T043 [P] Populate the `words` array in `cspell.json` with the proper nouns from `content/resume.json` (starting with `Guilherme`) and run `npx cspell --no-progress "dist/index.html" "content/resume.json"` until it reports zero issues
- [X] T044 Run `npx html-validate dist/index.html` and fix any reported markup issue in `src/template.html` or `src/render.js`
- [X] T045 Run `npm run check` at the repository root and confirm exit code 0
- [ ] T046 Run Lighthouse in Chrome DevTools (mobile, Accessibility and Performance) on `dist/index.html` per quickstart section 5; fix contrast or performance findings in `src/styles.css` until both scores are 90 or higher (owner action: Lighthouse was not run during implementation; contrast, keyboard focus, reduced motion, and overflow were verified over the DevTools protocol instead, and the three contrast failures found were fixed)
- [X] T047 Complete the remaining quickstart section 5 rows "Long content", "JavaScript off", and "Print" and fix any failure in `src/styles.css`
- [X] T048 Review `src/styles.css` and `src/template.html` against design-system.md section 10 (no pure white text, one accent color, no colored background gradients, card radii at most 12px) and confirm every visible string and code comment is English-US

---

## Phase 8: Tools Section, User Story 1 (visitor reads the Tools section) - Amendment 2026-09-10

**Goal**: A visitor sees a Tools section between Certifications and Languages listing
the tools the owner has experience with as tags, and can reach it from a sixth header
nav link. Contract: the Tools section of `contracts/page-structure.md`; decision 14 in
`research.md`.

**Independent Test**: Build with sample content containing a `tools` list, open
`dist/index.html`, confirm the section order About Me, Professional Experience, Academic
Experience, Certifications, Tools, Languages, the tags render in file order, and the
"Tools" nav link scrolls to the section. `npm test` passes the render and output suites.

### Tests for Tools, User Story 1

- [X] T049 [P] [US1] Extend `tests/render.test.js`: add `tools: [{ name: "Figma" }, { name: "Jira" }]` to the fixture; add `tools` to `SECTION_IDS` between `certifications` and `languages`; import `renderTools` and assert it renders `<ul class="tool-list">` with `<li class="tool tag">Figma</li>` before `Jira` (file order), escapes a name containing `<b>`, and renders `<p class="copy copy--muted entry-list--empty">No entries yet.</p>` with no `<ul` for an empty list while keeping the `<h2 id="tools-heading"`; assert `renderSections` includes `<section id="tools"` with `aria-labelledby="tools-heading"` in the correct position
- [X] T050 [P] [US1] Extend `tests/output.test.js`: add `tools` to `SECTION_IDS` between `certifications` and `languages`; change the nav link count assertion from 5 to 6 and assert one nav `href` equals `#tools`

### Implementation for Tools, User Story 1

- [X] T051 [US1] Implement `renderTools(list)` in `src/render.js` per the Tools section of `contracts/page-structure.md` (section id `tools`, `<h2 id="tools-heading" class="heading heading--2">Tools</h2>`, `<ul class="tool-list">` of `<li class="tool tag">` items with escaped names, blank names skipped, the shared empty-list message when no valid entries) and insert its output into `renderSections` between `renderCertifications` and `renderLanguages`, reading `content.tools ?? []`
- [X] T052 [US1] Add `<li><a href="#tools">Tools</a></li>` to the nav list in `src/template.html` directly after the Certifications link
- [X] T053 [US1] Add Tools styles to `src/styles.css`: `.tool-list` as a wrapping flex row with `gap: var(--space-2) var(--space-3, 12px)` and `max-width: var(--container-narrow)`; `.tool` inheriting the `tag` look with `white-space: normal` and `overflow-wrap: anywhere` so long tool names wrap at 360px; in the `@media print` block give `.tool` the same border-only treatment as `.tag`

**Checkpoint**: The Tools section renders and is reachable from the nav.

---

## Phase 9: Tools Section, User Story 3 (owner maintains tools) - Amendment 2026-09-10

**Goal**: The owner adds, edits, or removes tools by editing the `tools` list in
`content/resume.json`, with the same validation and empty-state behavior as the other
lists. Rules: the Tool entity in `data-model.md` and `contracts/resume-content.schema.json`.

**Independent Test**: Add a tool, rename one, remove one, and empty the list in a copy
of the content file; rebuild each time and confirm the Tools section reflects exactly
those changes and the empty list shows "No entries yet." with a `WARN tools:` line.
`npm test` passes the validate suite.

### Tests for Tools, User Story 3

- [X] T054 [P] [US3] Extend `tests/validate.test.js`: add `tools: [{ name: "Figma" }]` to `baseContent()`; add `tools` to the expected missing-key error list between `certifications` and `languages`; assert a blank `name` warns at `tools[1].name`; assert a non-object entry warns at `tools[1]` with `expected an object`; add `tools` to the list of keys checked in the empty-list test
- [X] T055 [P] [US3] Add a `tools` list to `content/resume.json` between `certifications` and `languages` with three placeholder entries such as `{ "name": "Tool One" }`, `{ "name": "Tool Two" }`, `{ "name": "Tool Three" }` (an extra key is harmless to the current validator, so this can land before T056)

### Implementation for Tools, User Story 3

- [X] T056 [US3] Extend `src/validate.js`: add `"tools"` to `LIST_KEYS` between `"certifications"` and `"languages"` (this makes the key required and covered by the empty-list warning); add `validateTools(list, warn)` that warns `tools[i]: expected an object, found <type>; the entry will be skipped.` for non-objects and `tools[i].name: missing or blank; expected the tool name.` for blank names, and call it after `validateCertifications`
- [X] T057 [US3] Walk the amended quickstart section 4 step 3 using a temporary copy of `content/resume.json` built with `node src/build.js --content <copy> --out <temp dir>`: add a tool and confirm it appears as the last tag; rename one and confirm; remove one and confirm; set `tools` to `[]` and confirm the `WARN tools: list is empty; the section will show "No entries yet."` line with exit 0 and the empty-state paragraph in the output; leave `content/resume.json` unchanged

**Checkpoint**: Tools are owner-maintainable from the content file with validation.

---

## Phase 10: Amendment Verification

**Purpose**: Prove the six-section page still meets every gate the five-section page met.

- [X] T058 Run `npm run check` at the repository root and confirm exit code 0 with all tests passing (the suite count rises from 63)
- [X] T059 Open `dist/index.html` in Chrome DevTools device mode at 360, 768, 1024, and 1440 widths per quickstart section 5 and confirm: no horizontal scrollbar; all six nav links visible inside the fixed header at 360 (the header is 104px tall there, so the two nav rows must fit); clicking "Tools" scrolls to the section with the heading fully below the header; the tags wrap within the text column; fix any failure in `src/styles.css` (if six links no longer fit in two rows at 360, reduce `.site-nav__list a` font-size to `0.625rem` or the row gap before changing `--header-height`)
- [X] T060 Run `npx cspell --no-progress "dist/index.html" "content/resume.json"` and add any flagged tool names from the sample content to the `words` array in `cspell.json`

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: no dependencies; T003 through T006 run in parallel after T001; T007 needs T002
- **Foundational (Phase 2)**: needs Phase 1; blocks every user story
- **User Stories (Phases 3 to 6)**: each needs Phase 2 complete
- **Polish (Phase 7)**: needs all four stories

### User Story Dependencies

- **US1 (P1)**: needs only Phase 2. It creates the render functions and both render and output test files.
- **US2 (P2)**: needs US1, because it changes `renderExperienceSection` created in T021.
- **US3 (P2)**: needs US1, because it extends the render and validate files created there. Independent of US2.
- **US4 (P3)**: needs Phase 2 only (the template and base header exist after T010 and T013). Its output-test task T037 extends the file created in T017, so it is simplest to run after US1.

### Amendment (Phases 8 to 10)

- **Phase 8 (Tools, US1)** and **Phase 9 (Tools, US3)** need the original Phases 1 to 7
  complete, which they are. The four test tasks T049, T050, T054, and T055 touch
  different files and can run together first.
- Phase 8 and Phase 9 implementation tasks touch different source files
  (`render.js`, `template.html`, `styles.css` versus `validate.js`) and may proceed in
  parallel; T057 needs both T051 and T056 because it checks rendered output.
- **Phase 10** needs Phases 8 and 9.

### Within Each Story

- Test tasks first, then validation rules, then rendering, then styles, then the manual verification task
- `src/validate.js`, `src/render.js`, and `src/styles.css` are each touched by several stories; tasks on the same file are never marked [P]

### Parallel Opportunities

- Phase 1: T003, T004, T005, T006 together
- Phase 2: T008, T009, T010, T013 together; then T014 alongside T011; T012 last
- US1: T016, T017, T018 together
- US2: T025, T026 together
- US3: T031, T032 together; US3 can run in parallel with US2 after US1 if two people are available, since T033/T034/T035 touch the same files as T027/T028/T029 only at different sections (coordinate merges)
- Polish: T042 and T043 together while T040 and T041 proceed in sequence

---

## Parallel Example: User Story 1

```bash
# Write all three test files together (different files, no dependencies):
Task: "Write tests/render.test.js ..."          # T016
Task: "Write tests/output.test.js ..."          # T017
Task: "Extend tests/validate.test.js ..."       # T018

# Then implement in order, since T019-T022 share src/validate.js and src/render.js:
Task: "Implement profile validation in src/validate.js"   # T019
Task: "Implement renderAbout in src/render.js"            # T020
Task: "Implement renderExperienceSection in src/render.js" # T021
Task: "Implement renderCertifications/renderLanguages"    # T022
Task: "Add About Me and entry styles to src/styles.css"   # T023
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1: Setup (T001 to T007)
2. Complete Phase 2: Foundational (T008 to T015)
3. Complete Phase 3: User Story 1 (T016 to T024)
4. **STOP and VALIDATE**: open `dist/index.html`, run `npm test`, walk the five quickstart rows named in the US1 independent test
5. The page is already shareable as a file or by uploading `dist/` to any static host

### Incremental Delivery

1. Setup + Foundational: the pipeline builds an empty page
2. US1: a complete, readable resume (MVP)
3. US2: experience ordering, "Present", and date validation
4. US3: certifications, languages, and empty states
5. US4: navigation polish, smooth scroll, reduced motion
6. Polish: print, animation, deploy workflow, and the full `npm run check` gate

### Publishing Note

The deploy workflow created in T042 only runs once the owner initializes a git
repository, pushes it to GitHub, and sets the Pages source to "GitHub Actions"
(quickstart section 6). Those are owner actions outside this task list.

---

## Notes

- [P] tasks touch different files and have no unfinished dependencies
- The story label maps each task to its user story for traceability
- Keep `content/resume.json` restored to the sample content after each manual verification task
- Never add a `<script>` element; the zero-JavaScript design is verified by T017
- Run `npm run check` before any publish; the constitution requires it
