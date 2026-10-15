# Contract: Build and Check Commands

**Feature**: 001-one-page-resume | **Date**: 2026-09-10

The build script is the only executable interface in the project. This contract fixes
its commands, inputs, outputs, exit codes, and message format so tests and the deploy
workflow can depend on them.

## npm scripts

| Script | Command | Purpose |
|--------|---------|---------|
| `npm run build` | `node src/build.js` | Validate `content/resume.json`, render `dist/index.html`, copy `src/styles.css` and `icons/` into `dist/`. Warnings do not stop the build. |
| `npm run build -- --strict` | `node src/build.js --strict` | Same, but any warning is treated as an error and the build fails. |
| `npm test` | `node --test tests/` | Unit tests for validate, format, render, and the built output. Runs a build into a temporary directory first where needed. |
| `npm run check` | `npm run build -- --strict && npm test && html-validate dist/index.html && cspell --no-progress "dist/index.html" "content/resume.json"` | The pre-deploy gate. Must pass before any publish. |

`npm run build` and `npm test` need no installed packages. `npm run check` needs
`npm install` for `html-validate` and `cspell`.

## Inputs

| Path | Role |
|------|------|
| `content/resume.json` | Content source. Must satisfy `contracts/resume-content.schema.json`. |
| `src/template.html` | Page skeleton with `{{placeholder}}` slots filled by `render.js`. |
| `src/styles.css` | Copied as-is to `dist/styles.css`. |
| `icons/*.png` | Copied as-is to `dist/icons/`. Only files referenced by the data model are required. |

Optional flags:

| Flag | Effect |
|------|--------|
| `--strict` | Promote warnings to errors (exit 1). |
| `--out <dir>` | Write output to `<dir>` instead of `dist/`. Used by tests. |
| `--content <file>` | Read content from `<file>` instead of `content/resume.json`. Used by tests. |

## Outputs

| Path | Content |
|------|---------|
| `dist/index.html` | The single page, per `contracts/page-structure.md`. |
| `dist/styles.css` | Copy of `src/styles.css`. |
| `dist/icons/` | Copy of `icons/`. |

`dist/` is recreated on every build. Anything else inside it is deleted.

## Exit codes

| Code | Meaning |
|------|---------|
| 0 | Build succeeded. Warnings may have been printed. |
| 1 | Validation errors (or warnings under `--strict`). No output written. |
| 2 | Usage error: unknown flag, unreadable content path, or missing template. |

## Message format

One message per line on standard error, sorted errors first, then warnings, each in
file order.

```text
<SEVERITY> <json-path>: <message>
```

- `SEVERITY` is `ERROR` or `WARN`.
- `json-path` uses dot and bracket notation from the document root, for example
  `professionalExperience[2].endDate` or `profile.x.url`.
- `message` is a single English-US sentence stating what is wrong and what is
  expected.

Examples:

```text
ERROR (root): content/resume.json is not valid JSON: Unexpected token } at line 14.
ERROR certifications: expected an array, found object.
WARN professionalExperience[0].endDate: expected YYYY-MM, found "2024-13".
WARN professionalExperience[1]: startDate 2023-05 is after endDate 2022-01.
WARN profile.phone: missing; the phone contact detail will be omitted.
WARN profile.x.url: expected an https://x.com/ or https://twitter.com/ profile, found "http://example.com".
WARN icons/e-mail.png: file not found; the e-mail detail will render without an icon.
WARN languages: list is empty; the section will show "No entries yet."
```

After the message list, a one-line summary is printed on standard output:

```text
Built dist/index.html (0 errors, 2 warnings)
```

## Behavior on warnings

When a warning affects rendering, the build applies the fallback stated in the
message: omit the contact detail, skip the icon image, render the malformed date as
its raw string, or show the empty-list message. The page is still written so the owner
can preview the content while fixing it.

## Deploy workflow contract

`.github/workflows/deploy.yml` runs on push to the default branch:

1. `npm ci`
2. `npm run check`
3. Upload `dist/` as the Pages artifact and deploy.

A failing `check` step blocks deployment, which is how the constitution's "checks MUST
run before any deploy" rule is enforced.
