import type { RouteConfigNode } from '../routes-builder';
import type { ValidationResult } from './validate';

/**
 * Format route tree as an indented tree string for CLI output.
 *
 * Example output:
 *   /admin                     modules/admin/pages/_layout.tsx
 *   ├── (index)                modules/admin/pages/index.tsx
 *   ├── /users                 modules/admin/pages/users/index.tsx
 *   ├── /users/:id             modules/admin/pages/users/[id].tsx
 *   └── /*                     modules/admin/pages/_not-found.tsx
 */
export function formatRouteTree(
  pageRoutes: RouteConfigNode[],
  apiRoutes: RouteConfigNode[],
  apiModuleRoutes: RouteConfigNode[],
): string {
  const lines: string[] = [];

  if (pageRoutes.length > 0) {
    lines.push('\x1b[1mPage Routes\x1b[0m');
    lines.push('');
    formatNodes(pageRoutes, '', lines, '');
  }

  const allApiRoutes = [...apiRoutes, ...apiModuleRoutes];
  if (allApiRoutes.length > 0) {
    if (lines.length > 0) lines.push('');
    lines.push('\x1b[1mAPI Routes\x1b[0m');
    lines.push('');
    for (const route of allApiRoutes) {
      const path = `/api/${route.path}`;
      lines.push(`  ${pad(path, 36)} ${dim(route.file)}`);
    }
  }

  if (lines.length === 0) {
    lines.push('No routes found.');
  }

  return lines.join('\n');
}

function formatNodes(
  nodes: RouteConfigNode[],
  indent: string,
  lines: string[],
  parentPath: string,
): void {
  for (let i = 0; i < nodes.length; i++) {
    const node = nodes[i];
    const isLast = i === nodes.length - 1;
    const connector = indent ? (isLast ? '└── ' : '├── ') : '  ';
    const childIndent = indent ? indent + (isLast ? '    ' : '│   ') : '  ';

    const displayPath = node.index
      ? '(index)'
      : node.path
        ? `/${node.path}`
        : '(pathless)';

    const fullPath = node.index
      ? parentPath || '/'
      : node.path
        ? `${parentPath}/${node.path}`
        : parentPath;

    const line = `${indent}${connector}${pad(displayPath, 36 - indent.length - connector.length)} ${dim(node.file)}`;
    lines.push(line);

    if (node.children && node.children.length > 0) {
      formatNodes(node.children, childIndent, lines, fullPath);
    }
  }
}

/**
 * Format validation results for CLI output.
 */
export function formatValidation(results: ValidationResult[]): string {
  const lines: string[] = [];

  const errors = results.filter((r) => r.level === 'error');
  const warns = results.filter((r) => r.level === 'warn');

  if (results.length === 0) {
    lines.push(`\x1b[32m✓\x1b[0m No issues found.`);
    return lines.join('\n');
  }

  for (const r of errors) {
    lines.push(`  \x1b[31mERROR\x1b[0m  ${r.message}`);
    for (const f of r.files) {
      lines.push(`         → ${dim(f)}`);
    }
    lines.push('');
  }

  for (const r of warns) {
    lines.push(`  \x1b[33mWARN\x1b[0m   ${r.message}`);
    for (const f of r.files) {
      lines.push(`         → ${dim(f)}`);
    }
    lines.push('');
  }

  const summary = [
    errors.length > 0 ? `\x1b[31m${errors.length} error(s)\x1b[0m` : null,
    warns.length > 0 ? `\x1b[33m${warns.length} warning(s)\x1b[0m` : null,
  ]
    .filter(Boolean)
    .join(', ');

  lines.push(summary);

  return lines.join('\n');
}

/**
 * Format route tree as JSON for tooling integration.
 */
export function formatRoutesJson(
  pageRoutes: RouteConfigNode[],
  apiRoutes: RouteConfigNode[],
  apiModuleRoutes: RouteConfigNode[],
): string {
  return JSON.stringify(
    { pages: pageRoutes, api: apiRoutes, apiModules: apiModuleRoutes },
    null,
    2,
  );
}

function pad(str: string, width: number): string {
  return str.length >= width ? str : str + ' '.repeat(width - str.length);
}

function dim(str: string): string {
  return `\x1b[2m${str}\x1b[0m`;
}
