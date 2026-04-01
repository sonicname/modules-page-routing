import { readdirSync, statSync } from 'fs';
import { join, relative, posix } from 'path';

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

  try {
    walkDir(fullDir, baseDir, result);
  } catch {
    // Directory doesn't exist — return empty
  }

  return result;
}

function walkDir(
  dir: string,
  baseDir: string,
  result: Record<string, unknown>,
): void {
  const entries = readdirSync(dir, { withFileTypes: true });

  for (const entry of entries) {
    const fullPath = join(dir, entry.name);

    if (entry.isDirectory()) {
      // Skip common non-source directories
      if (entry.name === 'node_modules' || entry.name === '.git') continue;
      walkDir(fullPath, baseDir, result);
    } else if (entry.isFile() && /\.(tsx?|jsx?)$/.test(entry.name)) {
      // Convert to posix-style relative path with ./ prefix
      const rel = relative(baseDir, fullPath).split('\\').join('/');
      result[`./${rel}`] = () => Promise.resolve({});
    }
  }
}

/**
 * Scan module pages: ./modules/** /pages/** /*.{tsx,ts}
 */
export function scanModulePages(appDir: string): Record<string, unknown> {
  const result: Record<string, unknown> = {};
  const modulesDir = join(appDir, 'modules');

  try {
    const modules = readdirSync(modulesDir, { withFileTypes: true });
    for (const mod of modules) {
      if (!mod.isDirectory()) continue;
      const pagesDir = join(modulesDir, mod.name, 'pages');
      try {
        statSync(pagesDir);
        walkDir(pagesDir, appDir, result);
      } catch {
        // No pages directory in this module
      }
    }
  } catch {
    // No modules directory
  }

  // Also pick up root-level module files like __root.tsx, __homepage.tsx
  try {
    const rootEntries = readdirSync(modulesDir, { withFileTypes: true });
    for (const entry of rootEntries) {
      if (entry.isFile() && /\.(tsx?|jsx?)$/.test(entry.name)) {
        const rel = posix.join('modules', entry.name);
        result[`./${rel}`] = () => Promise.resolve({});
      }
    }
  } catch {
    // No modules directory
  }

  return result;
}

/**
 * Scan module-scoped API routes: ./modules/** /api/** /*.ts
 */
export function scanModuleApis(appDir: string): Record<string, unknown> {
  const result: Record<string, unknown> = {};
  const modulesDir = join(appDir, 'modules');

  try {
    const modules = readdirSync(modulesDir, { withFileTypes: true });
    for (const mod of modules) {
      if (!mod.isDirectory()) continue;
      const apiDir = join(modulesDir, mod.name, 'api');
      try {
        statSync(apiDir);
        walkDir(apiDir, appDir, result);
      } catch {
        // No api directory in this module
      }
    }
  } catch {
    // No modules directory
  }

  return result;
}

/**
 * Scan global API routes: ./api/** /*.ts
 */
export function scanGlobalApis(appDir: string): Record<string, unknown> {
  const result: Record<string, unknown> = {};
  const apiDir = join(appDir, 'api');

  try {
    walkDir(apiDir, appDir, result);
  } catch {
    // No api directory
  }

  return result;
}
