#!/usr/bin/env node

import { resolve } from 'path';
import { buildGlobRouteConfig, type GlobModules } from '../routes-builder';
import { buildApiRouteConfig } from '../api-builder';
import { buildApiModuleRouteConfig } from '../api-module-builder';
import { scanModulePages, scanModuleApis, scanGlobalApis } from './scan';
import { validateRoutes } from './validate';
import { formatRouteTree, formatValidation, formatRoutesJson } from './format';

const args = process.argv.slice(2);
const command = args[0];

function parseFlag(flag: string): string | undefined {
  const idx = args.indexOf(flag);
  if (idx === -1 || idx + 1 >= args.length) return undefined;
  return args[idx + 1];
}

const hasFlag = (flag: string) => args.includes(flag);

function getAppDir(): string {
  const dir = parseFlag('--dir') || './app';
  return resolve(process.cwd(), dir);
}

function printHelp(): void {
  console.log(`
\x1b[1mmodules-page-routing\x1b[0m — CLI for route visualization and validation

\x1b[1mUsage:\x1b[0m
  modules-page-routing <command> [options]

\x1b[1mCommands:\x1b[0m
  routes      Display the route tree
  validate    Check routes for common issues

\x1b[1mOptions:\x1b[0m
  --dir <path>   App directory (default: ./app)
  --json         Output as JSON (routes command only)
  --help, -h     Show this help message

\x1b[1mExamples:\x1b[0m
  npx modules-page-routing routes
  npx modules-page-routing routes --dir ./src/app --json
  npx modules-page-routing validate --dir ./app
`);
}

function runRoutes(): void {
  const appDir = getAppDir();
  const pageGlob = scanModulePages(appDir);
  const apiGlob = scanGlobalApis(appDir);
  const apiModuleGlob = scanModuleApis(appDir);

  const pageRoutes = buildGlobRouteConfig(pageGlob as GlobModules);
  const apiRoutes = buildApiRouteConfig(apiGlob);
  const apiModuleRoutes = buildApiModuleRouteConfig(apiModuleGlob);

  if (hasFlag('--json')) {
    console.log(formatRoutesJson(pageRoutes, apiRoutes, apiModuleRoutes));
  } else {
    console.log('');
    console.log(formatRouteTree(pageRoutes, apiRoutes, apiModuleRoutes));
    console.log('');
  }
}

function runValidate(): void {
  const appDir = getAppDir();
  const pageGlob = scanModulePages(appDir);
  const apiGlob = scanGlobalApis(appDir);
  const apiModuleGlob = scanModuleApis(appDir);

  const pageKeys = Object.keys(pageGlob);
  const apiKeys = Object.keys(apiGlob);
  const apiModuleKeys = Object.keys(apiModuleGlob);
  const total = pageKeys.length + apiKeys.length + apiModuleKeys.length;

  console.log('');
  console.log(`Scanned ${total} route file(s) in ${appDir}`);
  console.log('');

  const results = validateRoutes(pageGlob, apiGlob, apiModuleGlob);
  console.log(formatValidation(results));
  console.log('');

  // Exit with error code if validation errors found
  const hasErrors = results.some((r) => r.level === 'error');
  if (hasErrors) process.exit(1);
}

// Main
if (!command || command === '--help' || command === '-h') {
  printHelp();
} else if (command === 'routes') {
  runRoutes();
} else if (command === 'validate') {
  runValidate();
} else {
  console.error(`Unknown command: ${command}`);
  console.error('Run with --help for usage information.');
  process.exit(1);
}
