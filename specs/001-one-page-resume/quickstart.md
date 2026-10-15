# Quickstart: One-Page Resume Website

**Feature**: 001-one-page-resume | **Date**: 2026-09-10

This guide shows how to build the page, run the automated checks, and perform the
manual checks that prove the feature meets its spec. Command names and flags are
defined in [contracts/build-cli.md](contracts/build-cli.md); the page structure being
verified is defined in [contracts/page-structure.md](contracts/page-structure.md).

## Prerequisites

- Node.js 20 or newer (`node --version`). Node.js 24 is installed on the owner's machine.
- A modern browser with developer tools (Chrome or Edge recommended for Lighthouse).
- Optional, for the full pre-deploy gate: `npm install` once, to get `html-validate`
  and `cspell`.

## 1. Build the page

```powershell
npm run build
```

Expected: standard output ends with `Built dist/index.html (0 errors, N warnings)`.
With the shipped sample content, N is 0.

Open `dist/index.html` directly in the browser (double-click, or drag into a tab).
No local server is needed because the page has no runtime data fetching.

Expected on screen, in order from top: fixed dark header with the name and six nav
links; About Me with the name as a large uppercase heading, a description, and four
contact rows with icons; Professional Experience; Academic Experience;
Certifications; Tools (a row of tags); Languages; footer with "Back to top".

## 2. Run automated tests

```powershell
npm test
```

Expected: all tests pass. The suites cover validation messages, date formatting and
ordering, rendered entry markup and icon pairing, and the built output rules (single
HTML file, anchors resolve, no script or form elements, external link attributes).

## 3. Run the pre-deploy gate

```powershell
npm install
npm run check
```

Expected: exit code 0. This runs the strict build, the tests, HTML validation, and the
English-US spell check. Any proper noun flagged by `cspell` belongs in the `words` list
of `cspell.json`, not in an ignore rule.

## 4. Validate content editing (User Stories 2 and 3)

1. Open `content/resume.json`.
2. Append a new object to `professionalExperience` with `title`, `description`,
   `startDate` `"2025-01"`, and no `endDate`.
3. Change the `level` of one entry in `languages` and add an object with a `name` to
   `tools`.
4. Remove one entry from `certifications`.
5. Run `npm run build` and reload the page.

Expected: the new role appears at the top of Professional Experience with `Present`
as its end date; the language shows the new level; the new tool appears as a tag in the Tools
section; the removed certification is gone;
nothing else changed; no file outside `content/` was touched.

Then break something on purpose:

6. Set an `endDate` to `"2024-13"` and run `npm run build`.

Expected: a `WARN professionalExperience[i].endDate` line, exit code 0, and the page
still renders. Run `npm run build -- --strict` and expect exit code 1. Restore the date.

## 5. Manual browser checks (User Stories 1 and 4)

Use the browser's device toolbar for widths.

| Check | Steps | Expected |
|-------|-------|----------|
| Section order | Scroll top to bottom | About Me, Professional Experience, Academic Experience, Certifications, Tools, Languages |
| Icons | Look at the four contact rows | Location, e-mail, phone, X icons visible in off-white on the dark background, each beside its text |
| X link | Click the X handle | Profile opens in a new tab; handle shows an external mark |
| E-mail and phone | Click each | Mail app opens with the address; on a phone, the dialer opens |
| Anchor navigation | Click each nav link | Page scrolls smoothly to the section; address bar shows `#section-id`; heading fully visible below the header |
| Reduced motion | Enable "Emulate CSS prefers-reduced-motion: reduce" in DevTools Rendering panel, click a nav link | Instant jump, no animation; About Me entrance animation absent |
| Keyboard | Reload, press Tab repeatedly | Skip link appears first, then every nav and contact link gets a gold focus ring; Enter activates links |
| Responsive | Set width to 360, 768, 1024, 1440 | No horizontal scrollbar on the page body; nav links all visible; text wraps |
| Long content | Temporarily paste a 1,200-character description, rebuild | Paragraph wraps within the text column, no overflow |
| JavaScript off | Disable JavaScript in DevTools, reload | Identical content and working anchor links (there is no script to disable, which confirms the zero-JS design) |
| Print | Press Ctrl+P, preview | White background, no nav or "Back to top", X URL printed after the handle, entries not split across pages |
| Accessibility | Run Lighthouse (Accessibility category) | Score 90 or higher, zero critical issues; contrast passes |
| Performance | Run Lighthouse (Performance, mobile) | Score 90 or higher; name and description visible within 2 seconds in the filmstrip |

## 6. Publish (once the repository is on GitHub)

1. Initialize git in the project and push to a GitHub repository.
2. In the repository settings, set Pages source to "GitHub Actions".
3. Push to the default branch. The workflow in `.github/workflows/deploy.yml` runs
   `npm run check` and publishes `dist/`.

Expected: the Pages URL serves the resume. Share that URL with applications.
Recipients can read the page but have no way to edit anything, because the site has no
forms, accounts, or editing interface and content lives only in the repository.
