# Feature Specification: One-Page Resume Website

**Feature Branch**: `001-one-page-resume`

**Created**: 2026-09-10

**Status**: Draft (amended 2026-09-10: Tools section added after Certifications at the owner's request)

**Input**: User description: "The resume page should be only one-page. The entire design needs to follow the design-system.md file and the icons inside the icons folder if needed. The first section of the page needs to be an About Me with my name, a description and details about me (location, e-mail, phone, and the X social media); the desired icon for each is in the icons folder. The social media needs to be linked to my personal profile on X. The next section needs to be the professional experience, followed by the academic experience. I need the option to easily add/edit/remove any experience from both sections. The formatting needs to have a title, followed by a description and beginning and end date. The next section needs to be certifications, where I can list the title of the certification and the date I obtained it. Then the next one needs to be languages, where I can list both the languages and my current level at them."

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Visitor reads the complete resume on one page (Priority: P1)

A recruiter, hiring manager, or professional contact opens the website URL and reads
Guilherme's full resume by scrolling a single page. The page opens on the About Me
section, which shows his name, a short description, and his contact details (location,
e-mail, phone, and X profile), each preceded by its matching icon. Scrolling down, the
visitor reads, in this order: Professional Experience, Academic Experience,
Certifications, Tools, and Languages. The visitor can click the X icon or handle to open
Guilherme's X profile.

**Why this priority**: This is the product. Without a readable, correctly ordered
single page there is nothing to share with anyone.

**Independent Test**: Open the page in a browser with sample content loaded. Confirm
all six sections render in the required order on one page, the About Me section shows
all four contact details with their icons, and the X link opens the correct profile.

**Acceptance Scenarios**:

1. **Given** the website is published, **When** a visitor opens it, **Then** the first
   content visible is the About Me section containing the name, description, and the
   four contact details (location, e-mail, phone, X).
2. **Given** the About Me section is visible, **When** the visitor looks at each
   contact detail, **Then** each is paired with its icon from the icons folder
   (location.png, e-mail.png, phone.png, x.png).
3. **Given** the About Me section is visible, **When** the visitor activates the X
   contact detail, **Then** Guilherme's personal X profile opens in a new browser tab.
4. **Given** the page is loaded, **When** the visitor scrolls from top to bottom,
   **Then** the sections appear in exactly this order: About Me, Professional
   Experience, Academic Experience, Certifications, Tools, Languages, with no other page or
   route required to see any of them.
5. **Given** the page is loaded, **When** the visitor reads any experience entry,
   **Then** it shows a title, a description, and a beginning and end date.
6. **Given** the page is loaded, **When** the visitor views the page at a phone width
   (360px) and at a desktop width, **Then** all content remains readable with no
   horizontal scrolling of the page body.

---

### User Story 2 - Owner adds, edits, or removes an experience entry (Priority: P2)

Guilherme, the sole content owner, wants to add a new job, update the description of
an existing degree, or remove an outdated entry. He edits a single plain-text content
source, saves, and the page reflects the change without any modification to layout or
styling files.

**Why this priority**: The resume will change over time. If updating it requires
touching layout code, the site becomes stale or error-prone. This is the second most
important capability after the page itself.

**Independent Test**: Starting from sample content, add one professional entry, edit
one academic entry's description, and delete one entry of each type by editing only
the content source. Reload the page and confirm the changes appear and the section
layout is unchanged.

**Acceptance Scenarios**:

1. **Given** the content source contains N professional experience entries, **When**
   the owner appends a new entry with a title, description, start date, and end date,
   **Then** the page shows N+1 entries in the Professional Experience section with the
   new entry positioned according to its dates.
2. **Given** an existing academic experience entry, **When** the owner changes its
   description text in the content source, **Then** the page shows the updated
   description and no other entry changes.
3. **Given** an existing entry of either type, **When** the owner removes it from the
   content source, **Then** the page no longer shows that entry and the remaining
   entries keep their order and formatting.
4. **Given** an entry with no end date (current role or ongoing studies), **When** the
   page renders it, **Then** the end date reads "Present".
5. **Given** the owner edits only the content source, **When** the page is reloaded,
   **Then** no layout, styling, or icon file needed to change for the edit to appear.

---

### User Story 3 - Owner maintains certifications, tools, and languages (Priority: P2)

Guilherme adds a newly earned certification with its title and the date obtained, or
updates his proficiency level in a language, or adds a tool he has experience with.
All three lists are edited in the same
plain-text content source used for experiences.

**Why this priority**: Certifications, tools, and languages change less often than
experience but follow the same maintenance need. They are grouped separately because
their entry shapes differ (no description, no date range).

**Independent Test**: Add a certification and a language to the content source, change
one existing language level, and remove one certification. Reload and confirm the
Certifications and Languages sections reflect exactly those changes. Also add one
tool and confirm it appears in the Tools section between Certifications and Languages.

**Acceptance Scenarios**:

1. **Given** the Certifications section, **When** the owner adds an entry with a title
   and an obtained date, **Then** the page lists that certification showing both
   values.
2. **Given** the Languages section, **When** the owner adds a language with a level,
   **Then** the page lists the language name alongside its level.
3. **Given** an existing language entry, **When** the owner changes its level, **Then**
   the page shows the new level for that language only.
4. **Given** the Certifications, Tools, or Languages list is empty in the content source,
   **When** the page renders, **Then** the section still appears with its heading and a
   short "No entries yet" style message rather than breaking the layout.
5. **Given** the Tools section, **When** the owner adds a tool name to the content
   source, **Then** the page lists that tool in the Tools section, which sits after
   Certifications and before Languages.

---

### User Story 4 - Visitor jumps to a section with in-page navigation (Priority: P3)

A visitor who wants to see certifications immediately uses the page's navigation links
to jump straight to that section. The page scrolls to the section rather than loading
a new page, and the section heading is fully visible below any fixed header.

**Why this priority**: Improves usability for a long single page but the resume is
fully usable by scrolling alone. Required by the project constitution for any internal
link, so it must ship, but it can be built after the content is in place.

**Independent Test**: Activate each navigation link with a mouse and with the keyboard.
Confirm the viewport moves to the matching section on the same page and the section
heading is not hidden behind the header.

**Acceptance Scenarios**:

1. **Given** the page is loaded, **When** the visitor activates a navigation link for
   any section, **Then** the page scrolls to that section without leaving the page and
   the browser address updates with the section's fragment identifier.
2. **Given** the visitor has not requested reduced motion, **When** a navigation link
   is activated, **Then** the scroll is animated smoothly.
3. **Given** the visitor's system requests reduced motion, **When** a navigation link
   is activated, **Then** the page jumps instantly to the section with no animation.
4. **Given** a fixed or sticky header is present, **When** the page arrives at a
   section, **Then** the section heading is fully visible and not covered by the
   header.
5. **Given** the visitor uses only a keyboard, **When** tabbing through navigation
   links, **Then** each link shows a visible focus indicator and can be activated with
   Enter.

---

### Edge Cases

- An experience entry has an end date but no start date, or a start date after its
  end date: the entry is still rendered, and the owner sees a warning in the content
  validation output (see FR-018).
- A contact detail (for example, phone) is intentionally left blank: that detail and
  its icon are omitted from About Me and the remaining details close the gap.
- A description is very long (over 1,000 characters): the layout keeps the paragraph
  within the design system's maximum text width and wraps without overflow.
- An icon file is missing or renamed: the contact detail still renders as text and
  the build or validation step reports the missing icon.
- Many entries (for example, 20 professional experiences): the page grows vertically
  and remains one page; no pagination, tabs, or "show more" that hides content.
- The visitor has JavaScript disabled: all content and in-page anchor navigation
  still work; only smooth scrolling and entrance animations may be absent.
- The visitor prints the page: the resume prints as a clean document with navigation
  hidden, following the constitution's print constraint.

## Requirements *(mandatory)*

### Functional Requirements

**Page structure**

- **FR-001**: The website MUST consist of exactly one page containing all resume
  content; no internal link may lead to another page.
- **FR-002**: The page MUST present sections in this fixed order: About Me,
  Professional Experience, Academic Experience, Certifications, Tools, Languages.
- **FR-003**: Each section MUST have a visible heading and a unique, stable,
  human-readable identifier so it can be linked to directly.
- **FR-004**: All visible text, labels, and metadata MUST be in English (United
  States).

**About Me section**

- **FR-005**: The About Me section MUST display the owner's full name as the page's
  primary heading.
- **FR-006**: The About Me section MUST display a description paragraph about the
  owner.
- **FR-007**: The About Me section MUST display four contact details: location,
  e-mail address, phone number, and X profile.
- **FR-008**: Each contact detail MUST be displayed with its corresponding icon from
  the project's icons folder: location.png for location, e-mail.png for e-mail,
  phone.png for phone, and x.png for X.
- **FR-009**: The X contact detail MUST link to the owner's personal X profile, open
  in a new tab, and be identifiable as an external link.
- **FR-010**: The e-mail contact detail MUST open the visitor's default mail
  application with the address pre-filled, and the phone contact detail MUST be
  dialable from devices that support it.

**Experience sections**

- **FR-011**: The Professional Experience and Academic Experience sections MUST each
  display a list of entries, where every entry shows a title, a description, a
  beginning date, and an end date.
- **FR-012**: Entries within each experience section MUST be ordered from most recent
  to oldest by start date.
- **FR-013**: An entry with no end date MUST display "Present" as its end date.
- **FR-014**: Dates MUST be displayed at month-and-year granularity (for example,
  "Mar 2023") in English-US format.

**Certifications, Tools, and Languages sections**

- **FR-015**: The Certifications section MUST display a list of entries, each showing
  the certification title and the date it was obtained.
- **FR-016**: The Languages section MUST display a list of entries, each showing the
  language name and the owner's current proficiency level.
- **FR-028**: The Tools section MUST display a list of entries, each showing the name
  of a tool the owner has experience with, in the order written in the content
  source. The section MUST appear after Certifications and before Languages.

**Content management**

- **FR-017**: All resume content (About Me fields, experience entries, certifications,
  tools, languages) MUST be maintained in a single plain-text content source that the owner
  can edit without changing layout, styling, or icon files.
- **FR-018**: Adding, editing, or removing any entry MUST require only a change to the
  content source; the page MUST reflect the change on the next load or build.
- **FR-019**: The content source MUST be validated before publishing, reporting
  missing required fields, unknown icons, and invalid date values, without blocking
  the page from rendering during local editing.
- **FR-020**: The website MUST NOT provide any visitor-facing way to create, edit, or
  submit content.

**Design and navigation**

- **FR-021**: The visual design MUST follow the project's design-system.md document,
  including its dark background, single red accent, heavy display typography,
  spacing scale, and motion rules.
- **FR-022**: The page MUST provide in-page navigation links to each section that
  scroll the viewport to the target section on the same page.
- **FR-023**: Section scrolling MUST be smooth unless the visitor's system requests
  reduced motion, in which case navigation MUST jump instantly.
- **FR-024**: When navigating to a section, the section heading MUST NOT be hidden
  behind any fixed or sticky header.
- **FR-025**: The page MUST be fully usable with keyboard only, with visible focus
  indicators on all links, and MUST meet WCAG 2.1 AA color contrast.
- **FR-026**: The page MUST render correctly from 360px viewport width through desktop
  widths without horizontal scrolling of the page body.
- **FR-027**: The page MUST provide a print presentation that hides navigation and
  shows all sections as a clean document.

### Key Entities

- **Profile**: The owner's About Me data. Attributes: full name, description,
  location, e-mail address, phone number, X profile URL, X display handle.
- **Experience Entry**: One professional or academic item. Attributes: type
  (professional or academic), title, description, start date, optional end date. An
  entry belongs to exactly one of the two experience sections.
- **Certification**: One earned credential. Attributes: title, date obtained.
- **Language**: One spoken or written language. Attributes: language name,
  proficiency level (free text such as "Native", "Fluent", "Intermediate", or a CEFR
  grade such as "C1").
- **Tool**: One software tool, platform, or technology the owner has experience with.
  Attributes: tool name. Listed in file order.
- **Contact Detail**: A labeled value in About Me paired with an icon. Attributes:
  kind (location, e-mail, phone, X), display value, optional link target, icon file.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: A first-time visitor can find any of the six sections within 10 seconds
  of opening the page, using either scrolling or navigation links.
- **SC-002**: 100% of internal links resolve to a section on the same page; zero
  internal links lead to another page.
- **SC-003**: The owner can add a new experience entry and see it on the page in under
  2 minutes, editing only the content source.
- **SC-004**: The page becomes readable (name and description visible) within 2
  seconds on a typical mobile connection.
- **SC-005**: The page passes an automated accessibility check with zero critical
  issues and meets WCAG 2.1 AA contrast on all text.
- **SC-006**: The page shows no horizontal overflow at 360px, 768px, 1024px, and
  1440px viewport widths.
- **SC-007**: 100% of visible text passes an English-US spell check.
- **SC-008**: Every contact detail in About Me displays its matching icon; a visual
  review finds zero mismatched or missing icons.

## Assumptions

- The user's feature description ended with a truncated repeated sentence ("The first
  section needs to be an about me section, where I can"). It is treated as a
  duplicate of the About Me requirement already captured and adds no new scope.
- The design reference is the file `design-system.md` at the project root (the
  description called it "design.system.md"). It is written in Portuguese; it is an
  input reference only and does not affect the English-US requirement for visible
  content. Translating it is optional follow-up work, not part of this feature.
- Actual content values (name, description, location, e-mail, phone, X profile URL,
  and all entries) will be supplied by the owner in the content source. This
  specification does not define them; placeholder sample content is acceptable
  during development.
- "Easily add/edit/remove" is satisfied by editing a single plain-text content file,
  consistent with the constitution's single-owner and static-delivery principles. No
  admin interface, login, or in-browser editor is in scope.
- Experience entries are listed most recent first. Ties on start date keep the order
  written in the content source.
- Dates are shown at month-and-year granularity. Day precision is not required for a
  resume.
- Language proficiency level is free text chosen by the owner, so both descriptive
  levels and CEFR grades are supported without a fixed scale.
- Section headings use the names "About Me", "Professional Experience", "Academic
  Experience", "Certifications", "Tools", and "Languages".
- Tools are listed by name only. Grouping tools by category or rating proficiency was
  not requested and is out of scope; the entry shape allows adding such fields later.
- The four icons in the icons folder are the final assets for the four contact
  details. No additional icons are required for this feature.
- A "Download CV" button, project showcase cards, skills tags, statistics block, and
  light-theme toggle described in the design system's resume mapping are out of scope
  for this feature and may be proposed as separate features later.
- No analytics, contact form, or third-party embed is included.
