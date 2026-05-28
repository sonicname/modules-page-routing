import type { RouteConfigNode } from './routes-builder';
import {
  apiSegmentsFromRest,
  normalizeGlobKey,
  sortApiRoutes,
} from './_api-shared';

/**
 * Build React Router v7 RouteConfig nodes for API handlers under app/api.
 *
 * Conventions:
 * - Keys typically look like "./api/v1/hello.world.ts" coming from import.meta.glob
 *   in routes.ts.
 * - URL path is derived by:
 *   - Stripping the leading "./api/"
 *   - Removing the ".ts" extension
 *   - Splitting the filename on '.' and turning those into additional path segments
 *     e.g. hello.world.ts -> hello/world
 *   - Segments starting with "$" become dynamic params, e.g. $id -> :id
 * - The v1 directory is preserved, so the final path (relative to the `prefix('api', ...)`) is
 *   e.g. "v1/hello/world" or "v1/hello/:id".
 */
export function buildApiRouteConfig(
  glob: Record<string, unknown>,
): RouteConfigNode[] {
  const routes: RouteConfigNode[] = [];

  for (const key of Object.keys(glob)) {
    const rel = normalizeGlobKey(key);
    if (!rel.startsWith('api/')) continue;

    const path = apiSegmentsFromRest(rel.slice('api/'.length)).join('/');
    if (!path) continue;

    routes.push({ path, file: rel });
  }

  sortApiRoutes(routes);
  return routes;
}

export default buildApiRouteConfig;
