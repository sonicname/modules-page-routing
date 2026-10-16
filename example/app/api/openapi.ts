import { api } from 'auto-types-api';
import { createOpenApiDocument } from 'auto-types-api/openapi';

// GET /api/openapi: an OpenAPI 3.1 document built from the API files' schemas.
const modules = import.meta.glob(['./**/*.ts', '../modules/*/api/**/*.ts', '!./openapi.ts'], {
  eager: true,
});

export const loader = api.serve({
  GET: api.get({ summary: 'OpenAPI document' }, () =>
    createOpenApiDocument({
      modules,
      from: 'api',
      info: { title: 'modules-page-routing example', version: '1.0.0' },
    }),
  ),
});
