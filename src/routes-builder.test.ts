import { describe, expect, it } from 'vitest';
import {
  buildGlobRouteConfig,
  hasParentlessSegment,
  isLayoutFile,
  isNotFoundFile,
  isParentlessSegment,
  isRouteGroup,
  toUrlSegment,
} from './routes-builder';

describe('toUrlSegment', () => {
  describe('static segments', () => {
    it('should return static segment as-is', () => {
      expect(toUrlSegment('users')).toBe('users');
      expect(toUrlSegment('admin')).toBe('admin');
      expect(toUrlSegment('dashboard')).toBe('dashboard');
    });
  });

  describe('dynamic segments', () => {
    it('should convert [id] to :id', () => {
      expect(toUrlSegment('[id]')).toBe(':id');
    });

    it('should convert [slug] to :slug', () => {
      expect(toUrlSegment('[slug]')).toBe(':slug');
    });

    it('should convert [userId] to :userId', () => {
      expect(toUrlSegment('[userId]')).toBe(':userId');
    });
  });

  describe('catch-all segments', () => {
    it('should convert [...rest] to :rest*', () => {
      expect(toUrlSegment('[...rest]')).toBe(':rest*');
    });

    it('should convert [...path] to :path*', () => {
      expect(toUrlSegment('[...path]')).toBe(':path*');
    });
  });

  describe('parentless segments', () => {
    it('should strip _ prefix from _login', () => {
      expect(toUrlSegment('_login')).toBe('login');
    });

    it('should strip _ prefix from _checkout', () => {
      expect(toUrlSegment('_checkout')).toBe('checkout');
    });

    it('should NOT strip _ from _layout (special file)', () => {
      expect(toUrlSegment('_layout')).toBe('_layout');
    });

    it('should NOT strip _ from _not-found (special file)', () => {
      expect(toUrlSegment('_not-found')).toBe('_not-found');
    });

    it('should NOT strip _ from _error (special file)', () => {
      expect(toUrlSegment('_error')).toBe('_error');
    });

    it('should NOT strip _ from _index (special file)', () => {
      expect(toUrlSegment('_index')).toBe('_index');
    });
  });

  describe('route groups', () => {
    it('should return empty string for (dashboard)', () => {
      expect(toUrlSegment('(dashboard)')).toBe('');
    });

    it('should return empty string for (auth)', () => {
      expect(toUrlSegment('(auth)')).toBe('');
    });

    it('should return empty string for (marketing)', () => {
      expect(toUrlSegment('(marketing)')).toBe('');
    });
  });
});

describe('isRouteGroup', () => {
  it('should return true for (dashboard)', () => {
    expect(isRouteGroup('(dashboard)')).toBe(true);
  });

  it('should return true for (auth)', () => {
    expect(isRouteGroup('(auth)')).toBe(true);
  });

  it('should return true for (admin-settings)', () => {
    expect(isRouteGroup('(admin-settings)')).toBe(true);
  });

  it('should return false for normal segment', () => {
    expect(isRouteGroup('dashboard')).toBe(false);
  });

  it('should return false for dynamic segment [id]', () => {
    expect(isRouteGroup('[id]')).toBe(false);
  });

  it('should return false for parentless segment _login', () => {
    expect(isRouteGroup('_login')).toBe(false);
  });

  it('should return false for empty parentheses ()', () => {
    expect(isRouteGroup('()')).toBe(false);
  });
});

describe('isLayoutFile', () => {
  it('should return true for _layout.tsx', () => {
    expect(isLayoutFile('_layout.tsx')).toBe(true);
  });

  it('should return true for layout.tsx', () => {
    expect(isLayoutFile('layout.tsx')).toBe(true);
  });

  it('should return true for path/_layout.tsx', () => {
    expect(isLayoutFile('some/path/_layout.tsx')).toBe(true);
  });

  it('should return true for _layout.jsx', () => {
    expect(isLayoutFile('_layout.jsx')).toBe(true);
  });

  it('should return true for _layout.ts', () => {
    expect(isLayoutFile('_layout.ts')).toBe(true);
  });

  it('should return false for regular file', () => {
    expect(isLayoutFile('index.tsx')).toBe(false);
    expect(isLayoutFile('users.tsx')).toBe(false);
  });

  it('should return false for _layout in filename', () => {
    expect(isLayoutFile('my_layout.tsx')).toBe(false);
  });
});

describe('isNotFoundFile', () => {
  it('should return true for _not-found.tsx', () => {
    expect(isNotFoundFile('_not-found.tsx')).toBe(true);
  });

  it('should return true for not-found.tsx', () => {
    expect(isNotFoundFile('not-found.tsx')).toBe(true);
  });

  it('should return true for path/_not-found.tsx', () => {
    expect(isNotFoundFile('some/path/_not-found.tsx')).toBe(true);
  });

  it('should return false for regular file', () => {
    expect(isNotFoundFile('index.tsx')).toBe(false);
    expect(isNotFoundFile('404.tsx')).toBe(false);
  });
});

describe('isParentlessSegment', () => {
  it('should return true for _login', () => {
    expect(isParentlessSegment('_login')).toBe(true);
  });

  it('should return true for _checkout', () => {
    expect(isParentlessSegment('_checkout')).toBe(true);
  });

  it('should return true for _fullscreen-editor', () => {
    expect(isParentlessSegment('_fullscreen-editor')).toBe(true);
  });

  it('should return false for _layout (special file)', () => {
    expect(isParentlessSegment('_layout')).toBe(false);
  });

  it('should return false for _layout.tsx', () => {
    expect(isParentlessSegment('_layout.tsx')).toBe(false);
  });

  it('should return false for _not-found', () => {
    expect(isParentlessSegment('_not-found')).toBe(false);
  });

  it('should return false for _not-found.tsx', () => {
    expect(isParentlessSegment('_not-found.tsx')).toBe(false);
  });

  it('should return false for _error', () => {
    expect(isParentlessSegment('_error')).toBe(false);
  });

  it('should return false for normal segment', () => {
    expect(isParentlessSegment('login')).toBe(false);
    expect(isParentlessSegment('users')).toBe(false);
  });
});

describe('hasParentlessSegment', () => {
  it('should return true for path with parentless segment', () => {
    expect(hasParentlessSegment('_login/index.tsx')).toBe(true);
    expect(hasParentlessSegment('auth/_checkout/page.tsx')).toBe(true);
  });

  it('should return false for path without parentless segment', () => {
    expect(hasParentlessSegment('auth/login/index.tsx')).toBe(false);
    expect(hasParentlessSegment('admin/users/[id].tsx')).toBe(false);
  });

  it('should return false for path with only special files', () => {
    expect(hasParentlessSegment('auth/_layout.tsx')).toBe(false);
    expect(hasParentlessSegment('auth/_not-found.tsx')).toBe(false);
  });

  it('should return true for nested parentless segment', () => {
    expect(hasParentlessSegment('admin/settings/_popup/modal.tsx')).toBe(true);
  });
});

describe('buildGlobRouteConfig', () => {
  it('should build basic route config from glob modules', () => {
    const glob = {
      './modules/auth/pages/login.tsx': () =>
        Promise.resolve({ default: () => null }),
      './modules/auth/pages/register.tsx': () =>
        Promise.resolve({ default: () => null }),
    };

    const routes = buildGlobRouteConfig(glob as any);

    // Without a layout, routes are flattened with full path
    expect(routes.length).toBeGreaterThanOrEqual(1);
    // Routes should include auth paths
    const hasAuthRoutes = routes.some((r) => r.path?.includes('auth'));
    expect(hasAuthRoutes).toBe(true);
  });

  it('should handle index routes', () => {
    const glob = {
      './modules/admin/pages/index.tsx': () =>
        Promise.resolve({ default: () => null }),
    };

    const routes = buildGlobRouteConfig(glob as any);

    expect(routes.length).toBeGreaterThanOrEqual(1);
    // Index route becomes the module path
    const adminRoute = routes.find((r) => r.path === 'admin' || r.index);
    expect(adminRoute).toBeDefined();
  });

  it('should handle dynamic routes', () => {
    const glob = {
      './modules/users/pages/[id].tsx': () =>
        Promise.resolve({ default: () => null }),
    };

    const routes = buildGlobRouteConfig(glob as any);

    expect(routes.length).toBeGreaterThanOrEqual(1);
    // Check that dynamic route is converted to :id format
    const hasIdRoute = routes.some(
      (r) =>
        r.path?.includes(':id') || r.children?.some((c) => c.path === ':id'),
    );
    expect(hasIdRoute).toBe(true);
  });

  it('should skip layout files from page routes', () => {
    const glob = {
      './modules/admin/pages/_layout.tsx': () =>
        Promise.resolve({ default: () => null }),
      './modules/admin/pages/index.tsx': () =>
        Promise.resolve({ default: () => null }),
    };

    const routes = buildGlobRouteConfig(glob as any);

    expect(routes).toHaveLength(1);
    // Layout should wrap the index as a parent route
    expect(routes[0].file).toBe('modules/admin/pages/_layout.tsx');
  });

  it('should handle route groups by removing them from path', () => {
    const glob = {
      './modules/admin/pages/(dashboard)/overview.tsx': () =>
        Promise.resolve({ default: () => null }),
    };

    const routes = buildGlobRouteConfig(glob as any);

    expect(routes.length).toBeGreaterThanOrEqual(1);
    // Route group (dashboard) should be stripped from path
    const hasOverview = routes.some(
      (r) =>
        r.path === 'admin' ||
        r.path?.includes('overview') ||
        r.children?.some((c) => c.path?.includes('overview')),
    );
    expect(hasOverview).toBe(true);
  });

  it('should handle nested folder structure', () => {
    const glob = {
      './modules/shop/pages/products/index.tsx': () =>
        Promise.resolve({ default: () => null }),
      './modules/shop/pages/products/[id].tsx': () =>
        Promise.resolve({ default: () => null }),
    };

    const routes = buildGlobRouteConfig(glob as any);

    expect(routes.length).toBeGreaterThanOrEqual(1);
    // Should have shop as the base path
    const hasShop = routes.some(
      (r) => r.path === 'shop' || r.path?.startsWith('shop'),
    );
    expect(hasShop).toBe(true);
  });

  it('should handle parentless routes', () => {
    const glob = {
      './modules/auth/pages/_login/index.tsx': () =>
        Promise.resolve({ default: () => null }),
    };

    const routes = buildGlobRouteConfig(glob as any);

    expect(routes.length).toBeGreaterThanOrEqual(1);
    // Parentless route should have _login stripped to 'login' in path
    const hasLogin = routes.some(
      (r) =>
        r.path?.includes('login') ||
        r.children?.some((c) => c.path?.includes('login')),
    );
    expect(hasLogin).toBe(true);
  });

  it('should skip non-module paths', () => {
    const glob = {
      './routes/home.tsx': () => Promise.resolve({ default: () => null }),
      './modules/auth/pages/login.tsx': () =>
        Promise.resolve({ default: () => null }),
    };

    const routes = buildGlobRouteConfig(glob as any);

    // Should only have auth module route, not routes/home
    const hasRoutes = routes.some((r) => r.path?.includes('routes'));
    expect(hasRoutes).toBe(false);
    const hasAuth = routes.some(
      (r) => r.path === 'auth' || r.path?.includes('auth'),
    );
    expect(hasAuth).toBe(true);
  });
});
