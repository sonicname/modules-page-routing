import React, { createElement, lazy, Suspense } from 'react';
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
  default: React.ComponentType;
  Layout?: React.ComponentType<{ children: React.ReactNode }>;
}

export type GlobModules = Record<string, () => Promise<RouteModule>>;

/**
 * Helpers for converting file-system segments to URL path segments
 */
function toUrlSegment(seg: string): string {
  // dynamic segment: [id] -> :id
  const dyn = seg.match(/^\[(.+?)\]$/);
  if (dyn) return `:${dyn[1]}`;
  // catch-all: [...rest] -> * or :rest*
  const splat = seg.match(/^\[\.\.\.(.+?)\]$/);
  if (splat) return `:${splat[1]}*`;
  return seg;
}

function isLayoutFile(file: string) {
  return (
    /(?:^|\/)_(?:layout)\.(t|j)sx?$/.test(file) ||
    /(?:^|\/)layout\.(t|j)sx?$/.test(file)
  );
}

function isNotFoundFile(file: string) {
  return (
    /(?:^|\/)_(?:not-found)\.(t|j)sx?$/.test(file) ||
    /(?:^|\/)not-found\.(t|j)sx?$/.test(file)
  );
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

    // Detect if this file is a layout/not-found/page
    if (isLayoutFile(remainder)) {
      // module root layout: pages/_layout.tsx
      if (remainder === '_layout.tsx' || remainder === 'layout.tsx') {
        moduleNode.layoutFile = filePath;
        continue;
      }
      // nested directory layout: <dir>/_layout.tsx
      const parts = remainder.split('/');
      const layoutIdx = parts.lastIndexOf('_layout.tsx');
      const layoutIdx2 = parts.lastIndexOf('layout.tsx');
      const idx = Math.max(layoutIdx, layoutIdx2);
      if (idx >= 1) {
        // directory path before the layout filename
        let cur = moduleNode;
        for (let i = 0; i < idx; i++) {
          cur = getChild(cur, parts[i]);
        }
        cur.layoutFile = filePath;
        continue;
      }
    }

    if (isNotFoundFile(remainder)) {
      if (remainder === '_not-found.tsx' || remainder === 'not-found.tsx') {
        moduleNode.notFoundFile = filePath;
        continue;
      }
      const parts = remainder.split('/');
      const nfIdx = parts.lastIndexOf('_not-found.tsx');
      const nfIdx2 = parts.lastIndexOf('not-found.tsx');
      const idx = Math.max(nfIdx, nfIdx2);
      if (idx >= 1) {
        let cur = moduleNode;
        for (let i = 0; i < idx; i++) {
          cur = getChild(cur, parts[i]);
        }
        cur.notFoundFile = filePath;
        continue;
      }
    }

    // It's a page. Split into directory segments and filename
    const parts = remainder.replace(/\.(t|j)sx?$/, '').split('/');
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
    .filter((route) => {
      return (
        !route.match(/\/_[^/]+$/) &&
        !route.endsWith('/_layout.tsx') &&
        !route.endsWith('/_error.tsx') &&
        !route.endsWith('/_not-found.tsx')
      );
    })
    .sort((a, b) => {
      // Priority: root index > other index > static > dynamic > catch-all
      const aIsRootIndex =
        a === './pages/index.tsx' ||
        a === '/pages/index.tsx' ||
        a === './modules/index.tsx';
      const bIsRootIndex =
        b === './pages/index.tsx' ||
        b === '/pages/index.tsx' ||
        b === './modules/index.tsx';
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
          .replace(/^\.\//, '')
          .replace(/^\/src\/pages\//, '')
          .replace(/^\/src\/modules\/[^/]+\/pages\//, '')
          .replace(/^\/pages\//, '')
          .replace(/^\/modules\/[^/]+\/pages\//, '')
          .replace(/\.tsx$/, '');
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
 * Supports two roots:
 * - /src/pages/...  (legacy)
 * - /src/modules/<module>/pages/...  -> becomes /<module>/... in URL
 */
function convertToRoutePath(route: string): string {
  // Helper to convert segment patterns
  const convertSegments = (p: string) =>
    p
      .replace(/\(.+?\)\//g, '') // remove group notation
      .replace(/\/index$/, '') // remove trailing /index
      .replace(/^index$/, '')
      .replace(/\.(tsx|jsx)$/, '')
      .replace(/\[\.\.\.(.+?)\]/g, '*')
      .replace(/\[([^.].*?)\]/g, ':$1');

  // Modules pattern: /src/modules/<module>/pages/...
  const modMatch = route
    .replace(/^\.\//, '/')
    .match(/^\/modules\/([^/]+)\/pages\/(.*)\.(t|j)sx$/);
  if (modMatch) {
    const moduleName = modMatch[1];
    let rest = modMatch[2];
    rest = convertSegments(rest);

    // If rest is empty or index -> module root
    if (!rest || rest === '') return `/${moduleName}`;

    // ensure leading slash for rest
    if (!rest.startsWith('/')) rest = '/' + rest;
    return `/${moduleName}${rest}`;
  }

  // Legacy /src/pages/... support
  const legacyMatch = route.match(/^\/src\/pages\/(.*)\.tsx$/);
  if (legacyMatch) {
    let rest = legacyMatch[1];
    rest = convertSegments(rest);
    if (!rest || rest === '') return '/';
    if (!rest.startsWith('/')) rest = '/' + rest;
    return rest;
  }

  // Fallback: remove extension and ensure leading slash
  let path = route.replace(/\.tsx$/, '');
  path = convertSegments(path);
  if (!path.startsWith('/')) path = '/' + path;
  return path;
}

/**
 * Collects layout components from the modules
 */
function collectLayouts(
  MODULES: GlobModules,
): Map<string, React.ComponentType> {
  const layoutRoutes = new Map<string, React.ComponentType>();

  Object.keys(MODULES).forEach((route) => {
    // Match layout files in either /src/pages or /src/modules/<module>/pages
    if (route.endsWith('/_layout.tsx')) {
      let layoutKey: string | undefined;

      // Root layout in legacy /src/pages/layout.tsx
      if (route === '/src/pages/_layout.tsx') {
        layoutKey = '';
      }

      // Module layouts: /src/modules/<module>/pages/.../layout.tsx
      const modMatch = route
        .replace(/^\.\//, '/')
        .match(/^\/modules\/([^/]+)\/pages\/(.*)\/(?:_?layout)\.tsx$/);
      if (modMatch) {
        const moduleName = modMatch[1];
        const rest = modMatch[2].replace(/\/$/, '');
        // if rest is empty -> module root layout
        layoutKey = rest ? `${moduleName}/${rest}` : moduleName;
      }

      // Nested module root layout like /src/modules/<module>/pages/_layout.tsx
      const modRootMatch = route
        .replace(/^\.\//, '/')
        .match(/^\/modules\/([^/]+)\/pages\/(?:_?layout)\.tsx$/);
      if (modRootMatch) {
        layoutKey = modRootMatch[1];
      }

      // Nested legacy layouts under /src/pages/.../layout.tsx
      if (
        !layoutKey &&
        route.startsWith('/src/pages/') &&
        route.endsWith('/_layout.tsx')
      ) {
        layoutKey = route
          .replace(/^\/src\/pages\//, '')
          .replace(/\/(?:_?layout)\.tsx$/, '');
      }

      if (layoutKey !== undefined) {
        // Normalize dynamic bracket segments to colon parameters for layout matching
        layoutKey = layoutKey.replace(/\[(.+?)\]/g, ':$1');
        const Layout = lazy(MODULES[route]);
        layoutRoutes.set(layoutKey, Layout);
      }
    }
  });

  return layoutRoutes;
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
  const dyn = seg.match(/^\[(.+?)\]$/);
  return dyn ? `:${dyn[1]}` : seg;
}

function suspenseWrap(
  Component: React.ComponentType,
  children?: React.ReactNode,
) {
  const node = children
    ? createElement(Component, null, children)
    : createElement(Component, null);
  return createElement(
    Suspense,
    { fallback: createElement('div', null, 'Loading...') },
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
  const layoutRoutes = collectLayouts(MODULES);

  // Create nodes for layout routes (these will use <Outlet /> in the component itself)
  const nodes = new Map<string, RouteObject>();
  const topLevel: RouteObject[] = [];

  const ensureNode = (key: string) => {
    if (nodes.has(key)) return nodes.get(key)!;
    const parentKey = getParentKey(key);
    const route: RouteObject = { path: getLastSegment(key) };
    const Layout = layoutRoutes.get(key);
    if (Layout) {
      route.element = suspenseWrap(Layout);
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
  const findParentLayoutKey = (fullPath: string): string | null => {
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

    const parentKey = findParentLayoutKey(fullPath);

    // Compute relative path from parentKey
    let relPath = fullPath.slice(1); // remove leading '/'
    if (parentKey) {
      if (relPath.startsWith(parentKey)) {
        relPath = relPath.slice(parentKey.length);
        if (relPath.startsWith('/')) relPath = relPath.slice(1);
      }
    }

    const pageRoute: RouteObject = relPath
      ? { path: relPath, element }
      : { index: true, element };

    if (parentKey) {
      const parentNode = ensureNode(parentKey);
      parentNode.children = parentNode.children ?? [];
      parentNode.children.push(pageRoute);
    } else {
      // No layout parent, attach directly to top-level
      attachRoute(null, nodes, topLevel, pageRoute);
    }
  });

  // Not-found routes
  const notFoundRoutes = Object.keys(MODULES).filter((r) =>
    r.endsWith('/_not-found.tsx'),
  );

  notFoundRoutes.forEach((filePath) => {
    // Determine target base path for wildcard
    let basePath = '/*';

    const modNestedMatch = filePath
      .replace(/^\.\//, '/')
      .match(/^\/modules\/([^/]+)\/pages\/(.+?)\/(?:_?not-found)\.tsx$/);
    const modRootMatch = filePath
      .replace(/^\.\//, '/')
      .match(/^\/modules\/([^/]+)\/pages\/_?not-found\.tsx$/);

    if (modNestedMatch) {
      const moduleName = modNestedMatch[1];
      const remainder = modNestedMatch[2].replace(/\/$/, '');
      basePath = remainder
        ? `/${moduleName}/${remainder}/*`
        : `/${moduleName}/*`;
    } else if (modRootMatch) {
      const moduleName = modRootMatch[1];
      basePath = `/${moduleName}/*`;
    } else {
      // Legacy /src/pages
      const p = filePath
        .replace(/^\/src\/pages\//, '')
        .replace(/_?not-found\.tsx$/, '')
        .replace(/\([^)]+\)\//g, '')
        .replace(/\/$/, '');
      basePath = p ? `/${p}/*` : '/*';
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
