import { buildGlobRouteConfig, type GlobModules } from '../routes-builder';
import { buildApiRouteConfig } from '../api-builder';
import { buildApiModuleRouteConfig } from '../api-module-builder';
import type { RouteConfigNode } from '../routes-builder';

export interface ValidationResult {
  level: 'error' | 'warn';
  rule: string;
  message: string;
  files: string[];
}

/**
 * Validate route config for common issues:
 * - Duplicate paths
 * - Dynamic segment conflicts ([id] vs [slug] in same dir)
 * - Catch-all shadowing sibling routes
 * - Orphan special files (_error/_loading without _layout)
 * - Empty modules (pages dir exists but no pages)
 * - Missing index route (has layout but no index)
 */
export function validateRoutes(
  pageGlob: Record<string, unknown>,
  apiGlob: Record<string, unknown>,
  apiModuleGlob: Record<string, unknown>,
): ValidationResult[] {
  const results: ValidationResult[] = [];

  // Build route configs
  const pageRoutes = buildGlobRouteConfig(pageGlob as GlobModules);
  const apiRoutes = buildApiRouteConfig(apiGlob);
  const apiModuleRoutes = buildApiModuleRouteConfig(apiModuleGlob);

  // 1. Check duplicate paths across all route types
  checkDuplicatePaths(pageRoutes, 'page', results);
  checkDuplicatePaths([...apiRoutes, ...apiModuleRoutes], 'api', results);

  // 2. Check dynamic segment conflicts
  checkDynamicConflicts(Object.keys(pageGlob), results);

  // 3. Check catch-all shadowing
  checkCatchAllShadowing(pageRoutes, results);

  // 4. Check orphan special files
  checkOrphanSpecialFiles(Object.keys(pageGlob), results);

  // 5. Check empty modules
  checkEmptyModules(Object.keys(pageGlob), results);

  // 6. Check missing index routes
  checkMissingIndex(Object.keys(pageGlob), results);

  return results;
}

/** Collect all resolved paths from route tree and detect duplicates */
function checkDuplicatePaths(
  routes: RouteConfigNode[],
  type: string,
  results: ValidationResult[],
  prefix = '',
): void {
  const pathMap = new Map<string, string[]>();

  const collect = (nodes: RouteConfigNode[], base: string) => {
    for (const node of nodes) {
      const fullPath = node.index
        ? base || '/'
        : node.path
          ? base ? `${base}/${node.path}` : `/${node.path}`
          : base;

      // Only track leaf routes (no children or has index)
      if (!node.children || node.index) {
        const existing = pathMap.get(fullPath) || [];
        existing.push(node.file);
        pathMap.set(fullPath, existing);
      }

      if (node.children) {
        collect(node.children, fullPath);
      }
    }
  };

  collect(routes, prefix);

  for (const [path, files] of pathMap) {
    if (files.length > 1) {
      results.push({
        level: 'error',
        rule: 'duplicate-path',
        message: `Duplicate ${type} path: ${path}`,
        files,
      });
    }
  }
}

/** Detect conflicting dynamic segments in the same directory */
function checkDynamicConflicts(
  keys: string[],
  results: ValidationResult[],
): void {
  // Group files by their directory (after pages/)
  const dirMap = new Map<string, string[]>();

  for (const key of keys) {
    const match = key.match(/\/pages\/(.+)$/);
    if (!match) continue;

    const parts = match[1].split('/');
    const fileName = parts.pop()!;
    const dir = parts.join('/') || '.';

    // Check if filename is a dynamic segment
    const dynMatch = fileName.match(/^\[([^\].]+)\]\.(t|j)sx?$/);
    if (dynMatch) {
      const existing = dirMap.get(dir) || [];
      existing.push(key);
      dirMap.set(dir, existing);
    }
  }

  for (const [dir, files] of dirMap) {
    if (files.length > 1) {
      results.push({
        level: 'error',
        rule: 'dynamic-conflict',
        message: `Conflicting dynamic segments in ${dir}`,
        files,
      });
    }
  }
}

/** Detect catch-all routes that shadow sibling routes */
function checkCatchAllShadowing(
  routes: RouteConfigNode[],
  results: ValidationResult[],
): void {
  const check = (nodes: RouteConfigNode[], parentPath: string) => {
    const catchAll = nodes.find(
      (n) => n.path === '*' && !n.file?.includes('_not-found'),
    );
    const siblings = nodes.filter((n) => n.path && n.path !== '*');

    if (catchAll && siblings.length > 0) {
      results.push({
        level: 'warn',
        rule: 'catchall-shadow',
        message: `Catch-all route may shadow ${siblings.length} sibling route(s) under ${parentPath || '/'}`,
        files: [catchAll.file, ...siblings.map((s) => s.file)],
      });
    }

    for (const node of nodes) {
      if (node.children) {
        const path = node.path
          ? parentPath ? `${parentPath}/${node.path}` : `/${node.path}`
          : parentPath;
        check(node.children, path);
      }
    }
  };

  check(routes, '');
}

/** Check for _error/_loading without a _layout in the same scope */
function checkOrphanSpecialFiles(
  keys: string[],
  results: ValidationResult[],
): void {
  const layoutDirs = new Set<string>();
  const specialFiles: { file: string; dir: string; type: string }[] = [];

  for (const key of keys) {
    const match = key.match(/\/pages\/(.+)$/);
    if (!match) continue;

    const pathAfterPages = match[1];
    const parts = pathAfterPages.split('/');
    const fileName = parts.pop()!;
    const dir = parts.join('/') || '.';

    if (fileName === '_layout.tsx' || fileName === 'layout.tsx') {
      layoutDirs.add(dir);
    } else if (fileName === '_error.tsx' || fileName === 'error.tsx') {
      specialFiles.push({ file: key, dir, type: '_error.tsx' });
    } else if (fileName === '_loading.tsx' || fileName === 'loading.tsx') {
      specialFiles.push({ file: key, dir, type: '_loading.tsx' });
    } else if (
      fileName === '_hydrate-fallback.tsx' ||
      fileName === 'hydrate-fallback.tsx'
    ) {
      specialFiles.push({ file: key, dir, type: '_hydrate-fallback.tsx' });
    }
  }

  for (const sf of specialFiles) {
    if (!layoutDirs.has(sf.dir)) {
      results.push({
        level: 'warn',
        rule: 'orphan-special-file',
        message: `${sf.type} without _layout.tsx in same directory`,
        files: [sf.file],
      });
    }
  }
}

/** Check for modules with pages/ dir but no actual page files */
function checkEmptyModules(
  keys: string[],
  results: ValidationResult[],
): void {
  const modulePages = new Map<string, number>();

  for (const key of keys) {
    const match = key.match(/\/modules\/([^/]+)\/pages\//);
    if (!match) continue;

    const moduleName = match[1];
    const isSpecial = /_(?:layout|not-found|error|loading|hydrate-fallback)\.(t|j)sx?$/.test(key);
    const count = modulePages.get(moduleName) || 0;
    modulePages.set(moduleName, count + (isSpecial ? 0 : 1));
  }

  for (const [mod, pageCount] of modulePages) {
    if (pageCount === 0) {
      results.push({
        level: 'warn',
        rule: 'empty-module',
        message: `Module "${mod}" has no page files`,
        files: [],
      });
    }
  }
}

/** Check for modules with layout but no index route */
function checkMissingIndex(
  keys: string[],
  results: ValidationResult[],
): void {
  const moduleHasLayout = new Set<string>();
  const moduleHasIndex = new Set<string>();

  for (const key of keys) {
    const match = key.match(/\/modules\/([^/]+)\/pages\/(.+)$/);
    if (!match) continue;

    const moduleName = match[1];
    const remainder = match[2];

    if (remainder === '_layout.tsx' || remainder === 'layout.tsx') {
      moduleHasLayout.add(moduleName);
    }
    if (remainder === 'index.tsx' || remainder === 'index.ts') {
      moduleHasIndex.add(moduleName);
    }
  }

  for (const mod of moduleHasLayout) {
    if (!moduleHasIndex.has(mod)) {
      results.push({
        level: 'warn',
        rule: 'missing-index',
        message: `Module "${mod}" has _layout.tsx but no index route`,
        files: [],
      });
    }
  }
}
