import { readdirSync } from 'fs';
import { join, relative, posix } from 'path';

const SOURCE_EXT_RE = /\.(tsx?|jsx?)$/;
const EMPTY_MODULE = () => Promise.resolve({});

/**
 * Recursively scan a directory and return file paths in glob-like format.
 * Output keys match Vite's import.meta.glob format: "./modules/admin/pages/index.tsx"
 */
export function scanDirectory(
  baseDir: string,
  pattern: string,
): Record<string, unknown> {
  const result: Record<string, unknown> = {};
  const fullDir = join(baseDir, pattern.split('*')[0].replace('./', ''));
  walkDir(fullDir, baseDir, result);
  return result;
}

function walkDir(
  dir: string,
  baseDir: string,
  result: Record<string, unknown>,
): void {
  let entries;
  try {
    entries = readdirSync(dir, { withFileTypes: true });
  } catch {
    return; // Directory doesn't exist
  }

  for (const entry of entries) {
    if (entry.isDirectory()) {
      if (entry.name === 'node_modules' || entry.name === '.git') continue;
      walkDir(join(dir, entry.name), baseDir, result);
    } else if (entry.isFile() && SOURCE_EXT_RE.test(entry.name)) {
      // Convert to posix-style relative path with ./ prefix
      const rel = relative(baseDir, join(dir, entry.name)).split('\\').join('/');
      result[`./${rel}`] = EMPTY_MODULE;
    }
  }
}

/**
 * Scan a subdirectory inside each module, e.g. `pages` or `api`.
 * Silently no-ops when the modules directory or per-module subdir doesn't exist.
 */
function scanPerModule(
  appDir: string,
  subdir: 'pages' | 'api',
  result: Record<string, unknown>,
): void {
  const modulesDir = join(appDir, 'modules');
  let modules;
  try {
    modules = readdirSync(modulesDir, { withFileTypes: true });
  } catch {
    return; // No modules directory
  }

  for (const mod of modules) {
    if (!mod.isDirectory()) continue;
    walkDir(join(modulesDir, mod.name, subdir), appDir, result);
  }
}

/**
 * Scan module pages: ./modules/** /pages/** /*.{tsx,ts}
 * Also picks up root-level module files like __root.tsx, __homepage.tsx.
 */
export function scanModulePages(appDir: string): Record<string, unknown> {
  const result: Record<string, unknown> = {};
  const modulesDir = join(appDir, 'modules');

  // Single readdirSync of modulesDir handles both per-module pages/ traversal
  // AND root-level module files (__root.tsx etc.).
  let entries;
  try {
    entries = readdirSync(modulesDir, { withFileTypes: true });
  } catch {
    return result; // No modules directory
  }

  for (const entry of entries) {
    if (entry.isDirectory()) {
      walkDir(join(modulesDir, entry.name, 'pages'), appDir, result);
    } else if (entry.isFile() && SOURCE_EXT_RE.test(entry.name)) {
      const rel = posix.join('modules', entry.name);
      result[`./${rel}`] = EMPTY_MODULE;
    }
  }

  return result;
}

/**
 * Scan module-scoped API routes: ./modules/** /api/** /*.ts
 */
export function scanModuleApis(appDir: string): Record<string, unknown> {
  const result: Record<string, unknown> = {};
  scanPerModule(appDir, 'api', result);
  return result;
}

/**
 * Scan global API routes: ./api/** /*.ts
 */
export function scanGlobalApis(appDir: string): Record<string, unknown> {
  const result: Record<string, unknown> = {};
  walkDir(join(appDir, 'api'), appDir, result);
  return result;
}
