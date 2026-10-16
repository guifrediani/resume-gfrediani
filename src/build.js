#!/usr/bin/env node
// Build entry point. Usage: node src/build.js [--strict] [--out <dir>] [--content <file>]
// Contract: specs/001-one-page-resume/contracts/build-cli.md

import { readFileSync, writeFileSync, mkdirSync, rmSync, copyFileSync, readdirSync, existsSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { createHash } from "node:crypto";
import { fileURLToPath } from "node:url";
import { validate, formatMessage } from "./validate.js";
import { renderPage } from "./render.js";
import { parseResume, describePath } from "./markdown.js";

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const TEMPLATE = join(ROOT, "src", "template.html");
const STYLES = join(ROOT, "src", "styles.css");
const SCRIPT = join(ROOT, "src", "enhance.js");
const ICONS = join(ROOT, "icons");

function usage(message) {
  process.stderr.write(`ERROR (usage): ${message}\n`);
  process.stderr.write("Usage: node src/build.js [--strict] [--out <dir>] [--content <file>]\n");
  process.exit(2);
}

function parseArgs(argv) {
  const options = { strict: false, out: join(ROOT, "dist"), content: join(ROOT, "content", "resume.md") };
  for (let i = 0; i < argv.length; i += 1) {
    const arg = argv[i];
    if (arg === "--strict") {
      options.strict = true;
    } else if (arg === "--out" || arg === "--content") {
      const value = argv[i + 1];
      if (value === undefined || value.startsWith("--")) usage(`${arg} requires a value.`);
      options[arg.slice(2)] = resolve(value);
      i += 1;
    } else {
      usage(`unknown flag ${JSON.stringify(arg)}.`);
    }
  }
  return options;
}

function main() {
  const options = parseArgs(process.argv.slice(2));

  let rawText;
  try {
    rawText = readFileSync(options.content, "utf8");
  } catch (err) {
    usage(`cannot read content file ${options.content}: ${err.message}`);
  }

  let template;
  try {
    template = readFileSync(TEMPLATE, "utf8");
  } catch (err) {
    usage(`cannot read template ${TEMPLATE}: ${err.message}`);
  }

  // Markdown is the authoring format; a .json file is still accepted as-is.
  let content, errors, warnings;
  if (options.content.toLowerCase().endsWith(".md")) {
    const parsed = parseResume(rawText);
    if (parsed.errors.length > 0) {
      ({ content, errors, warnings } = parsed);
    } else {
      const checked = validate(JSON.stringify(parsed.content), { iconsDir: ICONS });
      const locate = (message) => ({ ...message, path: describePath(message.path, parsed.content) });
      content = checked.content;
      errors = checked.errors.map(locate);
      warnings = [...parsed.warnings, ...checked.warnings.map(locate)];
    }
  } else {
    ({ content, errors, warnings } = validate(rawText, { iconsDir: ICONS }));
  }
  const failing = options.strict ? [...errors, ...warnings] : errors;

  for (const message of [...errors, ...warnings]) {
    process.stderr.write(`${formatMessage(message)}\n`);
  }

  if (failing.length > 0) {
    process.stderr.write(
      options.strict && errors.length === 0
        ? `Build failed: ${warnings.length} warning(s) treated as errors under --strict.\n`
        : `Build failed: ${errors.length} error(s).\n`,
    );
    process.exit(1);
  }

  // Version the asset URLs by content so browsers never pair a new page with a cached old
  // stylesheet or script (GitHub Pages lets browsers cache them for 10 minutes).
  const version = (file) => createHash("sha256").update(readFileSync(file)).digest("hex").slice(0, 10);
  const html = renderPage(content, template)
    .replace('href="styles.css"', `href="styles.css?v=${version(STYLES)}"`)
    .replace('src="enhance.js"', `src="enhance.js?v=${version(SCRIPT)}"`);

  rmSync(options.out, { recursive: true, force: true });
  mkdirSync(join(options.out, "icons"), { recursive: true });
  writeFileSync(join(options.out, "index.html"), html, "utf8");
  copyFileSync(STYLES, join(options.out, "styles.css"));
  copyFileSync(SCRIPT, join(options.out, "enhance.js"));
  if (existsSync(ICONS)) {
    for (const file of readdirSync(ICONS)) {
      if (file.toLowerCase().endsWith(".png")) {
        copyFileSync(join(ICONS, file), join(options.out, "icons", file));
      }
    }
  }

  process.stdout.write(`Built ${join(options.out, "index.html")} (${errors.length} errors, ${warnings.length} warnings)\n`);
}

main();
