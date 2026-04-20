/**
 * @package shared
 * @name fix-esm-extensions.mjs
 * @version 0.0.1
 * @description Adds .js extensions to relative ESM specifiers emitted by TypeScript.
 * @author @codex
 * @changelog
 * - 0.0.1	(2026-04-19)	Fixes Node ESM runtime resolution for shared dist files.	@codex
 */

import { readdir, readFile, stat, writeFile } from 'node:fs/promises';
import { extname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const distDir = fileURLToPath(new URL('../dist/', import.meta.url));
const RELATIVE_SPECIFIER_PATTERN = /(from\s+['"])(\.\.?\/[^'"]+?)(['"])/g;

/**
 * @description Checks whether an import/export specifier already has a file extension.
 */
function hasExtension(specifier) {
  return ['.cjs', '.js', '.json', '.mjs', '.node'].includes(extname(specifier.split('?')[0]));
}

/**
 * @description Appends .js to relative ESM specifiers without an extension.
 */
function addJsExtensions(source) {
  return source.replaceAll(RELATIVE_SPECIFIER_PATTERN, (match, prefix, specifier, suffix) => {
    if (hasExtension(specifier)) {
      return match;
    }
    return `${prefix}${specifier}.js${suffix}`;
  });
}

/**
 * @description Recursively lists emitted JavaScript files.
 */
async function listJavaScriptFiles(directory) {
  const entries = await readdir(directory);
  const files = await Promise.all(entries.map(async (entry) => {
    const path = join(directory, entry);
    const metadata = await stat(path);
    return metadata.isDirectory() ? listJavaScriptFiles(path) : [path];
  }));

  return files.flat().filter((path) => path.endsWith('.js'));
}

const files = await listJavaScriptFiles(distDir);

await Promise.all(files.map(async (file) => {
  const source = await readFile(file, 'utf8');
  const updated = addJsExtensions(source);
  if (updated !== source) {
    await writeFile(file, updated);
  }
}));
