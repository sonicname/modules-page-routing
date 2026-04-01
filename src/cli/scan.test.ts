import { describe, expect, it } from 'vitest';
import { resolve } from 'path';
import { scanModulePages, scanModuleApis, scanGlobalApis } from './scan';

const exampleApp = resolve(__dirname, '../../example/app');

describe('scanModulePages', () => {
  it('should find page files from example app', () => {
    const result = scanModulePages(exampleApp);
    const keys = Object.keys(result);

    expect(keys.length).toBeGreaterThan(0);
    // Should include known pages
    expect(keys.some((k) => k.includes('admin/pages/index.tsx'))).toBe(true);
    expect(keys.some((k) => k.includes('auth/pages/sign-in.tsx'))).toBe(true);
  });

  it('should include root module files like __root.tsx', () => {
    const result = scanModulePages(exampleApp);
    const keys = Object.keys(result);

    expect(keys.some((k) => k.includes('__root.tsx'))).toBe(true);
    expect(keys.some((k) => k.includes('__homepage.tsx'))).toBe(true);
  });

  it('should format keys with ./ prefix', () => {
    const result = scanModulePages(exampleApp);
    const keys = Object.keys(result);

    for (const key of keys) {
      expect(key.startsWith('./')).toBe(true);
    }
  });

  it('should return empty for non-existent directory', () => {
    const result = scanModulePages('/non/existent/path');
    expect(Object.keys(result)).toHaveLength(0);
  });
});

describe('scanModuleApis', () => {
  it('should find module-scoped API files', () => {
    const result = scanModuleApis(exampleApp);
    const keys = Object.keys(result);

    expect(keys.length).toBeGreaterThan(0);
    expect(keys.some((k) => k.includes('shop/api/products.ts'))).toBe(true);
  });

  it('should return empty for non-existent directory', () => {
    const result = scanModuleApis('/non/existent/path');
    expect(Object.keys(result)).toHaveLength(0);
  });
});

describe('scanGlobalApis', () => {
  it('should return empty when no api/ directory exists', () => {
    const result = scanGlobalApis(exampleApp);
    // example app has no global api/ dir
    expect(Object.keys(result)).toHaveLength(0);
  });
});
