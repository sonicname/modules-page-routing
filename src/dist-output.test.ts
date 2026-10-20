import { execFileSync } from 'node:child_process';
import { mkdirSync, mkdtempSync, rmSync } from 'node:fs';
import { join, resolve } from 'node:path';
import { pathToFileURL } from 'node:url';
import { build } from 'tsup';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';

/**
 * Guards the published output against Node's real module loader: React Router loads
 * `routes.ts` (and therefore this package) through Node ESM, not through Vite.
 */

const root = resolve(import.meta.dirname, '..');

const EXPECTED_EXPORTS = [
  'buildApiModuleRouteConfig',
  'buildApiRouteConfig',
  'buildGlobRouteConfig',
];

function runNode(code: string): string[] {
  const output = execFileSync(process.execPath, ['--input-type=module', '-e', code], {
    cwd: root,
    encoding: 'utf8',
    stdio: 'pipe',
  });
  return JSON.parse(output.trim()) as string[];
}

describe('built output loads in Node', () => {
  let outDir: string;

  beforeAll(async () => {
    // Inside node_modules so the output resolves `react` from the project.
    const cacheDir = resolve(root, 'node_modules/.cache');
    mkdirSync(cacheDir, { recursive: true });
    outDir = mkdtempSync(join(cacheDir, 'dist-output-'));
    await build({
      config: false,
      entry: { index: resolve(root, 'src/index.ts') },
      format: ['esm', 'cjs'],
      outDir,
      target: 'es2022',
      silent: true,
    });
  }, 60_000);

  afterAll(() => {
    rmSync(outDir, { recursive: true, force: true });
  });

  it('ESM build can be imported', () => {
    const entry = pathToFileURL(join(outDir, 'index.js')).href;
    const keys = runNode(
      `const m = await import(${JSON.stringify(entry)}); console.log(JSON.stringify(Object.keys(m)));`,
    );
    expect(keys).toEqual(expect.arrayContaining(EXPECTED_EXPORTS));
  });

  it('CJS build can be required', () => {
    const entry = join(outDir, 'index.cjs');
    const keys = runNode(
      `import { createRequire } from 'node:module';
       const m = createRequire(import.meta.url)(${JSON.stringify(entry)});
       console.log(JSON.stringify(Object.keys(m)));`,
    );
    expect(keys).toEqual(expect.arrayContaining(EXPECTED_EXPORTS));
  });
});
