/**
 * Post-build script:
 *   1. Copies .css files from src/ → dist/ (tsc ignores non-TS assets).
 *   2. Adds .js extensions to relative TS imports in dist/*.js files.
 *      Required because tsc with "module":"ESNext"+"moduleResolution":"bundler"
 *      omits extensions, but ESM consumers (Vite/Rollup) need them for proper
 *      resolution from node_modules. Skips imports ending in a known asset
 *      extension (.css, .svg, .png, .json).
 */
import { readFileSync, writeFileSync, readdirSync, copyFileSync, mkdirSync } from 'fs';
import { join, dirname, relative } from 'path';

const SRC = 'src';
const DIST = 'dist';
const IMPORT_RE = /(from\s+['"])(\.\.?\/[^'"]+?)(?<!\.[a-z]+)(['"])/g;
const EXPORT_RE = /(export\s+.*?from\s+['"])(\.\.?\/[^'"]+?)(?<!\.[a-z]+)(['"])/g;

function walk(dir, filter) {
  const files = [];
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const full = join(dir, entry.name);
    if (entry.isDirectory()) files.push(...walk(full, filter));
    else if (filter(entry.name)) files.push(full);
  }
  return files;
}

// 1. Copy CSS files from src/ to dist/ (mirrors folder structure)
let cssCopied = 0;
for (const cssFile of walk(SRC, name => name.endsWith('.css'))) {
  const target = join(DIST, relative(SRC, cssFile));
  mkdirSync(dirname(target), { recursive: true });
  copyFileSync(cssFile, target);
  cssCopied++;
}
console.log(`copy-css: ${cssCopied} files copied`);

// 2. Fix ESM imports in dist/*.js
let fixed = 0;
for (const file of walk(DIST, name => name.endsWith('.js'))) {
  let content = readFileSync(file, 'utf8');
  const original = content;
  content = content.replace(IMPORT_RE, '$1$2.js$3');
  content = content.replace(EXPORT_RE, '$1$2.js$3');
  if (content !== original) {
    writeFileSync(file, content);
    fixed++;
  }
}
console.log(`fix-esm-imports: ${fixed} files updated`);
