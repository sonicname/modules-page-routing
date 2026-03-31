import { describe, expect, it } from 'vitest';
import { buildApiModuleRouteConfig } from './api-module-builder';

describe('buildApiModuleRouteConfig', () => {
  describe('basic module API routes', () => {
    it('should map modules/auth/api/login.ts to auth/login', () => {
      const glob = {
        './modules/auth/api/login.ts': () => Promise.resolve({}),
      };
      const routes = buildApiModuleRouteConfig(glob);
      expect(routes).toHaveLength(1);
      expect(routes[0].path).toBe('auth/login');
      expect(routes[0].file).toBe('modules/auth/api/login.ts');
    });

    it('should map modules/admin/api/users.ts to admin/users', () => {
      const glob = {
        './modules/admin/api/users.ts': () => Promise.resolve({}),
      };
      const routes = buildApiModuleRouteConfig(glob);
      expect(routes).toHaveLength(1);
      expect(routes[0].path).toBe('admin/users');
    });

    it('should handle multiple modules', () => {
      const glob = {
        './modules/auth/api/login.ts': () => Promise.resolve({}),
        './modules/admin/api/users.ts': () => Promise.resolve({}),
      };
      const routes = buildApiModuleRouteConfig(glob);
      expect(routes).toHaveLength(2);
      const paths = routes.map((r) => r.path);
      expect(paths).toContain('admin/users');
      expect(paths).toContain('auth/login');
    });
  });

  describe('dot-separated filename segments', () => {
    it('should convert dots in filename to path segments', () => {
      const glob = {
        './modules/admin/api/users.export.ts': () => Promise.resolve({}),
      };
      const routes = buildApiModuleRouteConfig(glob);
      expect(routes).toHaveLength(1);
      expect(routes[0].path).toBe('admin/users/export');
    });

    it('should handle multiple dot segments', () => {
      const glob = {
        './modules/shop/api/orders.export.csv.ts': () => Promise.resolve({}),
      };
      const routes = buildApiModuleRouteConfig(glob);
      expect(routes).toHaveLength(1);
      expect(routes[0].path).toBe('shop/orders/export/csv');
    });
  });

  describe('dynamic parameters', () => {
    it('should convert $param to :param', () => {
      const glob = {
        './modules/admin/api/users.$id.ts': () => Promise.resolve({}),
      };
      const routes = buildApiModuleRouteConfig(glob);
      expect(routes).toHaveLength(1);
      expect(routes[0].path).toBe('admin/users/:id');
    });

    it('should handle param in the middle of path', () => {
      const glob = {
        './modules/blog/api/posts.$slug.comments.ts': () =>
          Promise.resolve({}),
      };
      const routes = buildApiModuleRouteConfig(glob);
      expect(routes).toHaveLength(1);
      expect(routes[0].path).toBe('blog/posts/:slug/comments');
    });
  });

  describe('nested directories', () => {
    it('should preserve subdirectory structure', () => {
      const glob = {
        './modules/admin/api/v1/users.ts': () => Promise.resolve({}),
      };
      const routes = buildApiModuleRouteConfig(glob);
      expect(routes).toHaveLength(1);
      expect(routes[0].path).toBe('admin/v1/users');
    });

    it('should handle deeply nested paths', () => {
      const glob = {
        './modules/admin/api/v1/reports/sales.ts': () => Promise.resolve({}),
      };
      const routes = buildApiModuleRouteConfig(glob);
      expect(routes).toHaveLength(1);
      expect(routes[0].path).toBe('admin/v1/reports/sales');
    });
  });

  describe('parentless routing', () => {
    it('should strip _ prefix from directory parts', () => {
      const glob = {
        './modules/admin/api/_internal/health.ts': () => Promise.resolve({}),
      };
      const routes = buildApiModuleRouteConfig(glob);
      expect(routes).toHaveLength(1);
      expect(routes[0].path).toBe('admin/internal/health');
    });

    it('should strip _ prefix from filename segments', () => {
      const glob = {
        './modules/admin/api/_admin.users.ts': () => Promise.resolve({}),
      };
      const routes = buildApiModuleRouteConfig(glob);
      expect(routes).toHaveLength(1);
      expect(routes[0].path).toBe('admin/admin/users');
    });

    it('should strip _ prefix from module name', () => {
      const glob = {
        './modules/_internal/api/health.ts': () => Promise.resolve({}),
      };
      const routes = buildApiModuleRouteConfig(glob);
      expect(routes).toHaveLength(1);
      expect(routes[0].path).toBe('internal/health');
    });
  });

  describe('route groups', () => {
    it('should remove route group directories from path', () => {
      const glob = {
        './modules/admin/api/(v2)/users.ts': () => Promise.resolve({}),
      };
      const routes = buildApiModuleRouteConfig(glob);
      expect(routes).toHaveLength(1);
      expect(routes[0].path).toBe('admin/users');
    });

    it('should skip module name if it is a route group', () => {
      const glob = {
        './modules/(shared)/api/health.ts': () => Promise.resolve({}),
      };
      const routes = buildApiModuleRouteConfig(glob);
      expect(routes).toHaveLength(1);
      expect(routes[0].path).toBe('health');
    });
  });

  describe('sorting', () => {
    it('should sort by segment count then alphabetically', () => {
      const glob = {
        './modules/admin/api/users.$id.ts': () => Promise.resolve({}),
        './modules/admin/api/users.ts': () => Promise.resolve({}),
        './modules/admin/api/users.$id.posts.ts': () => Promise.resolve({}),
      };
      const routes = buildApiModuleRouteConfig(glob);
      expect(routes).toHaveLength(3);
      expect(routes[0].path).toBe('admin/users');
      expect(routes[1].path).toBe('admin/users/:id');
      expect(routes[2].path).toBe('admin/users/:id/posts');
    });
  });

  describe('edge cases', () => {
    it('should skip non-module paths', () => {
      const glob = {
        './api/v1/users.ts': () => Promise.resolve({}),
        './modules/admin/api/users.ts': () => Promise.resolve({}),
      };
      const routes = buildApiModuleRouteConfig(glob);
      expect(routes).toHaveLength(1);
      expect(routes[0].path).toBe('admin/users');
    });

    it('should skip module page files', () => {
      const glob = {
        './modules/admin/pages/index.tsx': () => Promise.resolve({}),
        './modules/admin/api/users.ts': () => Promise.resolve({}),
      };
      const routes = buildApiModuleRouteConfig(glob);
      expect(routes).toHaveLength(1);
      expect(routes[0].path).toBe('admin/users');
    });

    it('should handle paths without leading ./', () => {
      const glob = {
        'modules/admin/api/users.ts': () => Promise.resolve({}),
      };
      const routes = buildApiModuleRouteConfig(glob);
      expect(routes).toHaveLength(1);
      expect(routes[0].path).toBe('admin/users');
    });
  });
});
