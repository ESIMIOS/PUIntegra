/**
 * @package api
 * @name loadRootEnv.ts
 * @version 0.0.1
 * @description Carga variables de entorno root para scripts locales del API.
 * @author @codex
 * @changelog
 * - 0.0.1	(2026-04-18)	Agrega carga root de dotenv para scripts de emulador.	@codex
 */

import { existsSync, readFileSync } from 'node:fs';
import { resolve } from 'node:path';

const REPOSITORY_ROOT = resolve(process.cwd(), '../..');

/**
 * @description Normaliza valores dotenv simples quitando comillas envolventes.
 */
function normalizeEnvValue(value: string) {
  const trimmed = value.trim();
  if (
    (trimmed.startsWith('"') && trimmed.endsWith('"')) ||
    (trimmed.startsWith("'") && trimmed.endsWith("'"))
  ) {
    return trimmed.slice(1, -1);
  }
  return trimmed;
}

/**
 * @description Carga un archivo dotenv simple desde la raíz del repositorio.
 */
function loadRootEnvFile(fileName: string, options: { override?: boolean } = {}) {
  const filePath = resolve(REPOSITORY_ROOT, fileName);
  if (!existsSync(filePath)) {
    return;
  }

  const lines = readFileSync(filePath, 'utf8').split(/\r?\n/);
  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) {
      continue;
    }

    const separatorIndex = trimmed.indexOf('=');
    if (separatorIndex <= 0) {
      continue;
    }

    const key = trimmed.slice(0, separatorIndex).trim();
    if (!options.override && process.env[key] !== undefined) {
      continue;
    }
    process.env[key] = normalizeEnvValue(trimmed.slice(separatorIndex + 1));
  }
}

/**
 * @description Carga variables root con precedencia local sobre defaults de desarrollo.
 */
function loadRootEnv() {
  loadRootEnvFile('.env.development');
  loadRootEnvFile('.env.local', { override: true });
}

loadRootEnv();
