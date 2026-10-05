import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { execFileSync } from 'child_process';
import { mkdirSync, mkdtempSync, readdirSync, readFileSync, rmSync, statSync, writeFileSync } from 'fs';
import { join, relative, resolve } from 'path';
import { pathToFileURL } from 'url';

/**
 * Guards the published output against Node's real module loader.
 *
 * Vitest/Vite resolve extensionless relative imports, so a missing `.js` in
 * `dist/esm` would only surface in consumers — e.g. React Router v8 loads
 * `routes.ts` (and therefore this package) through Node ESM, which fails with
 * ERR_MODULE_NOT_FOUND on `./api-builder`.
 */

const root = resolve(__dirname, '..');
const srcDir = resolve(root, 'src');
const tscBin = resolve(root, 'node_modules/typescript/bin/tsc');

const EXPECTED_EXPORTS = [
  'buildApiModuleRouteConfig',
  'buildApiRouteConfig',
  'buildGlobRouteConfig',
];

function listSourceFiles(dir: string): string[] {
  return readdirSync(dir).flatMap((name) => {
    const full = join(dir, name);
    if (statSync(full).isDirectory()) return listSourceFiles(full);
    return /\.tsx?$/.test(name) && !/\.(test|spec)\.tsx?$/.test(name) ? [full] : [];
  });
}

function compile(tsconfig: string, outDir: string): void {
  execFileSync(process.execPath, [tscBin, '-p', resolve(root, tsconfig), '--outDir', outDir], {
    cwd: root,
    stdio: 'pipe',
  });
}

function runNode(code: string): string {
  return execFileSync(process.execPath, ['--input-type=module', '-e', code], {
    cwd: root,
    encoding: 'utf8',
    stdio: 'pipe',
  }).trim();
}

describe('relative imports in published sources', () => {
  it('use explicit .js extensions', () => {
    const offenders: string[] = [];
    const specifierRe = /(?:from|import)\s*\(?\s*['"](\.{1,2}\/[^'"]*)['"]/g;

    for (const file of listSourceFiles(srcDir)) {
      const lines = readFileSync(file, 'utf8').split('\n');
      lines.forEach((line, i) => {
        for (const [, spec] of line.matchAll(specifierRe)) {
          if (!spec.endsWith('.js')) {
            offenders.push(`${relative(root, file)}:${i + 1} '${spec}'`);
          }
        }
      });
    }

    expect(offenders).toEqual([]);
  });
});

describe('compiled output loads in Node', () => {
  let tmpRoot: string;

  beforeAll(() => {
    // Inside node_modules so the compiled files can resolve `react` from the project.
    const cacheDir = resolve(root, 'node_modules/.cache');
    mkdirSync(cacheDir, { recursive: true });
    tmpRoot = mkdtempSync(join(cacheDir, 'dist-output-'));
  });

  afterAll(() => {
    rmSync(tmpRoot, { recursive: true, force: true });
  });

  it('ESM build can be imported', () => {
    const outDir = join(tmpRoot, 'esm');
    compile('tsconfig.esm.json', outDir);
    // Mirrors the marker written by the build:esm script.
    writeFileSync(join(outDir, 'package.json'), JSON.stringify({ type: 'module' }));

    const entry = pathToFileURL(join(outDir, 'index.js')).href;
    const output = runNode(
      `const m = await import(${JSON.stringify(entry)}); console.log(JSON.stringify(Object.keys(m)));`,
    );

    expect(JSON.parse(output)).toEqual(expect.arrayContaining(EXPECTED_EXPORTS));
  }, 60_000);

  it('CJS build can be required', () => {
    const outDir = join(tmpRoot, 'cjs');
    compile('tsconfig.cjs.json', outDir);

    const entry = join(outDir, 'index.js');
    const output = runNode(
      `import { createRequire } from 'module';
       const m = createRequire(import.meta.url)(${JSON.stringify(entry)});
       console.log(JSON.stringify(Object.keys(m)));`,
    );

    expect(JSON.parse(output)).toEqual(expect.arrayContaining(EXPECTED_EXPORTS));
  }, 60_000);

  it('build:esm script marks dist/esm as an ES module package', () => {
    const pkg = JSON.parse(readFileSync(resolve(root, 'package.json'), 'utf8'));
    expect(pkg.scripts['build:esm']).toContain("dist/esm/package.json");
    expect(pkg.scripts['build:esm']).toContain("type: 'module'");
  });
});
