# Data Model: One-Page Resume Website

**Feature**: 001-one-page-resume | **Date**: 2026-09-10

The whole model is one JSON document, `content/resume.json`. The formal schema is in
[contracts/resume-content.schema.json](contracts/resume-content.schema.json). This
file explains the entities, rules, and derived values in plain language.

## Document shape

```json
{
  "profile": { ... },
  "professionalExperience": [ ... ],
  "academicExperience": [ ... ],
  "certifications": [ ... ],
  "tools": [ ... ],
  "languages": [ ... ]
}
```

All six top-level keys are required. The five list keys must be arrays, and an empty
array is allowed (the section then renders its heading and a "No entries yet"
message).

## Entities

### Profile

The About Me data. Exactly one.

| Field | Type | Required | Rules |
|-------|------|----------|-------|
| `name` | string | yes | Non-blank. Rendered as the page `<h1>` and the `<title>`. |
| `description` | string | yes | Non-blank. One paragraph; line breaks are preserved as paragraph breaks. |
| `location` | string | no | Blank or missing omits the location contact detail. |
| `email` | string | no | Must contain one `@` with text on both sides. Blank omits the detail. |
| `phone` | string | no | Display value as written. A `tel:` target is derived by keeping digits and a leading `+`. Blank omits the detail. |
| `x` | object | no | Blank or missing omits the X detail. |
| `x.handle` | string | yes (if `x` present) | Display text, for example `@guilherme`. A missing leading `@` is added at render time. |
| `x.url` | string | yes (if `x` present) | Must start with `https://x.com/` or `https://twitter.com/`. Opens in a new tab. |

Spec FR-007 expects all four contact details to be present. A missing one is a
warning, not an error, so the page still renders while the owner fills content in.

### Experience Entry

One item in `professionalExperience` or `academicExperience`. The two lists share the
same shape; the list it sits in decides the section.

| Field | Type | Required | Rules |
|-------|------|----------|-------|
| `title` | string | yes | Non-blank. Role for professional entries, degree and institution for academic entries, in whatever wording the owner prefers. |
| `company` | string | no | Employer name, shown under the title. Blank or missing hides it. |
| `description` | string | yes | Non-blank. Line breaks become paragraph breaks. |
| `startDate` | string | yes | `YYYY-MM`, month 01 to 12. |
| `endDate` | string or null | no | `YYYY-MM` when present. Missing or `null` means ongoing and renders as `Present`. |

Rules across fields:

- If both dates are present and `startDate` is later than `endDate`, emit a warning
  and still render the entry as written.
- Entries are displayed sorted by `startDate` descending. Entries with equal
  `startDate` keep their file order. Entries with an invalid `startDate` sort last and
  produce a warning.

### Certification

One item in `certifications`.

| Field | Type | Required | Rules |
|-------|------|----------|-------|
| `title` | string | yes | Non-blank. |
| `date` | string | yes | `YYYY-MM`. Rendered as month and year, for example `Nov 2024`. |

Certifications display in the order written in the file. The owner controls order
directly; the build does not sort them.

### Language

One item in `languages`.

| Field | Type | Required | Rules |
|-------|------|----------|-------|
| `name` | string | yes | Non-blank, for example `Portuguese`. |
| `level` | string | yes | Non-blank free text, for example `Native`, `Fluent`, `C1`. |

Languages display in file order.

### Tool

One item in `tools`. Added by the 2026-09-10 amendment.

| Field | Type | Required | Rules |
|-------|------|----------|-------|
| `name` | string | yes | Non-blank, for example `Figma` or `Jira`. |

Tools display in file order as tags. The section sits between Certifications and
Languages. A blank `name` warns and the entry is skipped.

### Contact Detail (derived, not stored)

The render step turns the profile fields into up to four contact details in this
fixed order: location, e-mail, phone, X. Each carries a kind, a display value, an
optional link target, and an icon file name.

| Kind | Source field | Link target | Icon file |
|------|--------------|-------------|-----------|
| location | `profile.location` | none | `icons/location.png` |
| email | `profile.email` | `mailto:<email>` | `icons/e-mail.png` |
| phone | `profile.phone` | `tel:<normalized>` | `icons/phone.png` |
| x | `profile.x` | `x.url`, new tab, external mark | `icons/x.png` |

The build checks that each icon file exists in `icons/`; a missing file is a warning
and the detail renders as text without an image.

## Derived values

| Derived value | From | Rule |
|---------------|------|------|
| Display date | any `YYYY-MM` | `Intl.DateTimeFormat("en-US", { month: "short", year: "numeric", timeZone: "UTC" })` on the first day of that month, giving `Mar 2023`. |
| End label | `endDate` | `Present` when missing or `null`. |
| Section id | fixed | `about`, `professional-experience`, `academic-experience`, `certifications`, `tools`, `languages`. See page-structure contract. |
| Page title | `profile.name` | `<name> - Resume`. |
| `tel:` target | `profile.phone` | Strip everything except digits; keep a leading `+`. |

## Validation severities

| Severity | Condition | Build behavior |
|----------|-----------|----------------|
| Error | File is not valid JSON; a top-level key is missing; a list key is not an array; `profile` is not an object. | Stop, print errors, exit 1. |
| Warning | Blank required field on an entry; malformed or reversed dates; missing icon file; X URL outside the allowed hosts; malformed e-mail; empty list; missing contact detail. | Print warnings, render with the field omitted or a placeholder, exit 0. With `--strict`, treat as errors and exit 1. |

Message format is defined in [contracts/build-cli.md](contracts/build-cli.md).

## State transitions

None. The content file has no lifecycle beyond edit, validate, render. There are no
drafts, no publishing states, and no per-visitor state.

## Sample content

A starter `content/resume.json` with placeholder values (one entry per list, all four
contact details filled) ships with the implementation so the page renders on first
build. The owner replaces the placeholders with real content.
