import {
  ComponentType,
  createElement,
  lazy,
  type ReactNode,
  Suspense,
} from 'react';
import type { RouteObject } from 'react-router';

/**
 * V7 RouteConfig node shape for @react-router/dev
 * We keep it local to avoid importing dev-only types in shared code.
 */
export type RouteConfigNode = {
  path?: string;
  index?: boolean;
  file: string;
  children?: RouteConfigNode[];
};

interface RouteModule {
  default: ComponentType;
}

export type GlobModules = Record<string, () => Promise<RouteModule>>;

// Precompiled regex/constants used across helpers — hoisted to avoid recompilation per call.
const ROUTE_GROUP_RE = /^\([^)]+\)$/;
const SPLAT_RE = /^\[\.\.\.(.+?)\]$/;
const DYNAMIC_RE = /^\[(.+?)\]$/;
const DYNAMIC_GLOBAL_RE = /\[(.+?)\]/g;
const SPECIAL_FILE_SEGMENT_RE = /^_(layout|not-found|error|loading|index)$/;
const SPECIAL_FILE_BASENAMES = new Set([
  '_layout',
  '_not-found',
  '_error',
  '_loading',
  '_index',
]);
const EXT_RE = /\.(t|j)sx?$/;

// Per-special-file detection: `_name.tsx` and `name.tsx` variants in any directory depth.
const SPECIAL_FILES = [
  { kind: 'layout', re: /(?:^|\/)_?layout\.(t|j)sx?$/, names: ['_layout.tsx', 'layout.tsx'] },
  { kind: 'notFound', re: /(?:^|\/)_?not-found\.(t|j)sx?$/, names: ['_not-found.tsx', 'not-found.tsx'] },
  { kind: 'error', re: /(?:^|\/)_?error\.(t|j)sx?$/, names: ['_error.tsx', 'error.tsx'] },
  { kind: 'loading', re: /(?:^|\/)_?loading\.(t|j)sx?$/, names: ['_loading.tsx', 'loading.tsx'] },
] as const;

// Regex used by sortRoutes / convertToRoutePath — hoisted for hot-path reuse.
const PAGES_PREFIX_RE = /^\/modules\/[^/]+\/pages\//;
const SPECIAL_TAIL_RE = /\/_[^/]+$/;
const TSX_EXT_RE = /\.tsx$/;
const DOT_SLASH_RE = /^\.\//;
const LEAD_DOT_SLASH_GLOBAL_RE = /^\.\//g;
const MODULE_PAGES_FULL_RE = /^\/modules\/([^/]+)\/pages\/(.*)\.(t|j)sx$/;
const ROUTE_GROUP_CHUNK_RE = /\([^)]+\)\/?/g;
const PARENTLESS_NESTED_RE = /\/_([^/]+)/g;
const PARENTLESS_LEADING_RE = /^_([^/]+)/;
const SLASH_INDEX_TAIL_RE = /\/index$/;
const TSX_JSX_EXT_RE = /\.(tsx|jsx)$/;
const SPLAT_GLOBAL_RE = /\[\.\.\.(.+?)\]/g;
const DYNAMIC_NON_DOT_GLOBAL_RE = /\[([^.].*?)\]/g;
const NOT_FOUND_NESTED_RE = /^\/modules\/([^/]+)\/pages\/(.+?)\/(?:_?not-found)\.tsx$/;
const NOT_FOUND_ROOT_RE = /^\/modules\/([^/]+)\/pages\/_?not-found\.tsx$/;
const PAGES_PATH_TAIL_RE = /\/pages\/(.+)$/;

/**
 * Helpers for converting file-system segments to URL path segments
 */
export function toUrlSegment(seg: string): string {
  // Route group: (name) -> skip entirely (returns empty string)
  if (isRouteGroup(seg)) return '';

  // Strip parentless prefix for URL generation, but preserve special-file names
  let segment = seg;
  if (seg.startsWith('_') && !SPECIAL_FILE_SEGMENT_RE.test(seg)) {
    segment = seg.slice(1);
  }
  // catch-all: [...rest] -> *  (check BEFORE dynamic to avoid false match)
  const splat = segment.match(SPLAT_RE);
  if (splat) return '*';
  // dynamic segment: [id] -> :id
  const dyn = segment.match(DYNAMIC_RE);
  if (dyn) return `:${dyn[1]}`;
  return segment;
}

/**
 * Check if a segment is a route group (wrapped in parentheses)
 * Route groups are for organization only and don't create URL segments
 * Example: (dashboard), (auth), (marketing)
 */
export function isRouteGroup(segment: string): boolean {
  return ROUTE_GROUP_RE.test(segment);
}

export function isLayoutFile(file: string): boolean {
  return SPECIAL_FILES[0].re.test(file);
}

export function isNotFoundFile(file: string): boolean {
  return SPECIAL_FILES[1].re.test(file);
}

export function isErrorFile(file: string): boolean {
  return SPECIAL_FILES[2].re.test(file);
}

export function isLoadingFile(file: string): boolean {
  return SPECIAL_FILES[3].re.test(file);
}

/**
 * Check if a path segment is a parentless segment (starts with _ but not a special file)
 * Parentless routes escape from their parent layouts
 */
export function isParentlessSegment(segment: string): boolean {
  const baseName = segment.replace(EXT_RE, '');
  if (SPECIAL_FILE_BASENAMES.has(baseName)) return false;
  return segment.startsWith('_');
}

/**
 * Check if a full path contains any parentless segment
 */
export function hasParentlessSegment(path: string): boolean {
  return path.split('/').some(isParentlessSegment);
}

/**
 * Build React Router v7 RouteConfig nodes from a Vite glob() map.
 *
 * Expected keys look like: "./modules/<module>/pages/.../*.tsx" (relative to app/).
 * Returned nodes are intended to be nested under a top-level layout("/modules/__root.tsx", ...)
 * so the first URL segment becomes the <module> name.
 */
export function buildGlobRouteConfig(MODULES: GlobModules): RouteConfigNode[] {
  // Normalize entries we care about
  const entries = Object.keys(MODULES)
    .filter((k) => k.startsWith('./modules/') || k.startsWith('/modules/'))
    .map((k) => (k.startsWith('./') ? k.slice(2) : k.replace(/^\//, ''))); // strip leading ./ or leading /

  // Group by module name and path inside pages/
  type DirNode = {
    // URL segment for this directory (already converted: test, :id, etc.)
    segment: string | null; // null for the virtual root below the top-level layout
    layoutFile?: string; // absolute-like path starting with "/"
    pages: { file: string; isIndex: boolean; name?: string }[];
    notFoundFile?: string;
    errorFile?: string;
    loadingFile?: string;
    children: Map<string, DirNode>; // key is the original fs segment (for stable lookup) but we also store converted segment
  };

  const makeNode = (segment: string | null): DirNode => ({
    segment,
    pages: [],
    children: new Map(),
  });

  const root = makeNode(null);

  const getChild = (parent: DirNode, fsSegment: string): DirNode => {
    let child = parent.children.get(fsSegment);
    if (!child) {
      child = makeNode(toUrlSegment(fsSegment));
      parent.children.set(fsSegment, child);
    }
    return child;
  };

  // Build a tree: [modules]/<module>/pages/... -> URL "/<module>/..."
  for (const rel of entries) {
    // Ensure config file path is relative (no leading slash) for RouteConfig
    const filePath = rel.replace(/^\//, '');

    // Skip explicit root wrapper file, it's used separately: modules/__root.tsx
    if (filePath === 'modules/__root.tsx') continue;

    const modMatch = filePath.match(/^modules\/([^/]+)\/pages\/(.*)$/);
    if (!modMatch) continue;
    const moduleName = modMatch[1];
    const remainder = modMatch[2]; // e.g. "index.tsx", "[id]/index.tsx", "foo/bar.tsx"

    // Walk or create the module node first
    const moduleNode = getChild(root, moduleName);

    // Detect if this file is a special file (layout / not-found / error / loading).
    // For each kind, set the file on the module root (when the filename IS the special name)
    // or walk into the nested directory containing the file.
    let consumedSpecial = false;
    for (const spec of SPECIAL_FILES) {
      if (!spec.re.test(remainder)) continue;

      const assign = (node: DirNode) => {
        if (spec.kind === 'layout') node.layoutFile = filePath;
        else if (spec.kind === 'notFound') node.notFoundFile = filePath;
        else if (spec.kind === 'error') node.errorFile = filePath;
        else node.loadingFile = filePath;
      };

      // Module root: filename equals one of the special names directly.
      if ((spec.names as readonly string[]).includes(remainder)) {
        assign(moduleNode);
        consumedSpecial = true;
        break;
      }

      // Nested directory: find which named variant is the last part.
      const parts = remainder.split('/');
      const idx = Math.max(
        ...spec.names.map((n) => parts.lastIndexOf(n)),
      );
      if (idx >= 1) {
        let cur = moduleNode;
        for (let i = 0; i < idx; i++) cur = getChild(cur, parts[i]);
        assign(cur);
        consumedSpecial = true;
        break;
      }
      // Matched the regex but not at a recognized depth — fall through to page handling.
    }
    if (consumedSpecial) continue;

    // It's a page. Split into directory segments and filename
    const parts = remainder.replace(EXT_RE, '').split('/');
    const fileName = parts.pop()!; // without extension

    let cur = moduleNode;
    for (const fsSeg of parts) {
      cur = getChild(cur, fsSeg);
    }

    const isIdx = fileName === 'index';
    const pageName = isIdx ? undefined : toUrlSegment(fileName);
    cur.pages.push({ file: filePath, isIndex: isIdx, name: pageName });
  }

  // Convert tree into RouteConfigNode[]
  const buildNodes = (node: DirNode, prefix?: string): RouteConfigNode[] => {
    const out: RouteConfigNode[] = [];

    // For each child directory under this node, decide whether to create a layout route
    for (const child of node.children.values()) {
      const childPath = child.segment ?? undefined; // should always be string here
      const currentPrefix = childPath
        ? prefix
          ? `${prefix}/${childPath}`
          : childPath
        : prefix;

      // Gather grandchildren routes recursively first
      const grandchildren = buildNodes(child);

      // Add page routes that live directly inside this directory
      const pageRoutes: RouteConfigNode[] = child.pages.map((p) =>
        p.isIndex
          ? { index: true, file: p.file }
          : { path: p.name!, file: p.file },
      );

      // Add not-found if present
      if (child.notFoundFile) {
        pageRoutes.push({ path: '*', file: child.notFoundFile });
      }

      const childrenConfig = [...grandchildren, ...pageRoutes];

      if (child.layoutFile) {
        out.push({
          path: childPath,
          file: child.layoutFile,
          children: childrenConfig,
        });
      } else if (childrenConfig.length > 0) {
        // No layout: flatten children into the current level by prefixing paths
        // 1) Pages directly in this directory
        for (const p of child.pages) {
          if (p.isIndex) {
            if (currentPrefix) {
              out.push({ path: currentPrefix, file: p.file });
            } else {
              out.push({ index: true, file: p.file });
            }
          } else if (p.name) {
            out.push({
              path: currentPrefix ? `${currentPrefix}/${p.name}` : p.name,
              file: p.file,
            });
          }
        }
        // 2) Not-found for this directory
        if (child.notFoundFile) {
          if (currentPrefix) {
            out.push({ path: `${currentPrefix}/*`, file: child.notFoundFile });
          } else {
            out.push({ path: '*', file: child.notFoundFile });
          }
        }
        // 3) Grandchildren (already built) need their paths prefixed and flattened
        const prefixChild = (
          nodes: RouteConfigNode[],
          base: string | undefined,
        ): RouteConfigNode[] => {
          const prefixed: RouteConfigNode[] = [];
          for (const n of nodes) {
            if (n.index) {
              if (base) prefixed.push({ path: base, file: n.file });
              else prefixed.push({ index: true, file: n.file });
            } else if (n.path) {
              prefixed.push({
                path: base ? `${base}/${n.path}` : n.path,
                file: n.file,
                children: n.children
                  ? prefixChild(n.children, base ? `${base}/${n.path}` : n.path)
                  : undefined,
              });
            } else if (n.children && base) {
              // Pathless with children: push children with base
              prefixed.push(...prefixChild(n.children, base));
            }
          }
          return prefixed;
        };
        if (grandchildren.length > 0) {
          out.push(...prefixChild(grandchildren, currentPrefix));
        }
      }
    }

    return out;
  };

  return buildNodes(root);
}

/**
 * Sorts routes by priority root index > other index > static > dynamic > catch-all
 */
function sortRoutes(MODULES: GlobModules): string[] {
  return Object.keys(MODULES)
    .filter(
      (route) =>
        !SPECIAL_TAIL_RE.test(route) &&
        !route.endsWith('/_layout.tsx') &&
        !route.endsWith('/_error.tsx') &&
        !route.endsWith('/_loading.tsx') &&
        !route.endsWith('/_not-found.tsx'),
    )
    .sort((a, b) => {
      // Priority: root index > other index > static > dynamic > catch-all
      const aIsRootIndex = a === './modules/index.tsx';
      const bIsRootIndex = b === './modules/index.tsx';
      const aIsIndex = a.endsWith('/index.tsx');
      const bIsIndex = b.endsWith('/index.tsx');
      const aIsCatchAll = a.includes('[...');
      const bIsCatchAll = b.includes('[...');
      const aIsDynamic = a.includes('[') && !aIsCatchAll;
      const bIsDynamic = b.includes('[') && !bIsCatchAll;
      const aIsStatic = !aIsDynamic && !aIsCatchAll;
      const bIsStatic = !bIsDynamic && !bIsCatchAll;

      // 1. Root index first
      if (aIsRootIndex) return -1;
      if (bIsRootIndex) return 1;

      // 2. Other index routes
      if (aIsIndex !== bIsIndex) return aIsIndex ? -1 : 1;

      // 3. Static routes before dynamic and catch-all
      if (aIsStatic !== bIsStatic) return aIsStatic ? -1 : 1;

      // Extract clean paths for more accurate segment comparison
      const stripPrefix = (p: string) =>
        p
          .replace(LEAD_DOT_SLASH_GLOBAL_RE, '')
          .replace(PAGES_PREFIX_RE, '')
          .replace(TSX_EXT_RE, '');
      const aPath = stripPrefix(a);
      const bPath = stripPrefix(b);

      // Count segments more accurately
      const aSegments = aPath.split('/').filter(Boolean).length;
      const bSegments = bPath.split('/').filter(Boolean).length;

      // 4. Static and Dynamic routes - sort by segments length first
      if (aSegments !== bSegments) return aSegments - bSegments;

      // 5. Within same type, sort alphabetically
      if (aIsStatic && bIsStatic) return a.localeCompare(b);
      if (aIsDynamic && bIsDynamic) return a.localeCompare(b);

      // 6. Dynamic routes before catch-all
      if (aIsDynamic !== bIsDynamic) return aIsDynamic ? -1 : 1;

      // 7. Catch-all routes last
      if (aIsCatchAll !== bIsCatchAll) return aIsCatchAll ? 1 : -1;

      // 8. Within same type, sort by path length
      return a.length - b.length;
    });
}

/**
 * Converts a file path to a valid route path.
 * Modules pattern: /modules/<module>/pages/...  -> becomes /<module>/... in URL
 */
function convertToRoutePath(route: string): string {
  // Modules pattern: /modules/<module>/pages/...
  const normalized = route.replace(DOT_SLASH_RE, '/');
  const modMatch = normalized.match(MODULE_PAGES_FULL_RE);
  if (modMatch) {
    const moduleName = modMatch[1];
    let rest = convertSegments(modMatch[2]);
    if (!rest) return `/${moduleName}`;
    if (!rest.startsWith('/')) rest = '/' + rest;
    return `/${moduleName}${rest}`;
  }

  // Fallback: remove extension and ensure leading slash
  let path = convertSegments(route.replace(TSX_EXT_RE, ''));
  if (!path.startsWith('/')) path = '/' + path;
  return path;
}

function convertSegments(p: string): string {
  return p
    .replace(ROUTE_GROUP_CHUNK_RE, '')
    .replace(PARENTLESS_NESTED_RE, '/$1')
    .replace(PARENTLESS_LEADING_RE, '$1')
    .replace(SLASH_INDEX_TAIL_RE, '')
    .replace(/^index$/, '')
    .replace(TSX_JSX_EXT_RE, '')
    .replace(SPLAT_GLOBAL_RE, '*')
    .replace(DYNAMIC_NON_DOT_GLOBAL_RE, ':$1');
}

/**
 * Collects special components (layout / error / loading / not-found) from the modules,
 * keyed by their layout-key path (e.g. "admin", "admin/users", "auth/:id").
 *
 * Accepts both `name.tsx` and `_name.tsx` variants.
 */
function collectComponentsBySuffix(
  MODULES: GlobModules,
  routeKeys: string[],
  bareName: string, // e.g. 'layout', 'error', 'loading', 'not-found'
): Map<string, ComponentType> {
  const map = new Map<string, ComponentType>();
  const escaped = bareName.replace(/-/g, '\\-');
  const re = new RegExp(`^/modules/([^/]+)/pages/(.*/)?_?${escaped}\\.tsx$`);
  const endA = `/_${bareName}.tsx`;
  const endB = `/${bareName}.tsx`;

  for (const route of routeKeys) {
    if (!route.endsWith(endA) && !route.endsWith(endB)) continue;
    const m = route.replace(DOT_SLASH_RE, '/').match(re);
    if (!m) continue;

    const moduleName = m[1];
    const rest = (m[2] || '').replace(/\/$/, '');
    let key = rest ? `${moduleName}/${rest}` : moduleName;
    key = key.replace(DYNAMIC_GLOBAL_RE, ':$1');
    map.set(key, lazy(MODULES[route]));
  }

  return map;
}

/**
 * Builds an array of possible layout paths for a given route
 */
function getLayoutPaths(path: string): string[] {
  // For root path, just return an empty string
  if (path === '/') {
    return [''];
  }

  // For other paths, build layout paths from most specific to least specific
  const segments = path.split('/').filter(Boolean);
  const paths = [];

  // Start with the most specific path
  // Build paths from most specific to least specific (excluding empty string for now)
  for (let i = segments.length; i > 0; i--) {
    paths.push(segments.slice(0, i).join('/'));
  }

  // Add root layout (empty string) last - this ensures it will be applied last
  paths.push('');

  return paths;
}

// Helper: get parent key and last segment for a layout key like "auth/reports"
function getParentKey(key: string): string | null {
  if (key === '') return null;
  const pos = key.lastIndexOf('/');
  if (pos === -1) return '';
  return key.slice(0, pos);
}

function getLastSegment(key: string): string {
  if (key === '') return '';
  const pos = key.lastIndexOf('/');
  const seg = pos === -1 ? key : key.slice(pos + 1);
  const dyn = seg.match(DYNAMIC_RE);
  return dyn ? `:${dyn[1]}` : seg;
}

function suspenseWrap(
  Component: ComponentType,
  children?: ReactNode,
  fallback?: ReactNode,
) {
  const node = children
    ? createElement(Component, null, children)
    : createElement(Component, null);
  return createElement(
    Suspense,
    { fallback: fallback ?? createElement('div', null, 'Loading...') },
    node,
  );
}

/**
 * Adds not-found routes to the routes array
 */
// Attach a child route to a parent (by key) or to the top-level list
function attachRoute(
  parentKey: string | null,
  nodes: Map<string, RouteObject>,
  topLevel: RouteObject[],
  child: RouteObject,
) {
  if (parentKey === null) {
    topLevel.push(child);
    return;
  }
  const parent = nodes.get(parentKey);
  if (!parent) {
    // If no explicit parent node, attach to top-level
    topLevel.push(child);
    return;
  }
  parent.children = parent.children ?? [];
  parent.children.push(child);
}

/**
 * Builds routes from the glob modules
 */
function buildGlobRoutes(MODULES: GlobModules): RouteObject[] {
  // Cache module keys — used by every collect* pass below.
  const moduleKeys = Object.keys(MODULES);
  const layoutRoutes = collectComponentsBySuffix(MODULES, moduleKeys, 'layout');
  const errorRoutes = collectComponentsBySuffix(MODULES, moduleKeys, 'error');
  const loadingRoutes = collectComponentsBySuffix(MODULES, moduleKeys, 'loading');

  // Create nodes for layout routes (these will use <Outlet /> in the component itself)
  const nodes = new Map<string, RouteObject>();
  const topLevel: RouteObject[] = [];

  const ensureNode = (key: string) => {
    if (nodes.has(key)) return nodes.get(key)!;
    const parentKey = getParentKey(key);
    const route: RouteObject = { path: getLastSegment(key) };
    const Layout = layoutRoutes.get(key);
    if (Layout) {
      const Loading = loadingRoutes.get(key);
      const loadingFallback = Loading
        ? createElement(Loading)
        : undefined;
      route.element = suspenseWrap(Layout, undefined, loadingFallback);
    }
    const ErrorBoundary = errorRoutes.get(key);
    if (ErrorBoundary) {
      route.errorElement = createElement(ErrorBoundary);
    }
    nodes.set(key, route);

    // Attach to parent or top-level
    if (parentKey === null) {
      topLevel.push(route);
    } else {
      const parent = ensureNode(parentKey);
      parent.children = parent.children ?? [];
      parent.children.push(route);
    }
    return route;
  };

  // Ensure all layout nodes exist
  Array.from(layoutRoutes.keys()).forEach((key) => ensureNode(key));

  // Utility to find the most specific layout key for a path
  // Returns null for parentless routes (routes with _ prefix segments)
  const findParentLayoutKey = (
    fullPath: string,
    originalRoute: string,
  ): string | null => {
    // Check if the original file path contains a parentless segment
    // Extract the path after /pages/ from the original route
    const pagesMatch = originalRoute.match(PAGES_PATH_TAIL_RE);
    if (pagesMatch) {
      const pathAfterPages = pagesMatch[1];
      if (hasParentlessSegment(pathAfterPages)) {
        // Parentless route - no parent layout
        return null;
      }
    }

    const keys = getLayoutPaths(fullPath);
    for (const k of keys) {
      if (layoutRoutes.has(k)) return k;
    }
    return null;
  };

  // Regular page routes
  const sortedRoutePaths = sortRoutes(MODULES);
  sortedRoutePaths.forEach((route) => {
    const fullPath = convertToRoutePath(route); // e.g., '/auth/sign-in'
    const Component = lazy(MODULES[route]);
    const element = suspenseWrap(Component);

    // Check if this is a parentless route
    const pagesMatch = route.match(PAGES_PATH_TAIL_RE);
    const isParentless = pagesMatch && hasParentlessSegment(pagesMatch[1]);

    const parentKey = findParentLayoutKey(fullPath, route);

    // Compute relative path from parentKey
    let relPath = fullPath.slice(1); // remove leading '/'
    if (parentKey) {
      if (relPath.startsWith(parentKey)) {
        relPath = relPath.slice(parentKey.length);
        if (relPath.startsWith('/')) relPath = relPath.slice(1);
      }
    }

    // For parentless routes, use the full path (they're at top level)
    const pageRoute: RouteObject = isParentless
      ? { path: fullPath, element }
      : relPath
      ? { path: relPath, element }
      : { index: true, element };

    if (parentKey) {
      const parentNode = ensureNode(parentKey);
      parentNode.children = parentNode.children ?? [];
      parentNode.children.push(pageRoute);
    } else {
      // No layout parent (or parentless route), attach directly to top-level
      attachRoute(null, nodes, topLevel, pageRoute);
    }
  });

  // Not-found routes
  const notFoundRoutes = moduleKeys.filter((r) =>
    r.endsWith('/_not-found.tsx'),
  );

  notFoundRoutes.forEach((filePath) => {
    // Determine target base path for wildcard
    let basePath = '/*';
    const normalized = filePath.replace(DOT_SLASH_RE, '/');

    const modNestedMatch = normalized.match(NOT_FOUND_NESTED_RE);
    const modRootMatch = normalized.match(NOT_FOUND_ROOT_RE);

    if (modNestedMatch) {
      const moduleName = modNestedMatch[1];
      const remainder = modNestedMatch[2].replace(/\/$/, '');
      basePath = remainder
        ? `/${moduleName}/${remainder}/*`
        : `/${moduleName}/*`;
    } else if (modRootMatch) {
      basePath = `/${modRootMatch[1]}/*`;
    }

    const layoutKeyForNotFound = basePath
      .replace(/\/\*$/, '')
      .replace(/^\//, '');
    const parentKey = layoutKeyForNotFound || null; // '' becomes null (attach to top-level)

    const NotFound = lazy(MODULES[filePath]);
    const element = suspenseWrap(NotFound);
    const nfRoute: RouteObject = { path: '*', element };

    if (parentKey) {
      const parentNode = ensureNode(parentKey);
      parentNode.children = parentNode.children ?? [];
      parentNode.children.push(nfRoute);
    } else {
      attachRoute(null, nodes, topLevel, nfRoute);
    }
  });

  return topLevel;
}

export default buildGlobRoutes;
