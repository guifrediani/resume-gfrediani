#!/usr/bin/env node
// Bundles dist/ into one self-contained HTML file (CSS and script inlined, icons as data URIs).
// Usage: node src/bundle.js   (run after src/build.js; `npm run bundle` does both)

import { readFileSync, writeFileSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const DIST = join(ROOT, "dist");
const OUT = join(ROOT, "guilherme-frediani.html");

const css = readFileSync(join(DIST, "styles.css"), "utf8");
const script = readFileSync(join(DIST, "enhance.js"), "utf8");
const html = readFileSync(join(DIST, "index.html"), "utf8")
  .replace('<link rel="stylesheet" href="styles.css">', () => `<style>\n${css}\n</style>`)
  // defer has no effect on inline scripts, so the inlined copy moves to the end of <body>.
  .replace(/\s*<script src="enhance\.js" defer><\/script>/, "")
  .replace("</body>", () => `<script>\n${script}\n</script>\n</body>`)
  .replace(/src="icons\/([^"]+\.png)"/g, (_, file) =>
    `src="data:image/png;base64,${readFileSync(join(DIST, "icons", file)).toString("base64")}"`);

writeFileSync(OUT, html, "utf8");
process.stdout.write(`Bundled ${OUT}\n`);
