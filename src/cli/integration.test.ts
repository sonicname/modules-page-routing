import { describe, expect, it } from 'vitest';
import { resolve } from 'path';
import { buildGlobRouteConfig, type GlobModules } from '../routes-builder';
import { buildApiRouteConfig } from '../api-builder';
import { buildApiModuleRouteConfig } from '../api-module-builder';
import { scanModulePages, scanModuleApis, scanGlobalApis } from './scan';

/**
 * Integration test against the example app — guards against any behavioral
 * regression when refactoring the internals. If route output changes legitimately,
 * update the snapshot below.
 */
describe('example app integration', () => {
  const exampleAppDir = resolve(__dirname, '../../example/app');

  it('produces the expected route tree for the example app', () => {
    const pageGlob = scanModulePages(exampleAppDir);
    const apiGlob = scanGlobalApis(exampleAppDir);
    const apiModuleGlob = scanModuleApis(exampleAppDir);

    const result = {
      pages: buildGlobRouteConfig(pageGlob as GlobModules),
      api: buildApiRouteConfig(apiGlob),
      apiModules: buildApiModuleRouteConfig(apiModuleGlob),
    };

    expect(result).toEqual({
      pages: [
        {
          path: 'admin',
          file: 'modules/admin/pages/_layout.tsx',
          children: [
            { path: 'analytics', file: 'modules/admin/pages/(reports)/analytics.tsx' },
            { path: 'overview', file: 'modules/admin/pages/(reports)/overview.tsx' },
            { path: 'users', file: 'modules/admin/pages/users/index.tsx' },
            { path: 'users/:id', file: 'modules/admin/pages/users/[id].tsx' },
            { path: 'fullscreen', file: 'modules/admin/pages/_fullscreen/index.tsx' },
            { index: true, file: 'modules/admin/pages/index.tsx' },
            { path: 'settings', file: 'modules/admin/pages/settings.tsx' },
            { path: '*', file: 'modules/admin/pages/_not-found.tsx' },
          ],
        },
        {
          path: 'auth',
          file: 'modules/auth/pages/_layout.tsx',
          children: [
            { path: 'sign-in', file: 'modules/auth/pages/sign-in.tsx' },
            { path: 'sign-up', file: 'modules/auth/pages/sign-up.tsx' },
          ],
        },
        {
          path: 'docs',
          file: 'modules/docs/pages/_layout.tsx',
          children: [
            { index: true, file: 'modules/docs/pages/index.tsx' },
            { path: '*', file: 'modules/docs/pages/[...path].tsx' },
          ],
        },
        { path: 'shop', file: 'modules/shop/pages/index.tsx' },
      ],
      api: [],
      apiModules: [
        { path: 'shop/products', file: 'modules/shop/api/products.ts' },
        { path: 'shop/products/:id', file: 'modules/shop/api/products.$id.ts' },
      ],
    });
  });
});
