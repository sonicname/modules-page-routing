import type { RouteConfigNode } from './routes-builder';
import {
  apiSegmentsFromRest,
  normalizeGlobKey,
  sortApiRoutes,
} from './_api-shared';

const MODULE_API_RE = /^modules\/([^/]+)\/api\/(.+)$/;
const ROUTE_GROUP_RE = /^\([^)]+\)$/;

/**
 * Build React Router v7 RouteConfig nodes for module-scoped API handlers.
 *
 * Expected glob pattern: import.meta.glob('./modules/** /api/** /*.ts')
 * Keys look like: "./modules/<module>/api/..." or "./modules/<module>/api/v1/hello.ts"
 *
 * URL mapping: modules/<module>/api/<rest> → <module>/<rest>
 * Intended to be used with prefix('api', ...) so final URL becomes /api/<module>/<rest>
 *
 * Conventions (same as buildApiRouteConfig):
 * - Dots in filename → additional path segments (hello.world.ts → hello/world)
 * - $param → dynamic parameter (:param)
 * - _prefix → parentless (stripped from URL)
 * - (group) folders → removed from path
 */
export function buildApiModuleRouteConfig(
  glob: Record<string, unknown>,
): RouteConfigNode[] {
  const routes: RouteConfigNode[] = [];

  for (const key of Object.keys(glob)) {
    const rel = normalizeGlobKey(key);

    const match = rel.match(MODULE_API_RE);
    if (!match) continue;

    const moduleName = match[1];
    const restSegments = apiSegmentsFromRest(match[2]);

    // Module name: strip parentless prefix, skip route groups
    const cleanModule = moduleName.startsWith('_')
      ? moduleName.slice(1)
      : ROUTE_GROUP_RE.test(moduleName)
        ? ''
        : moduleName;

    const path = [cleanModule, ...restSegments].filter(Boolean).join('/');
    if (!path) continue;

    routes.push({ path, file: rel });
  }

  sortApiRoutes(routes);
  return routes;
}

export default buildApiModuleRouteConfig;
