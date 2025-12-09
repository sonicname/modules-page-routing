import { describe, expect, it } from 'vitest';
import { buildApiRouteConfig } from './api-builder';

describe('buildApiRouteConfig', () => {
  describe('basic path conversion', () => {
    it('should convert api/v1/users.ts to v1/users', () => {
      const glob = {
        './api/v1/users.ts': () => Promise.resolve({}),
      };
      const routes = buildApiRouteConfig(glob);
      expect(routes).toHaveLength(1);
      expect(routes[0].path).toBe('v1/users');
    });

    it('should convert nested path segments using dots', () => {
      const glob = {
        './api/v1/products.search.ts': () => Promise.resolve({}),
      };
      const routes = buildApiRouteConfig(glob);
      expect(routes).toHaveLength(1);
      expect(routes[0].path).toBe('v1/products/search');
    });

    it('should convert $param to :param for dynamic routes', () => {
      const glob = {
        './api/v1/users.$id.ts': () => Promise.resolve({}),
      };
      const routes = buildApiRouteConfig(glob);
      expect(routes).toHaveLength(1);
      expect(routes[0].path).toBe('v1/users/:id');
    });
  });

  describe('parentless routing', () => {
    it('should strip _ prefix from directory parts', () => {
      const glob = {
        './api/v1/_internal/users.ts': () => Promise.resolve({}),
      };
      const routes = buildApiRouteConfig(glob);
      expect(routes).toHaveLength(1);
      expect(routes[0].path).toBe('v1/internal/users');
    });

    it('should strip _ prefix from filename segments', () => {
      const glob = {
        './api/v1/_admin.users.ts': () => Promise.resolve({}),
      };
      const routes = buildApiRouteConfig(glob);
      expect(routes).toHaveLength(1);
      expect(routes[0].path).toBe('v1/admin/users');
    });
  });

  describe('route groups', () => {
    it('should remove route groups (parentheses) from path', () => {
      const glob = {
        './api/v1/(admin)/users.ts': () => Promise.resolve({}),
      };
      const routes = buildApiRouteConfig(glob);
      expect(routes).toHaveLength(1);
      expect(routes[0].path).toBe('v1/users');
    });

    it('should remove multiple route groups', () => {
      const glob = {
        './api/(v1)/(admin)/users.ts': () => Promise.resolve({}),
      };
      const routes = buildApiRouteConfig(glob);
      expect(routes).toHaveLength(1);
      expect(routes[0].path).toBe('users');
    });
  });

  describe('sorting', () => {
    it('should sort routes by path length (shorter first)', () => {
      const glob = {
        './api/v1/users.$id.ts': () => Promise.resolve({}),
        './api/v1/users.ts': () => Promise.resolve({}),
        './api/v1/users.$id.posts.ts': () => Promise.resolve({}),
      };
      const routes = buildApiRouteConfig(glob);
      expect(routes).toHaveLength(3);
      expect(routes[0].path).toBe('v1/users');
      expect(routes[1].path).toBe('v1/users/:id');
      expect(routes[2].path).toBe('v1/users/:id/posts');
    });
  });

  describe('edge cases', () => {
    it('should skip non-api paths', () => {
      const glob = {
        './modules/auth/pages/login.ts': () => Promise.resolve({}),
        './api/v1/users.ts': () => Promise.resolve({}),
      };
      const routes = buildApiRouteConfig(glob);
      expect(routes).toHaveLength(1);
      expect(routes[0].path).toBe('v1/users');
    });

    it('should handle paths without leading ./', () => {
      const glob = {
        'api/v1/users.ts': () => Promise.resolve({}),
      };
      const routes = buildApiRouteConfig(glob);
      expect(routes).toHaveLength(1);
      expect(routes[0].path).toBe('v1/users');
    });
  });
});
