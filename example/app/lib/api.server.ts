import { createRepository, fetchAdapter } from 'endpoint-kit';
import { routes } from '~/api.gen';
import { localFetch } from '~/api.gen.server';

/**
 * Typed client for loaders and actions: calls the API handlers in-process (no HTTP round trip),
 * forwarding the incoming request's cookies and authorization header.
 */
export function serverApi(args: { request: Request; context?: unknown }) {
  return createRepository({ baseUrl: '', adapter: fetchAdapter({ fetch: localFetch(args) }) })
    .mergeAll(routes)
    .build();
}
