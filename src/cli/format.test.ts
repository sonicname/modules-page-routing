import { describe, expect, it } from 'vitest';
import { formatRouteTree, formatValidation, formatRoutesJson } from './format';
import type { RouteConfigNode } from '../routes-builder';
import type { ValidationResult } from './validate';

describe('formatRouteTree', () => {
  it('should format page routes as a tree', () => {
    const pages: RouteConfigNode[] = [
      {
        path: 'admin',
        file: 'modules/admin/pages/_layout.tsx',
        children: [
          { index: true, file: 'modules/admin/pages/index.tsx' },
          { path: 'settings', file: 'modules/admin/pages/settings.tsx' },
        ],
      },
    ];

    const output = formatRouteTree(pages, [], []);

    expect(output).toContain('Page Routes');
    expect(output).toContain('/admin');
    expect(output).toContain('(index)');
    expect(output).toContain('/settings');
  });

  it('should format API routes', () => {
    const apiRoutes: RouteConfigNode[] = [
      { path: 'v1/users', file: 'api/v1/users.ts' },
    ];
    const apiModuleRoutes: RouteConfigNode[] = [
      { path: 'shop/products', file: 'modules/shop/api/products.ts' },
    ];

    const output = formatRouteTree([], apiRoutes, apiModuleRoutes);

    expect(output).toContain('API Routes');
    expect(output).toContain('/api/v1/users');
    expect(output).toContain('/api/shop/products');
  });

  it('should show no routes message when empty', () => {
    const output = formatRouteTree([], [], []);
    expect(output).toContain('No routes found');
  });
});

describe('formatValidation', () => {
  it('should show success when no issues', () => {
    const output = formatValidation([]);
    expect(output).toContain('No issues found');
  });

  it('should format errors and warnings', () => {
    const results: ValidationResult[] = [
      {
        level: 'error',
        rule: 'duplicate-path',
        message: 'Duplicate path /admin/users',
        files: ['file-a.tsx', 'file-b.tsx'],
      },
      {
        level: 'warn',
        rule: 'missing-index',
        message: 'Module "auth" missing index',
        files: [],
      },
    ];

    const output = formatValidation(results);

    expect(output).toContain('ERROR');
    expect(output).toContain('Duplicate path');
    expect(output).toContain('file-a.tsx');
    expect(output).toContain('WARN');
    expect(output).toContain('1 error(s)');
    expect(output).toContain('1 warning(s)');
  });
});

describe('formatRoutesJson', () => {
  it('should output valid JSON with all route types', () => {
    const pages: RouteConfigNode[] = [
      { path: 'admin', file: 'admin.tsx' },
    ];
    const api: RouteConfigNode[] = [
      { path: 'v1/users', file: 'api/v1/users.ts' },
    ];
    const apiModule: RouteConfigNode[] = [
      { path: 'shop/products', file: 'modules/shop/api/products.ts' },
    ];

    const output = formatRoutesJson(pages, api, apiModule);
    const parsed = JSON.parse(output);

    expect(parsed.pages).toHaveLength(1);
    expect(parsed.api).toHaveLength(1);
    expect(parsed.apiModules).toHaveLength(1);
  });
});
