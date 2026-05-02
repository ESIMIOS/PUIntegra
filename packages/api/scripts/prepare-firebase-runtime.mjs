import { cpSync, existsSync, mkdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const scriptDir = dirname(fileURLToPath(import.meta.url));
const apiDir = resolve(scriptDir, '..');
const repoRoot = resolve(apiDir, '..', '..');
const sharedDir = resolve(repoRoot, 'packages', 'shared');
const runtimeDir = resolve(apiDir, '.firebase-runtime');
const vendorSharedDir = resolve(runtimeDir, 'vendor', 'shared');

function assertExists(path, label) {
  if (!existsSync(path)) {
    throw new Error(`${label} not found at ${path}`);
  }
}

function copyDirectory(source, destination) {
  cpSync(source, destination, { recursive: true });
}

function sanitizePackageJson(packageJsonPath) {
  const packageJson = JSON.parse(readFileSync(packageJsonPath, 'utf8'));

  packageJson.dependencies = {
    ...packageJson.dependencies,
    '@puintegra/shared': 'file:vendor/shared',
  };

  delete packageJson.devDependencies;

  return packageJson;
}

assertExists(join(apiDir, 'dist'), 'API dist');
assertExists(join(sharedDir, 'dist'), 'Shared dist');
assertExists(join(sharedDir, 'package.json'), 'Shared package.json');

rmSync(runtimeDir, { recursive: true, force: true });
mkdirSync(runtimeDir, { recursive: true });
mkdirSync(vendorSharedDir, { recursive: true });

copyDirectory(join(apiDir, 'dist'), join(runtimeDir, 'dist'));
copyDirectory(join(sharedDir, 'dist'), join(vendorSharedDir, 'dist'));

writeFileSync(
  join(runtimeDir, 'package.json'),
  `${JSON.stringify(sanitizePackageJson(join(apiDir, 'package.json')), null, 2)}\n`,
);

writeFileSync(
  join(vendorSharedDir, 'package.json'),
  `${JSON.stringify(JSON.parse(readFileSync(join(sharedDir, 'package.json'), 'utf8')), null, 2)}\n`,
);
