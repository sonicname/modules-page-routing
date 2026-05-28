import type { RouteConfigNode } from './routes-builder';

const TS_EXT_RE = /\.ts$/;
const ROUTE_GROUP_RE = /^\([^)]+\)$/;

/**
 * Internal helper shared by `buildApiRouteConfig` and `buildApiModuleRouteConfig`.
 *
 * Given a file path relative to its API root (e.g. "v1/hello.world.ts" or "users.ts"),
 * returns the URL segments after applying the standard conventions:
 *   - drop `.ts` extension
 *   - dots in filename encode additional path segments (hello.world.ts → ["hello", "world"])
 *   - `$param` → `:param` (dynamic)
 *   - `_prefix` → strip the `_` (parentless)
 *   - `(group)` folders → removed (route group)
 */
export function apiSegmentsFromRest(rest: string): string[] {
  const noExt = rest.replace(TS_EXT_RE, '');
  const parts = noExt.split('/');
  const last = parts.pop()!;

  const fileSegments = last
    .split('.')
    .filter(Boolean)
    .map(normalizeSegment);

  const dirSegments = parts
    .filter((p) => !ROUTE_GROUP_RE.test(p))
    .map(stripUnderscore);

  return [...dirSegments, ...fileSegments];
}

function normalizeSegment(seg: string): string {
  const stripped = stripUnderscore(seg);
  return stripped.startsWith('$') ? `:${stripped.slice(1)}` : stripped;
}

function stripUnderscore(seg: string): string {
  return seg.startsWith('_') ? seg.slice(1) : seg;
}

/**
 * Strip leading `./` or `/` to normalize glob keys.
 */
export function normalizeGlobKey(key: string): string {
  if (key.startsWith('./')) return key.slice(2);
  if (key.startsWith('/')) return key.slice(1);
  return key;
}

/**
 * Standard sort for API routes: shorter (fewer segments) first, then alphabetical.
 */
export function sortApiRoutes(routes: RouteConfigNode[]): void {
  routes.sort((a, b) => {
    const aSeg = a.path!.split('/').length;
    const bSeg = b.path!.split('/').length;
    if (aSeg !== bSeg) return aSeg - bSeg;
    return a.path!.localeCompare(b.path!);
  });
}
