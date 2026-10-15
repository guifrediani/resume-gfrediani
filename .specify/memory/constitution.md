<!--
Sync Impact Report
==================
Version change: (template, unversioned) -> 1.0.0
Bump rationale: Initial ratification. All placeholder tokens replaced with
project-specific content; five principles and two supporting sections defined.

Modified principles: n/a (initial adoption)

Added sections:
- Core Principles (I-V)
- Content & Access Constraints
- Development Workflow & Quality Gates
- Governance

Removed sections: none

Templates requiring updates: none checked in this run (dependent templates read
the constitution at runtime; no template files were modified).

Follow-up TODOs: none. No placeholders deferred.
-->

# Resume Guilherme Constitution

## Core Principles

### I. English-US Only

All user-facing text, content, code comments, commit messages, documentation, and
specification artifacts MUST be written in English (United States). Spelling,
punctuation, and date/number formatting MUST follow US conventions (for example,
"color" not "colour", "organize" not "organise"). Non-English words are permitted only
as proper nouns (names of people, companies, products, or places) or as labeled
quotations.

Rationale: The website is a professional resume aimed at an English-speaking audience.
A single, consistent language variant avoids mixed-locale text and keeps every artifact
in the project reviewable against one standard.

### II. Single-Page Layout (NON-NEGOTIABLE)

The website MUST be delivered as exactly one HTML page. All resume content (summary,
experience, education, skills, projects, contact, and any future section) MUST live on
that single page as distinct sections. No feature MAY introduce a second page, a
multi-page router, or a navigation flow that leaves the page. External links (for
example, to a repository, a social profile, or a downloadable PDF) are permitted only
when they open in a new tab and are visibly marked as external.

Rationale: The product goal is a one-page resume. A single page keeps the experience
fast, printable, and scannable, and removes an entire class of navigation and routing
complexity.

### III. In-Page Anchor Navigation

Every internal navigation link MUST target a section on the same page using a fragment
identifier (for example, `#experience`) and MUST scroll the viewport to that section
rather than loading a new document. Each navigable section MUST have a unique, stable,
human-readable `id`. Scrolling MUST be smooth where the user has not requested reduced
motion, and MUST respect `prefers-reduced-motion` by falling back to an instant jump.
Fixed or sticky headers MUST NOT hide the section heading after an anchor jump.

Rationale: In-page scroll navigation is the concrete mechanism that makes the
single-page principle usable. Stable ids also make sections directly linkable and
testable.

### IV. Single Content Owner

Guilherme is the sole person authorized to add, edit, or remove website content. The
project MUST NOT ship any feature that lets visitors or third parties create, modify, or
submit content (no comments, no forms that write data, no user accounts, no CMS with
multiple roles). If an admin or editing surface exists at all, it MUST be protected so
that only the owner can access it, and it MUST NOT be reachable from the public page.

Rationale: A resume is personal, authoritative content. Removing multi-user editing
eliminates authentication, authorization, moderation, and data-storage concerns that
would otherwise dominate a tiny project.

### V. Simplicity and Static Delivery

The site MUST be buildable and viewable without a server-side runtime; static HTML,
CSS, and client-side JavaScript are the default. Any dependency, framework, build step,
or dynamic capability MUST be justified in the feature plan by a concrete need that
static assets cannot meet. Content MUST be editable in plain text (HTML, Markdown, JSON,
or YAML) so the owner can update it without a database. Prefer the smallest solution
that satisfies the spec; remove unused code and assets rather than leaving them behind.

Rationale: A single-owner, single-page resume has no need for server infrastructure.
Keeping the stack static minimizes hosting cost, attack surface, and maintenance.

## Content & Access Constraints

- **Language**: English-US applies to visible copy, alt text, metadata (`<title>`,
  meta description), and any generated PDF or print stylesheet output.
- **Sections**: Each resume section MUST be an addressable block with a heading and a
  unique `id`. Section order is defined in the feature spec; reordering is a content
  change owned by Guilherme.
- **Access model**: Public read-only. There is exactly one editor. No visitor-writable
  surface may exist. Analytics, if added, MUST be read-only and MUST NOT collect
  personal data beyond what the chosen provider requires by default.
- **Accessibility**: The page MUST be navigable by keyboard, with visible focus states
  on anchor links, semantic headings in order (one `h1`, then `h2` per section), and
  color contrast meeting WCAG 2.1 AA.
- **Responsiveness**: The single page MUST render correctly from 360px wide up to
  desktop widths without horizontal scrolling of the page body.
- **Print**: A print stylesheet SHOULD present the same content as a clean one- or
  two-page document with navigation chrome hidden.

## Development Workflow & Quality Gates

- **Spec-first**: Every feature MUST start with a spec produced via `/speckit-specify`,
  followed by `/speckit-plan` and `/speckit-tasks`, before implementation begins.
- **Constitution check**: Each plan MUST include a Constitution Check that confirms the
  feature keeps the site to one page, uses anchor navigation for internal links, stays
  English-US, adds no multi-user editing, and justifies any non-static dependency.
- **Definition of done** for any feature touching the page:
  1. All internal links resolve to an existing section `id` on the same page.
  2. No new HTML document or route is introduced.
  3. Visible text passes an English-US spell check.
  4. Keyboard navigation and reduced-motion behavior verified manually or by test.
  5. The page renders at 360px and desktop widths without horizontal overflow.
- **Review**: Because there is a single owner, self-review against the Definition of
  Done is acceptable. Automated checks (link validation, HTML validation, spell check)
  SHOULD be added as soon as a build step exists and MUST run before any deploy.
- **Content changes vs. code changes**: Editing resume text is a content change and
  does not require a new spec. Changing structure, sections, navigation, styling
  system, or dependencies is a code change and follows the spec-first workflow.

## Governance

This constitution supersedes any other practice, template default, or convention in
the project. When a spec, plan, or task conflicts with a principle here, the principle
wins and the artifact MUST be revised.

- **Amendments**: Any change to this document MUST be made through the
  `/speckit-constitution` command, MUST update the Sync Impact Report comment at the
  top of the file, and MUST bump the version according to the policy below. The sole
  owner (Guilherme) approves amendments.
- **Versioning policy**: Semantic versioning.
  - MAJOR: removing or redefining a principle in a backward-incompatible way (for
    example, allowing multiple pages or multiple editors).
  - MINOR: adding a principle or section, or materially expanding guidance.
  - PATCH: clarifications, wording, and typo fixes that do not change meaning.
- **Compliance review**: Every plan's Constitution Check and every feature's
  Definition of Done are the enforcement points. Any deviation MUST be recorded in the
  plan's Complexity Tracking table with a justification and a simpler alternative that
  was rejected.
- **Runtime guidance**: Day-to-day development guidance for AI agents lives in
  `CLAUDE.md` at the repository root once created; it MUST NOT contradict this
  constitution.

**Version**: 1.0.0 | **Ratified**: 2026-09-10 | **Last Amended**: 2026-09-10
