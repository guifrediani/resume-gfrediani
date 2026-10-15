#!/usr/bin/env node
// Build entry point. Usage: node src/build.js [--strict] [--out <dir>] [--content <file>]
// Contract: specs/001-one-page-resume/contracts/build-cli.md

import { readFileSync, writeFileSync, mkdirSync, rmSync, copyFileSync, readdirSync, existsSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { validate, formatMessage } from "./validate.js";
import { renderPage } from "./render.js";

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
  const options = { strict: false, out: join(ROOT, "dist"), content: join(ROOT, "content", "resume.json") };
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

  const { content, errors, warnings } = validate(rawText, { iconsDir: ICONS });
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

  const html = renderPage(content, template);

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
