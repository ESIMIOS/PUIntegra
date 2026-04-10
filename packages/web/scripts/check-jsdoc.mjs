import fs from 'node:fs';
import path from 'node:path';

const SOURCE_ROOT = path.resolve('src');
const TARGET_EXTENSIONS = new Set(['.ts']);
const IGNORED_FILES = new Set(['vite-env.d.ts']);

function collectFiles(dirPath) {
  const entries = fs.readdirSync(dirPath, { withFileTypes: true });
  const files = [];

  for (const entry of entries) {
    const absolutePath = path.join(dirPath, entry.name);
    if (entry.isDirectory()) {
      files.push(...collectFiles(absolutePath));
      continue;
    }

    const extension = path.extname(entry.name);
    if (!TARGET_EXTENSIONS.has(extension)) {
      continue;
    }

    if (entry.name.endsWith('.d.ts') || IGNORED_FILES.has(entry.name)) {
      continue;
    }

    files.push(absolutePath);
  }

  return files;
}

function hasJSDocAbove(lines, functionLineIndex) {
  let index = functionLineIndex - 1;

  while (index >= 0 && lines[index].trim() === '') {
    index -= 1;
  }

  if (index < 0 || lines[index].trim() !== '*/') {
    return false;
  }

  let foundOpening = false;
  while (index >= 0) {
    const trimmed = lines[index].trim();
    if (trimmed.startsWith('/**')) {
      foundOpening = true;
      break;
    }

    if (!trimmed.startsWith('*') && trimmed !== '*/') {
      return false;
    }
    index -= 1;
  }

  return foundOpening;
}

function scanFile(filePath) {
  const relativePath = path.relative(process.cwd(), filePath);
  const content = fs.readFileSync(filePath, 'utf8');
  const lines = content.split('\n');
  const issues = [];

  for (let lineIndex = 0; lineIndex < lines.length; lineIndex += 1) {
    const line = lines[lineIndex];
    const isFunctionDeclaration = /^\s*(export\s+)?function\s+[a-zA-Z0-9_]+\s*\(/.test(line);
    if (!isFunctionDeclaration) {
      continue;
    }

    if (!hasJSDocAbove(lines, lineIndex)) {
      issues.push(`${relativePath}:${lineIndex + 1}`);
    }
  }

  return issues;
}

const files = collectFiles(SOURCE_ROOT);
const violations = files.flatMap((filePath) => scanFile(filePath));

if (violations.length > 0) {
  console.error('Missing JSDoc block above function declaration:');
  for (const violation of violations) {
    console.error(`- ${violation}`);
  }
  process.exit(1);
}

console.warn('JSDoc check passed.');
