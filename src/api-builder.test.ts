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
      expect(routes[0]!.path).toBe('v1/users');
    });

    it('should convert nested path segments using dots', () => {
      const glob = {
        './api/v1/products.search.ts': () => Promise.resolve({}),
      };
      const routes = buildApiRouteConfig(glob);
      expect(routes).toHaveLength(1);
      expect(routes[0]!.path).toBe('v1/products/search');
    });

    it('should convert $param to :param for dynamic routes', () => {
      const glob = {
        './api/v1/users.$id.ts': () => Promise.resolve({}),
      };
      const routes = buildApiRouteConfig(glob);
      expect(routes).toHaveLength(1);
      expect(routes[0]!.path).toBe('v1/users/:id');
    });

    it('should convert $param folder names to :param', () => {
      const glob = {
        './api/v1/users/$id/posts.ts': () => Promise.resolve({}),
      };
      const routes = buildApiRouteConfig(glob);
      expect(routes).toHaveLength(1);
      expect(routes[0]!.path).toBe('v1/users/:id/posts');
    });

    it('should convert a bare $ segment to * (splat)', () => {
      const glob = {
        './api/v1/files.$.ts': () => Promise.resolve({}),
      };
      const routes = buildApiRouteConfig(glob);
      expect(routes).toHaveLength(1);
      expect(routes[0]!.path).toBe('v1/files/*');
    });
  });

  describe('parentless routing', () => {
    it('should strip _ prefix from directory parts', () => {
      const glob = {
        './api/v1/_internal/users.ts': () => Promise.resolve({}),
      };
      const routes = buildApiRouteConfig(glob);
      expect(routes).toHaveLength(1);
      expect(routes[0]!.path).toBe('v1/internal/users');
    });

    it('should strip _ prefix from filename segments', () => {
      const glob = {
        './api/v1/_admin.users.ts': () => Promise.resolve({}),
      };
      const routes = buildApiRouteConfig(glob);
      expect(routes).toHaveLength(1);
      expect(routes[0]!.path).toBe('v1/admin/users');
    });
  });

  describe('route groups', () => {
    it('should remove route groups (parentheses) from path', () => {
      const glob = {
        './api/v1/(admin)/users.ts': () => Promise.resolve({}),
      };
      const routes = buildApiRouteConfig(glob);
      expect(routes).toHaveLength(1);
      expect(routes[0]!.path).toBe('v1/users');
    });

    it('should remove multiple route groups', () => {
      const glob = {
        './api/(v1)/(admin)/users.ts': () => Promise.resolve({}),
      };
      const routes = buildApiRouteConfig(glob);
      expect(routes).toHaveLength(1);
      expect(routes[0]!.path).toBe('users');
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
      expect(routes[0]!.path).toBe('v1/users');
      expect(routes[1]!.path).toBe('v1/users/:id');
      expect(routes[2]!.path).toBe('v1/users/:id/posts');
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
      expect(routes[0]!.path).toBe('v1/users');
    });

    it('should handle paths without leading ./', () => {
      const glob = {
        'api/v1/users.ts': () => Promise.resolve({}),
      };
      const routes = buildApiRouteConfig(glob);
      expect(routes).toHaveLength(1);
      expect(routes[0]!.path).toBe('v1/users');
    });
  });

  describe('index files', () => {
    it('should map api/index.ts to the prefix itself', () => {
      const routes = buildApiRouteConfig({ './api/index.ts': () => Promise.resolve({}) });
      expect(routes).toEqual([{ path: '', file: 'api/index.ts' }]);
    });

    it('should map folder and dotted index files to their parent', () => {
      const routes = buildApiRouteConfig({
        './api/v1/users/index.ts': () => Promise.resolve({}),
        './api/v1/orders.index.ts': () => Promise.resolve({}),
        './api/v1/users/$id/index.ts': () => Promise.resolve({}),
      });
      expect(routes.map((r) => r.path)).toEqual(['v1/orders', 'v1/users', 'v1/users/:id']);
    });

    it('should keep index in the middle of a path', () => {
      const routes = buildApiRouteConfig({ './api/index/stats.ts': () => Promise.resolve({}) });
      expect(routes[0]!.path).toBe('index/stats');
    });
  });
});
