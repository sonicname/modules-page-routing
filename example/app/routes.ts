import {
  index,
  layout,
  prefix,
  type RouteConfig,
} from '@react-router/dev/routes';
import { flatRoutes } from '@react-router/fs-routes';
import {
  buildApiRouteConfig,
  buildApiModuleRouteConfig,
  buildGlobRouteConfig,
  type GlobModules,
} from 'modules-page-routing';

// Import all files in modules/*/pages/*, modules/*/api/*, and api/**/*
const globTree = import.meta.glob('./modules/**/pages/**/*.{tsx,ts}');
const apiTree = import.meta.glob('./api/**/*.ts');
const apiModuleTree = import.meta.glob('./modules/**/api/**/*.ts');

// Build React Router v7 RouteConfig from glob
const moduleRoutes = buildGlobRouteConfig(globTree as GlobModules);
const apiRoutes = buildApiRouteConfig(apiTree);
const apiModuleRoutes = buildApiModuleRouteConfig(apiModuleTree);

const routes = [
  // All module pages are nested under a shared layout
  layout('modules/__root.tsx', [
    index('modules/__homepage.tsx'),
    ...moduleRoutes,
  ]),

  // API routes: global (/api/v1/...) + module-scoped (/api/<module>/...)
  ...prefix('api', [...apiRoutes, ...apiModuleRoutes]),

  // Routes from app/routes/** (optional - if you still want traditional file-based routing)
  ...(await flatRoutes({
    rootDirectory: 'routes',
  })),
];

export default routes satisfies RouteConfig;
