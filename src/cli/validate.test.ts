import { describe, expect, it } from 'vitest';
import { validateRoutes } from './validate';

const emptyGlob = {};

describe('validateRoutes', () => {
  describe('duplicate paths', () => {
    it('should detect duplicate page paths', () => {
      const pages = {
        './modules/admin/pages/users/index.tsx': () =>
          Promise.resolve({ default: () => null }),
        './modules/admin/pages/users.tsx': () =>
          Promise.resolve({ default: () => null }),
      };
      const results = validateRoutes(pages, emptyGlob, emptyGlob);
      const dupes = results.filter((r) => r.rule === 'duplicate-path');
      expect(dupes.length).toBeGreaterThanOrEqual(1);
      expect(dupes[0].level).toBe('error');
    });

    it('should not flag unique paths', () => {
      const pages = {
        './modules/admin/pages/users/index.tsx': () =>
          Promise.resolve({ default: () => null }),
        './modules/admin/pages/settings.tsx': () =>
          Promise.resolve({ default: () => null }),
      };
      const results = validateRoutes(pages, emptyGlob, emptyGlob);
      const dupes = results.filter((r) => r.rule === 'duplicate-path');
      expect(dupes).toHaveLength(0);
    });
  });

  describe('dynamic segment conflicts', () => {
    it('should detect conflicting dynamic segments in same dir', () => {
      const pages = {
        './modules/admin/pages/[id].tsx': () =>
          Promise.resolve({ default: () => null }),
        './modules/admin/pages/[slug].tsx': () =>
          Promise.resolve({ default: () => null }),
      };
      const results = validateRoutes(pages, emptyGlob, emptyGlob);
      const conflicts = results.filter((r) => r.rule === 'dynamic-conflict');
      expect(conflicts).toHaveLength(1);
      expect(conflicts[0].level).toBe('error');
    });

    it('should allow dynamic segments in different dirs', () => {
      const pages = {
        './modules/admin/pages/users/[id].tsx': () =>
          Promise.resolve({ default: () => null }),
        './modules/admin/pages/posts/[slug].tsx': () =>
          Promise.resolve({ default: () => null }),
      };
      const results = validateRoutes(pages, emptyGlob, emptyGlob);
      const conflicts = results.filter((r) => r.rule === 'dynamic-conflict');
      expect(conflicts).toHaveLength(0);
    });
  });

  describe('orphan special files', () => {
    it('should warn about _error.tsx without _layout.tsx', () => {
      const pages = {
        './modules/admin/pages/_error.tsx': () =>
          Promise.resolve({ default: () => null }),
        './modules/admin/pages/index.tsx': () =>
          Promise.resolve({ default: () => null }),
      };
      const results = validateRoutes(pages, emptyGlob, emptyGlob);
      const orphans = results.filter((r) => r.rule === 'orphan-special-file');
      expect(orphans).toHaveLength(1);
      expect(orphans[0].level).toBe('warn');
    });

    it('should not warn when _layout.tsx exists alongside _error.tsx', () => {
      const pages = {
        './modules/admin/pages/_layout.tsx': () =>
          Promise.resolve({ default: () => null }),
        './modules/admin/pages/_error.tsx': () =>
          Promise.resolve({ default: () => null }),
        './modules/admin/pages/index.tsx': () =>
          Promise.resolve({ default: () => null }),
      };
      const results = validateRoutes(pages, emptyGlob, emptyGlob);
      const orphans = results.filter((r) => r.rule === 'orphan-special-file');
      expect(orphans).toHaveLength(0);
    });
  });

  describe('empty modules', () => {
    it('should warn about module with only special files', () => {
      const pages = {
        './modules/admin/pages/_layout.tsx': () =>
          Promise.resolve({ default: () => null }),
      };
      const results = validateRoutes(pages, emptyGlob, emptyGlob);
      const empty = results.filter((r) => r.rule === 'empty-module');
      expect(empty).toHaveLength(1);
      expect(empty[0].message).toContain('admin');
    });
  });

  describe('missing index', () => {
    it('should warn about layout without index route', () => {
      const pages = {
        './modules/auth/pages/_layout.tsx': () =>
          Promise.resolve({ default: () => null }),
        './modules/auth/pages/login.tsx': () =>
          Promise.resolve({ default: () => null }),
      };
      const results = validateRoutes(pages, emptyGlob, emptyGlob);
      const missing = results.filter((r) => r.rule === 'missing-index');
      expect(missing).toHaveLength(1);
      expect(missing[0].message).toContain('auth');
    });

    it('should not warn when index exists', () => {
      const pages = {
        './modules/admin/pages/_layout.tsx': () =>
          Promise.resolve({ default: () => null }),
        './modules/admin/pages/index.tsx': () =>
          Promise.resolve({ default: () => null }),
      };
      const results = validateRoutes(pages, emptyGlob, emptyGlob);
      const missing = results.filter((r) => r.rule === 'missing-index');
      expect(missing).toHaveLength(0);
    });
  });

  describe('clean project', () => {
    it('should return no issues for well-structured routes', () => {
      const pages = {
        './modules/admin/pages/_layout.tsx': () =>
          Promise.resolve({ default: () => null }),
        './modules/admin/pages/_error.tsx': () =>
          Promise.resolve({ default: () => null }),
        './modules/admin/pages/_loading.tsx': () =>
          Promise.resolve({ default: () => null }),
        './modules/admin/pages/index.tsx': () =>
          Promise.resolve({ default: () => null }),
        './modules/admin/pages/settings.tsx': () =>
          Promise.resolve({ default: () => null }),
        './modules/admin/pages/users/index.tsx': () =>
          Promise.resolve({ default: () => null }),
        './modules/admin/pages/users/[id].tsx': () =>
          Promise.resolve({ default: () => null }),
      };
      const results = validateRoutes(pages, emptyGlob, emptyGlob);
      const errors = results.filter((r) => r.level === 'error');
      expect(errors).toHaveLength(0);
    });
  });
});
