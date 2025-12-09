import { RouteConfigNode } from './routes-builder';

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
    // Normalize: remove leading ./ so files are relative to app/ root
    const rel = key.startsWith('./') ? key.slice(2) : key.replace(/^\//, '');

    if (!rel.startsWith('api/')) continue;

    // Compute the path relative to api/
    const afterApi = rel.slice('api/'.length); // e.g. "v1/hello.world.ts"

    // Drop extension and split directory + filename parts
    const noExt = afterApi.replace(/\.ts$/, '');

    const parts = noExt.split('/');
    const last = parts.pop()!; // filename without extension

    // filename can encode multiple segments with '.'
    // Also strip parentless prefix (_) from segments for URL generation
    const fileSegments = last
      .split('.')
      .filter(Boolean)
      .map((seg) => {
        // Strip parentless prefix if present
        let s = seg.startsWith('_') ? seg.slice(1) : seg;
        // Convert $ to dynamic param
        return s.startsWith('$') ? `:${s.slice(1)}` : s;
      });

    // Also strip parentless prefix from directory parts
    const cleanParts = parts.map((p) => (p.startsWith('_') ? p.slice(1) : p));

    const path = [...cleanParts, ...fileSegments].join('/');

    // Skip if path is empty (shouldn't happen for api handlers)
    if (!path) continue;

    routes.push({ path, file: rel });
  }

  // Optional: sort for stable output (shorter/static paths first)
  routes.sort((a, b) => {
    const aSeg = a.path!.split('/').length;
    const bSeg = b.path!.split('/').length;
    if (aSeg !== bSeg) return aSeg - bSeg;
    return a.path!.localeCompare(b.path!);
  });

  return routes;
}

export default buildApiRouteConfig;
