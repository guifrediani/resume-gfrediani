# Implementation Plan: One-Page Resume Website

**Branch**: `001-one-page-resume` | **Date**: 2026-09-10 | **Spec**: [spec.md](spec.md)

**Input**: Feature specification from `/specs/001-one-page-resume/spec.md`

**Planning input from owner**: The site exists so Guilherme can hand a single link to
recruiters when applying for positions. Anyone who receives the link is a read-only
visitor and can never edit content.

## Summary

Build a single static HTML page that presents Guilherme's resume in six fixed
sections (About Me, Professional Experience, Academic Experience, Certifications,
Languages), styled to the project's design-system.md, with contact icons from the
icons folder and in-page anchor navigation. All content lives in one JSON file that
the owner edits; a zero-dependency Node.js build script validates that file and
renders `dist/index.html`. The published page needs no server, no client-side
JavaScript, and exposes no write surface, so a recipient of the link can only read.

## Amendments

**2026-09-10, Tools section.** The owner asked for a Tools section after Certifications
listing tools he has experience with. It follows the same guidelines as the other list
sections: entries live in `content/resume.json` under a new `tools` key, each with a
`name`, rendered in file order as design-system tags inside a section with id `tools`
placed between Certifications and Languages. The header nav gains a sixth link.
Affected files: `src/validate.js`, `src/render.js`, `src/template.html`,
`src/styles.css`, the content schema, the sample content, and all four test suites.
Research decision 14 and the updated data model, page-structure contract, and quickstart
carry the details. No constitution principle is affected: the page stays single,
static, anchor-navigated, English-US, and owner-only.

## Technical Context

**Language/Version**: HTML5, CSS3, JavaScript (ES2022 modules) for the build script;
Node.js 24 installed locally, minimum supported Node.js 20 LTS.

**Primary Dependencies**: None at runtime. Build and tests use Node.js built-ins only
(`node:fs`, `node:path`, `node:test`, `Intl`). Two development-only dependencies,
`html-validate` and `cspell`, provide the constitution's pre-deploy HTML and
English-US spell-check gates (justified below). Google Fonts serves the display and
body typefaces named in the design system, with a full system-font fallback stack.

**Storage**: One plain-text file, `content/resume.json`. No database.

**Testing**: `node --test` for build-script unit tests and rendered-output checks;
`html-validate` for markup; `cspell` (en-US) for visible text; manual browser checks
for responsive widths, reduced motion, keyboard focus, print, and Lighthouse
accessibility.

**Target Platform**: Evergreen desktop and mobile browsers (current and previous
major versions of Chrome, Edge, Firefox, Safari, iOS Safari). Hosted as static files;
GitHub Pages is the intended host.

**Project Type**: Static single-page website with a small build step.

**Performance Goals**: Name and description visible within 2 seconds on a typical
mobile connection (SC-004). Total transfer excluding web fonts under 300 KB. Lighthouse
performance and accessibility scores of 90 or higher.

**Constraints**: Exactly one HTML page. Content and navigation must work with
JavaScript disabled. English-US throughout. WCAG 2.1 AA contrast. No horizontal
overflow from 360px up. Print stylesheet. No visitor-writable surface of any kind.

**Scale/Scope**: Six sections, tens of entries at most, one content owner, one
deployed page. No growth path to multiple pages is needed or wanted.

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Principle | Status | How this plan satisfies it |
|-----------|--------|----------------------------|
| I. English-US Only | PASS | All source, content, docs, and commit messages in English-US. `cspell` with the `en-US` dictionary runs on the rendered page and the content file as a pre-deploy gate. The Portuguese design-system.md is an input reference only and produces no visible text. |
| II. Single-Page Layout | PASS | The build emits exactly one HTML file. An output test fails if `dist/` contains more than one `.html` file or any internal `href` that is not a fragment. The only non-fragment links are `mailto:`, `tel:`, and the X profile, which opens in a new tab and is marked external. |
| III. In-Page Anchor Navigation | PASS | Header navigation uses `href="#section-id"`. Smooth scroll comes from CSS `scroll-behavior: smooth` wrapped in a `prefers-reduced-motion: no-preference` query, so reduced-motion users get an instant jump. `scroll-padding-top` offsets the fixed header. An output test asserts every nav `href` matches an existing `id`. |
| IV. Single Content Owner | PASS | No forms, inputs, comments, accounts, or admin page exist. Content changes happen only by editing `content/resume.json` in the repository, which only the owner controls. |
| V. Simplicity and Static Delivery | PASS (with justified additions) | The published page is static HTML and CSS with zero client-side JavaScript. Content is plain-text JSON. The additions below are the minimum needed to keep content separate from layout while meeting the constitution's own quality gates. |

**Justified additions under Principle V**

| Addition | Concrete need static assets alone cannot meet | Simpler alternative rejected because |
|----------|-----------------------------------------------|--------------------------------------|
| Node.js build script (zero dependencies) | FR-017 and FR-018 require editing one content file without touching layout, and FR-019 requires validating that file. A runtime `fetch` of JSON would break with JavaScript disabled and on `file://`. | Hand-editing content inside `index.html` mixes content with markup and makes add/edit/remove error-prone for the owner. |
| Google Fonts link (Inter Tight, Inter) | The design system specifies these families for its heavy display typography. | Self-hosting adds binary font files to the repo; system fonts alone lose the design's signature look. Fallback stack keeps text readable if fonts fail. |
| `html-validate` (dev only) | Constitution workflow section says automated HTML validation MUST run before any deploy once a build step exists. | Manual validation is not repeatable as a deploy gate. |
| `cspell` (dev only) | Definition of Done item 3 requires an English-US spell check of visible text. | Manual proofreading does not scale with content edits. |

**Post-design re-check (after Phase 1)**: All five principles still pass. The data
model introduces no server, the contracts expose no write interface, and the page
structure contract keeps a single HTML document. No Complexity Tracking entries are
required.

## Project Structure

### Documentation (this feature)

```text
specs/001-one-page-resume/
├── plan.md              # This file
├── spec.md              # Feature specification
├── research.md          # Phase 0 decisions
├── data-model.md        # Phase 1 content model and validation rules
├── quickstart.md        # Phase 1 build, test, and manual validation guide
├── contracts/
│   ├── resume-content.schema.json   # JSON Schema for content/resume.json
│   ├── page-structure.md            # Section ids, DOM, link and icon contract
│   └── build-cli.md                 # npm scripts, exit codes, message format
├── checklists/
│   └── requirements.md  # Spec quality checklist
└── tasks.md             # Phase 2 output (/speckit-tasks, not created here)
```

### Source Code (repository root)

```text
content/
└── resume.json          # The single content source the owner edits

icons/                   # Existing contact icons (unchanged, copied to dist/icons)
├── e-mail.png
├── location.png
├── phone.png
└── x.png

src/
├── build.js             # Entry point: load, validate, render, copy assets to dist/
├── validate.js          # Content validation (errors and warnings) per data-model.md
├── render.js            # Pure functions: content object -> HTML string
├── format.js            # Date formatting and sorting helpers
├── template.html        # Page skeleton with named placeholders
└── styles.css           # Design-system tokens and component styles, incl. print

tests/
├── validate.test.js     # Validation rules and message format
├── format.test.js       # Month-year formatting, "Present", ordering
├── render.test.js       # Section order, entry markup, icon pairing, external link
└── output.test.js       # Built dist/: single HTML file, anchors resolve, no overflow-prone markup

.github/
└── workflows/
    └── deploy.yml       # Build + check + publish dist/ to GitHub Pages (activates once the repo is pushed)

dist/                    # Generated output, ignored by git
├── index.html
├── styles.css
└── icons/

package.json             # scripts: build, check, test; devDependencies: html-validate, cspell
cspell.json              # en-US dictionary, project word list (names, product names)
.htmlvalidate.json       # html-validate ruleset
.gitignore               # dist/, node_modules/
design-system.md         # Existing design reference (unchanged)
```

**Structure Decision**: A single flat project. `src/` holds the build script and the
page assets, `content/` holds the one file the owner edits, `tests/` holds the
`node --test` suites, and `dist/` is the deployable output. There is no frontend or
backend split because there is no server and no client-side JavaScript. The
`.github/workflows/deploy.yml` file is prepared here so the resume gets a shareable URL
as soon as the project is pushed to GitHub, which is the owner's stated goal.

## Complexity Tracking

No constitution violations. The build step, fonts, and two development dependencies
are justified in the Constitution Check table above and do not deviate from any
principle.
