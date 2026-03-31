import type { RouteConfigNode } from './routes-builder';

/**
 * Build React Router v7 RouteConfig nodes for module-scoped API handlers.
 *
 * Expected glob pattern: import.meta.glob('./modules/**\/api/**\/*.ts')
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
    const rel = key.startsWith('./') ? key.slice(2) : key.replace(/^\//, '');

    // Match: modules/<module>/api/<rest>.ts
    const match = rel.match(/^modules\/([^/]+)\/api\/(.+)$/);
    if (!match) continue;

    const moduleName = match[1];
    const rest = match[2]; // e.g. "v1/hello.world.ts" or "users.ts"

    // Drop .ts extension
    const noExt = rest.replace(/\.ts$/, '');

    const parts = noExt.split('/');
    const last = parts.pop()!;

    // Filename segments: dots encode path segments
    const fileSegments = last
      .split('.')
      .filter(Boolean)
      .map((seg) => {
        const s = seg.startsWith('_') ? seg.slice(1) : seg;
        return s.startsWith('$') ? `:${s.slice(1)}` : s;
      });

    // Directory parts: strip parentless prefix, remove route groups
    const cleanParts = parts
      .filter((p) => !/^\([^)]+\)$/.test(p))
      .map((p) => (p.startsWith('_') ? p.slice(1) : p));

    // Module name: strip parentless prefix, skip route groups
    const cleanModule = moduleName.startsWith('_')
      ? moduleName.slice(1)
      : /^\([^)]+\)$/.test(moduleName)
        ? ''
        : moduleName;

    const segments = [cleanModule, ...cleanParts, ...fileSegments].filter(
      Boolean,
    );
    const path = segments.join('/');

    if (!path) continue;

    routes.push({ path, file: rel });
  }

  routes.sort((a, b) => {
    const aSeg = a.path!.split('/').length;
    const bSeg = b.path!.split('/').length;
    if (aSeg !== bSeg) return aSeg - bSeg;
    return a.path!.localeCompare(b.path!);
  });

  return routes;
}

export default buildApiModuleRouteConfig;
