# Contract: Page Structure

**Feature**: 001-one-page-resume | **Date**: 2026-09-10

This contract fixes the observable structure of `dist/index.html` so that tests,
styles, and future features can rely on it. It describes what the rendered page must
contain, not how the build produces it.

## Document

- Exactly one HTML file is produced: `dist/index.html`.
- `<html lang="en-US">`.
- `<title>` is `<profile.name> - Resume`.
- `<meta name="description">` is the first 160 characters of `profile.description`.
- `<meta name="viewport" content="width=device-width, initial-scale=1">`.
- No `<script>` elements. No `<form>`, `<input>`, `<textarea>`, `<button type="submit">`,
  or any other element that accepts visitor input.
- A skip link is the first focusable element: `<a class="skip-link" href="#main">Skip to main content</a>`.

## Landmarks and section ids

| Order | Landmark | Element | `id` | Heading |
|-------|----------|---------|------|---------|
| 0 | Body | `<body id="top">` | `top` | none; the back-to-top target. It must not sit on the fixed header, which is always "in view" and so never triggers a scroll. |
| 0.1 | Header | `<header class="site-header">` | none | none (contains name link and nav) |
| 1 | Main | `<main id="main">` | `main` | none |
| 1.1 | Section | `<section id="about">` | `about` | `<h1>` profile name |
| 1.2 | Section | `<section id="professional-experience">` | `professional-experience` | `<h2>Professional Experience</h2>` |
| 1.3 | Section | `<section id="academic-experience">` | `academic-experience` | `<h2>Academic Experience</h2>` |
| 1.4 | Section | `<section id="certifications">` | `certifications` | `<h2>Certifications</h2>` |
| 1.5 | Section | `<section id="tools">` | `tools` | `<h2>Tools</h2>` |
| 1.6 | Section | `<section id="languages">` | `languages` | `<h2>Languages</h2>` |
| 2 | Footer | `<footer class="site-footer">` | none | none |

Rules:

- Section order is fixed and must match the table.
- Every `<section>` is labeled by its heading via `aria-labelledby`.
- Exactly one `<h1>`. Each section heading is an `<h2>`. Entry titles are `<h3>`.
- Ids are stable identifiers; renaming one is a breaking change to this contract.

## Header navigation

```html
<header class="site-header">
  <a class="site-header__brand" href="#about">{profile.name}</a>
  <nav aria-label="Sections">
    <ul>
      <li><a href="#about">About</a></li>
      <li><a href="#professional-experience">Experience</a></li>
      <li><a href="#academic-experience">Education</a></li>
      <li><a href="#certifications">Certifications</a></li>
      <li><a href="#tools">Tools</a></li>
      <li><a href="#languages">Languages</a></li>
    </ul>
  </nav>
</header>
```

- Every `href` in the nav is a fragment that matches a section `id` above.
- The header is fixed at the top, 70px tall on desktop and 50px on mobile, opaque
  `--color-bg`.
- `html { scroll-padding-top: 90px; }` so a targeted section heading clears the header.
- Smooth scrolling is enabled only inside `@media (prefers-reduced-motion: no-preference)`.
- On viewports narrower than 550px the nav labels may wrap to a second row or shrink,
  but all six links stay visible; no hamburger menu, since that would need JavaScript.

## About Me section

```html
<section id="about" aria-labelledby="about-heading">
  <p class="eyebrow">Resume</p>
  <h1 id="about-heading" class="heading heading--display">{profile.name}</h1>
  <div class="copy copy--large">{description paragraphs}</div>
  <ul class="contact-list">
    <li class="contact-list__item contact-list__item--location">
      <img class="contact-list__icon" src="icons/location.png" alt="" width="24" height="24">
      <span>{location}</span>
    </li>
    <li class="contact-list__item contact-list__item--email">
      <img class="contact-list__icon" src="icons/e-mail.png" alt="" width="24" height="24">
      <a href="mailto:{email}">{email}</a>
    </li>
    <li class="contact-list__item contact-list__item--phone">
      <img class="contact-list__icon" src="icons/phone.png" alt="" width="24" height="24">
      <a href="tel:{normalized}">{phone}</a>
    </li>
    <li class="contact-list__item contact-list__item--x">
      <img class="contact-list__icon" src="icons/x.png" alt="" width="24" height="24">
      <a href="{x.url}" target="_blank" rel="noopener noreferrer">
        {x.handle}<span class="external-mark" aria-hidden="true">↗</span>
        <span class="visually-hidden">(opens in a new tab)</span>
      </a>
    </li>
  </ul>
</section>
```

- Contact details appear in the fixed order location, e-mail, phone, X.
- A blank or missing detail is omitted entirely (no empty `<li>`).
- Icons are decorative (`alt=""`) because the text beside them names the detail.
- Icon images are inverted with CSS (`filter: invert(0.9)`) so they read on the dark
  background; the PNG files are never modified.
- The X link is the only link on the page allowed to leave the page. It must carry
  `target="_blank"`, `rel="noopener noreferrer"`, the visible external mark, and the
  visually hidden new-tab text.

## Experience sections

Both experience sections use the same entry markup.

```html
<section id="professional-experience" aria-labelledby="professional-experience-heading">
  <div class="section__header">
    <h2 id="professional-experience-heading" class="heading heading--2">Professional Experience</h2>
  </div>
  <ol class="entry-list">
    <li class="entry">
      <h3 class="entry__title heading heading--4">{title}</h3>
      <p class="entry__dates eyebrow">
        <time datetime="{startDate}">{Mar 2023}</time> – <time datetime="{endDate}">{Present or Jun 2024}</time>
      </p>
      <div class="entry__description copy">{description paragraphs}</div>
    </li>
  </ol>
</section>
```

- Entries are in an ordered list sorted newest `startDate` first.
- The en dash between dates is the literal character `–`.
- An ongoing entry renders `<time>` for the start and plain text `Present` for the
  end (no `datetime` for Present).
- An empty list renders `<p class="copy copy--muted entry-list--empty">No entries yet.</p>`
  in place of the `<ol>`.

## Certifications section

```html
<ul class="entry-list entry-list--compact">
  <li class="entry entry--compact">
    <h3 class="entry__title heading heading--5">{title}</h3>
    <p class="entry__dates eyebrow"><time datetime="{date}">{Nov 2024}</time></p>
  </li>
</ul>
```

Certifications are in file order. Empty list renders the same "No entries yet."
paragraph.

## Tools section

Added by the 2026-09-10 amendment. Sits between Certifications and Languages.

```html
<section id="tools" class="section content-gutter" aria-labelledby="tools-heading">
  <div class="section__inner">
    <div class="section__header">
      <h2 id="tools-heading" class="heading heading--2">Tools</h2>
    </div>
    <ul class="tool-list">
      <li class="tool tag">{name}</li>
    </ul>
  </div>
</section>
```

- Tools are in file order.
- `tool-list` is a wrapping flex row with the design system's tag styling
  (section 7.3); each name is one tag.
- Empty list renders the same "No entries yet." paragraph as the other lists.

## Languages section

```html
<ul class="language-list">
  <li class="language">
    <span class="language__name heading heading--5">{name}</span>
    <span class="language__level tag">{level}</span>
  </li>
</ul>
```

Languages are in file order. Empty list renders "No entries yet."

## Footer

```html
<footer class="site-footer">
  <p class="copy copy--small copy--muted">© {current year} {profile.name}</p>
  <a class="button button--text" href="#top">Back to top</a>
</footer>
```

## Styling contract

- All colors, spacing, radii, easing, and durations come from the `:root` token sheet
  in design-system.md section 9, copied verbatim into `src/styles.css`.
- Body background `--color-bg`; alternate sections may use `--color-bg-deep` for rhythm.
- The only accent color is `--color-accent` (#D1363A), used for link hover underline,
  the "Back to top" text button, and the current-role date marker.
- Certifications may use `--color-gold` (#A38E40) for their date eyebrow, as the
  design system reserves gold for certifications.
- Headings use `--font-display`; body uses `--font-body`; global
  `letter-spacing: -0.03em`.
- Focus ring on every link: `box-shadow: 0 0 0 2px var(--color-gold)`.
- Paragraph max width 467px per the design system.
- No element may declare a `min-width` or fixed `width` larger than 360px.

## Print contract

Inside `@media print`:

- Header nav and footer "Back to top" are hidden.
- Background becomes white, text `#2B2A29`, icons not inverted.
- The X link prints its URL after the handle via `a[href^="https"]::after { content: " (" attr(href) ")"; }`.
- Sections avoid page breaks inside an entry (`break-inside: avoid`).

## Verification hooks

`tests/output.test.js` reads `dist/index.html` and asserts:

1. Only one `.html` file exists in `dist/`.
2. `<html lang="en-US">` and no `<script>` or `<form>` elements.
3. The six section ids exist in the fixed order.
4. Every nav `href` beginning with `#` matches an existing `id`.
5. Every `<a href>` that does not begin with `#`, `mailto:`, or `tel:` has
   `target="_blank"` and `rel="noopener noreferrer"`.
6. Each rendered contact detail has an `<img src="icons/…">` with the icon named in
   the data model.
