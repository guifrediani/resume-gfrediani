# Research: One-Page Resume Website

**Feature**: 001-one-page-resume | **Date**: 2026-09-10

All items in the plan's Technical Context resolved to concrete decisions. No
NEEDS CLARIFICATION markers remain.

## 1. Rendering approach

**Decision**: Pre-render the page at build time with a Node.js script that reads
`content/resume.json` and writes a complete `dist/index.html`. The published page
contains no client-side JavaScript.

**Rationale**: FR-017 and FR-018 require content to live outside layout files, FR-019
requires validating it, and the spec's edge cases require the page to work with
JavaScript disabled. Build-time rendering satisfies all three and keeps the deployed
artifact plain static files, which is what Principle V asks for.

**Alternatives considered**:
- Runtime `fetch` of the JSON from the browser: fails on `file://`, fails with
  JavaScript disabled, and delays first paint of the name. Rejected.
- Content hand-written inside `index.html`: no validation, and the owner would edit
  markup to change a date. Rejected.
- Static site generator (Eleventy, Astro, Hugo): hundreds of transitive dependencies
  for one page and one template. Not justified under Principle V. Rejected.

## 2. Content file format

**Decision**: JSON, in `content/resume.json`, validated against the JSON Schema in
`contracts/resume-content.schema.json`.

**Rationale**: JSON is parsed by Node.js with no dependency, is listed by the
constitution as an accepted plain-text format, and the schema gives precise, testable
error messages. The owner edits it with Claude Code or any editor.

**Alternatives considered**:
- YAML: friendlier syntax but needs a parser dependency. Rejected for now; can be
  swapped later since the render layer only consumes a plain object.
- Markdown with front matter: good for long prose, but the resume is structured
  lists with short descriptions. Rejected.
- A JavaScript module exporting an object: allows comments and trailing commas but
  is not on the constitution's plain-text list. Rejected.

## 3. Build tooling and runtime

**Decision**: Node.js 24 locally with a minimum of Node.js 20, ES modules, built-in
modules only for the build (`node:fs`, `node:path`, `Intl`) and for tests
(`node:test`, `node:assert`). `package.json` declares `"type": "module"` and
`engines.node >= 20`.

**Rationale**: Node.js and npm are already installed on the owner's machine. The
built-in test runner removes the need for a test framework. Keeping the script
dependency-free means `npm run build` works immediately after cloning, with
`npm install` only needed for the optional pre-deploy checks.

**Alternatives considered**:
- Python script: also installed, but the project is a web page and the pre-deploy
  gates (`html-validate`, `cspell`) are npm packages, so one toolchain is simpler.
- Bundlers (Vite, esbuild): nothing to bundle; there is no client JavaScript.

## 4. Typography and fonts

**Decision**: Load Inter Tight (weights 800, 900) and Inter (weights 400, 700) from
Google Fonts with `preconnect` hints and `display=swap`. Fallback stack is
`Arial, sans-serif` as the design system specifies. Oswald is not loaded.

**Rationale**: These are the free substitutes the design system names for Riot Sans
and Inter V. `display=swap` keeps text readable while fonts load, protecting the
2-second readability target. Oswald is only used by the design system for condensed
CTAs and counters, which this feature does not include.

**Alternatives considered**:
- Self-hosted WOFF2 files: better privacy and offline behavior but adds binaries to
  the repository. Deferred; can be adopted later without touching the content model.
- System fonts only: loses the heavy display look that defines the design system.

## 5. Icons on a dark background

**Decision**: Copy the four PNGs unchanged to `dist/icons/` and render each as an
`<img>` at 24 by 24 CSS pixels with explicit `width` and `height` attributes, and
apply `filter: invert(0.9)` in CSS so the black glyphs render close to the design
system's text color `#E7E6E3`. Decorative `alt=""` is used because the adjacent text
label already names the detail.

**Rationale**: Inspection shows all four icons are 512 by 512 black glyphs on a
transparent background (RGBA or palette with a transparency chunk). Inverting in CSS
avoids editing or duplicating the owner's asset files and keeps the icons folder as
the single source (FR-008).

**Alternatives considered**:
- Editing the PNGs to white: creates a second copy of the owner's assets and breaks
  the "use the icons folder" instruction if they are later replaced.
- Inline SVG: cleaner scaling but the owner supplied PNGs and asked to use them.

## 6. Smooth scroll and reduced motion

**Decision**: CSS only.

```css
@media (prefers-reduced-motion: no-preference) {
  html { scroll-behavior: smooth; }
}
html { scroll-padding-top: 90px; }
```

Entrance animations in the About Me section use CSS keyframes guarded by the same
media query, following the design system's reveal-up pattern with its easing curve.

**Rationale**: Meets FR-022 through FR-024 with zero JavaScript. `scroll-padding-top`
of 90px matches the design system's header rule and keeps section headings visible
below the 70px fixed header.

**Alternatives considered**:
- JavaScript `scrollIntoView` handlers: unnecessary and would fail with JavaScript
  disabled.

## 7. Header behavior

**Decision**: A fixed header with an always-opaque `--color-bg` background, containing
the owner's name as a home link (`#about`) and the section navigation. No scrolled
state toggle.

**Rationale**: The design system's transparent-to-opaque header exists to sit over a
hero image. This page has no hero image, so a transparent header over the same dark
background is visually identical to an opaque one. Dropping the toggle removes the
only reason for client-side JavaScript.

**Alternatives considered**:
- Keep the transparent-to-scrolled toggle via a small IntersectionObserver script:
  adds JavaScript for no visible benefit. Rejected.

## 8. Date input and display

**Decision**: Dates in the content file use the `YYYY-MM` string form. The build
formats them for display with `Intl.DateTimeFormat("en-US", { month: "short",
year: "numeric", timeZone: "UTC" })`, giving strings like `Mar 2023`. A missing or
`null` `endDate` renders as `Present`. Entries sort by `startDate` descending; equal
start dates keep their order in the file.

**Rationale**: FR-013 and FR-014. `YYYY-MM` sorts lexically, is unambiguous, and
matches the month-year granularity a resume needs. UTC avoids month rollover bugs.

**Alternatives considered**:
- Free-text dates like "March 2023": unsortable and unvalidatable. Rejected.
- Full `YYYY-MM-DD`: more precision than a resume shows. Rejected, though the schema
  can be widened later.

## 9. Validation severity model

**Decision**: Two severities.

- **Error** (build stops, exit code 1): the file is not valid JSON, or the top-level
  shape is wrong (a required section key is missing or not an array). Nothing
  sensible can be rendered.
- **Warning** (build continues, exit code 0): a required field on an entry is missing
  or blank, a date is malformed or `startDate` is after `endDate`, an icon file is
  missing, the X URL is not an `https://x.com/` or `https://twitter.com/` profile, or
  a list is empty. The affected field is omitted or a placeholder is rendered.

`npm run build --strict` (used by `npm run check` and the deploy workflow) promotes
warnings to errors.

**Rationale**: FR-019 asks for reporting without blocking local rendering, while the
constitution requires checks to pass before deploy. Two severities give both.

## 10. Automated quality gates

**Decision**: `npm run check` runs, in order: `build --strict`, `node --test`,
`html-validate dist/index.html`, and `cspell` over `dist/index.html` and
`content/resume.json` with the `en-US` dictionary and a project word list for proper
nouns. Lighthouse accessibility and responsive checks are manual, documented in
`quickstart.md`.

**Rationale**: Covers Definition of Done items 1 through 3 automatically and item 5
partly (an output test flags fixed-width elements). Items 4 and the remainder of 5
need a browser and are checked by hand.

**Alternatives considered**:
- Playwright or Puppeteer for automated viewport screenshots and axe scans: powerful
  but pulls a browser binary into the project. Deferred until manual checks become a
  bottleneck.

## 11. External link handling

**Decision**: The X profile link uses `target="_blank"`,
`rel="noopener noreferrer"`, a visible external-link mark after the handle, and
visually hidden text "(opens in a new tab)" for screen readers. E-mail uses
`mailto:`, phone uses `tel:` with the number normalized to digits and a leading plus.

**Rationale**: Principle II permits external links only when they open in a new tab
and are visibly marked. FR-010 covers e-mail and phone behavior.

## 12. Hosting and deployment

**Decision**: GitHub Pages, published by a GitHub Actions workflow that runs
`npm ci`, `npm run check`, and uploads `dist/`. The workflow file is created in this
feature but only takes effect after the owner initializes a git repository and pushes
it to GitHub.

**Rationale**: The owner's goal is a link to send with job applications. GitHub Pages
is free, static, and needs no server, which matches Principle V. The `check` step
enforces the constitution's "checks MUST run before any deploy" rule.

**Alternatives considered**:
- Netlify or Cloudflare Pages: equally suitable; GitHub Pages chosen because the
  repository will live on GitHub anyway. The `dist/` output is portable to any of
  them.
- Manual upload: no gate enforcement. Rejected.

## 13. Print presentation

**Decision**: A `@media print` block hides the header navigation, removes fixed
positioning, switches to a white background with dark text, expands all sections, and
prints the X profile URL after the handle so the link survives on paper.

**Rationale**: FR-027 and the constitution's print constraint. A recruiter may print
the page.

## 14. Tools section (amendment, 2026-09-10)

**Decision**: Add a `tools` list to the content file, each entry an object with a
required `name`. Render it as a section with id `tools` between Certifications and
Languages, showing the names as a wrapping row of design-system tags (section 7.3),
which the design system itself maps to "skills / tools" on a resume. Add a "Tools"
link to the header nav after "Certifications". Empty list shows "No entries yet."
like the other lists. Entries keep file order.

**Rationale**: FR-028. Objects rather than bare strings keep every list in the file
the same shape, so the owner learns one pattern, and leave room for optional fields
such as a category later without changing the schema's structure. Tags are the design
system's own component for this content and wrap cleanly at 360px.

**Alternatives considered**:
- Bare strings (`"tools": ["Figma", "Jira"]`): shorter to type, but inconsistent with
  the other lists and harder to extend. Rejected.
- Reusing the Languages card layout: implies a level or rating that tools do not
  have. Rejected.
- Grouping tools by category: not requested; can be added as an optional field later.

**Header check**: at 360px the nav wraps to two rows. "Tools" adds about 40px to the
second row ("Certifications", "Languages", "Tools" together measure under 260px), so
the fixed 104px mobile header height and 124px scroll offset still hold. The
implementation must re-run the overflow and anchor checks to confirm.
