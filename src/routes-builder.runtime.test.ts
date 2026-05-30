import { describe, expect, it } from 'vitest';
import type { RouteObject } from 'react-router';
import buildGlobRoutes from './routes-builder';

/**
 * Runtime tests for the default export `buildGlobRoutes` (RouteObject[] for createBrowserRouter).
 * Build-time `buildGlobRouteConfig` is exercised by routes-builder.test.ts.
 *
 * Note: the runtime wraps everything in a top-level empty-path route; module layouts
 * (e.g. "admin") appear as children of that wrapper.
 */

function findByPath(
  routes: RouteObject[],
  path: string,
): RouteObject | undefined {
  for (const r of routes) {
    if (r.path === path) return r;
    if (r.children) {
      const found = findByPath(r.children, path);
      if (found) return found;
    }
  }
  return undefined;
}

describe('buildGlobRoutes (runtime)', () => {
  it('attaches errorElement on a module layout when _error.tsx exists', () => {
    const glob = {
      './modules/admin/pages/_layout.tsx': () =>
        Promise.resolve({ default: () => null }),
      './modules/admin/pages/_error.tsx': () =>
        Promise.resolve({ default: () => null }),
      './modules/admin/pages/index.tsx': () =>
        Promise.resolve({ default: () => null }),
    };

    const routes = buildGlobRoutes(glob as any);
    const adminLayout = findByPath(routes, 'admin');
    expect(adminLayout).toBeDefined();
    expect(adminLayout!.errorElement).toBeDefined();
  });

  it('attaches hydrateFallbackElement on a module layout when _hydrate-fallback.tsx exists', () => {
    const glob = {
      './modules/admin/pages/_layout.tsx': () =>
        Promise.resolve({ default: () => null }),
      './modules/admin/pages/_hydrate-fallback.tsx': () =>
        Promise.resolve({ default: () => null }),
      './modules/admin/pages/index.tsx': () =>
        Promise.resolve({ default: () => null }),
    };

    const routes = buildGlobRoutes(glob as any);
    const adminLayout = findByPath(routes, 'admin');
    expect(adminLayout).toBeDefined();
    expect(adminLayout!.hydrateFallbackElement).toBeDefined();
  });

  it('does not attach hydrateFallbackElement when no _hydrate-fallback.tsx is present', () => {
    const glob = {
      './modules/admin/pages/_layout.tsx': () =>
        Promise.resolve({ default: () => null }),
      './modules/admin/pages/index.tsx': () =>
        Promise.resolve({ default: () => null }),
    };

    const routes = buildGlobRoutes(glob as any);
    const adminLayout = findByPath(routes, 'admin');
    expect(adminLayout).toBeDefined();
    expect(adminLayout!.hydrateFallbackElement).toBeUndefined();
  });

  it('attaches hydrateFallbackElement at a nested layout depth, not the outer one', () => {
    const glob = {
      './modules/admin/pages/_layout.tsx': () =>
        Promise.resolve({ default: () => null }),
      './modules/admin/pages/users/_layout.tsx': () =>
        Promise.resolve({ default: () => null }),
      './modules/admin/pages/users/_hydrate-fallback.tsx': () =>
        Promise.resolve({ default: () => null }),
      './modules/admin/pages/users/index.tsx': () =>
        Promise.resolve({ default: () => null }),
    };

    const routes = buildGlobRoutes(glob as any);
    const adminLayout = findByPath(routes, 'admin');
    const usersLayout = findByPath(routes, 'users');
    expect(usersLayout).toBeDefined();
    expect(usersLayout!.hydrateFallbackElement).toBeDefined();
    expect(adminLayout!.hydrateFallbackElement).toBeUndefined();
  });

  it('does not treat _hydrate-fallback.tsx as a regular page route', () => {
    const glob = {
      './modules/admin/pages/_layout.tsx': () =>
        Promise.resolve({ default: () => null }),
      './modules/admin/pages/_hydrate-fallback.tsx': () =>
        Promise.resolve({ default: () => null }),
      './modules/admin/pages/index.tsx': () =>
        Promise.resolve({ default: () => null }),
    };

    const routes = buildGlobRoutes(glob as any);
    const collectPaths = (nodes: RouteObject[]): string[] => {
      const out: string[] = [];
      for (const n of nodes) {
        if (n.path) out.push(n.path);
        if (n.children) out.push(...collectPaths(n.children));
      }
      return out;
    };
    expect(collectPaths(routes)).not.toContain('hydrate-fallback');
  });
});
