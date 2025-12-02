# modules-page-routing

Utility library for React Router v7 - A collection of helpful utilities, hooks, and helpers for routing, navigation, and page management.

## Features

- 🎯 **Type-safe utilities** - Full TypeScript support with comprehensive type definitions
- 🪝 **Custom hooks** - React hooks for navigation state, route matching, and breadcrumbs
- 🛣️ **Route helpers** - Functions for building, matching, and manipulating routes
- 🔍 **Query parameter utilities** - Parse, stringify, and update URL query parameters
- 📦 **ESM & CommonJS** - Dual module support for maximum compatibility
- ⚡ **Zero dependencies** - Only peer dependencies on React and React Router v7

## Installation

```bash
npm install modules-page-routing
```

**Peer Dependencies:**

```bash
npm install react react-router
```

## Usage

### Navigation State Hook

Track navigation state and loading status:

```tsx
import { useNavigationState } from 'modules-page-routing';

function MyComponent() {
  const { isNavigating, isLoading, location } = useNavigationState();

  if (isLoading) {
    return <div>Loading...</div>;
  }

  return <div>Current path: {location.pathname}</div>;
}
```

### Route Matching

Check if current route matches a pattern:

```tsx
import { useRouteMatch } from 'modules-page-routing';

function UserProfile() {
  const { isMatch, params } = useRouteMatch('/users/:id');

  if (isMatch) {
    return <div>Viewing user: {params.id}</div>;
  }

  return null;
}
```

### Breadcrumbs

Generate breadcrumbs from route matches:

```tsx
import { useBreadcrumbs } from 'modules-page-routing';
import { Link } from 'react-router';

function Breadcrumbs() {
  const breadcrumbs = useBreadcrumbs();

  return (
    <nav>
      {breadcrumbs.map((crumb, index) => (
        <Link key={index} to={crumb.pathname}>
          {crumb.handle?.title || crumb.pathname}
        </Link>
      ))}
    </nav>
  );
}
```

### Route Helpers

Build and manipulate route paths:

```tsx
import {
  buildPath,
  joinPaths,
  matchesPath,
  extractParams,
} from 'modules-page-routing';

// Build a path with parameters
const path = buildPath('/users/:id/posts/:postId', {
  id: '123',
  postId: '456',
});
// Result: '/users/123/posts/456'

// Join path segments
const fullPath = joinPaths('/api', 'users', 'profile');
// Result: '/api/users/profile'

// Check if path matches pattern
const matches = matchesPath('/users/123', '/users/:id');
// Result: true

// Extract parameters from path
const params = extractParams(
  '/users/123/posts/456',
  '/users/:userId/posts/:postId',
);
// Result: { userId: '123', postId: '456' }
```

### Query Parameter Utilities

Parse and manipulate query strings:

```tsx
import {
  parseQueryString,
  stringifyQueryParams,
  updateQueryParams,
  removeQueryParams,
  getQueryParam,
} from 'modules-page-routing';

// Parse query string
const params = parseQueryString('?name=John&age=30&tags=a&tags=b');
// Result: { name: 'John', age: '30', tags: ['a', 'b'] }

// Stringify parameters
const query = stringifyQueryParams({ name: 'John', tags: ['a', 'b'] });
// Result: 'name=John&tags=a&tags=b'

// Update query parameters
const newSearch = updateQueryParams('?page=1', { page: '2', sort: 'name' });
// Result: 'page=2&sort=name'

// Remove query parameters
const filtered = removeQueryParams('?page=1&sort=name&filter=active', [
  'sort',
  'filter',
]);
// Result: 'page=1'

// Get single parameter
const page = getQueryParam('?page=1&sort=name', 'page');
// Result: '1'
```

## API Reference

### Hooks

#### `useNavigationState()`

Returns navigation state information including loading status and current location.

**Returns:**

```typescript
{
  isNavigating: boolean;
  isLoading: boolean;
  isSubmitting: boolean;
  isIdle: boolean;
  location: Location;
  state: 'idle' | 'loading' | 'submitting';
}
```

#### `useRouteMatch(pattern?: string)`

Checks if the current route matches a specific pattern.

**Parameters:**

- `pattern` (optional): Route pattern to match against

**Returns:**

```typescript
{
  isMatch: boolean;
  params: RouteParams;
  pathname: string;
}
```

#### `useBreadcrumbs()`

Generates breadcrumb data from current route matches.

**Returns:** Array of breadcrumb items with pathname and handle data

### Route Helpers

#### `buildPath(pattern: string, params: RouteParams): string`

Builds a route path by replacing parameter placeholders with actual values.

#### `joinPaths(...segments: string[]): string`

Joins multiple path segments into a single path, handling slashes automatically.

#### `matchesPath(path: string, pattern: string): boolean`

Checks if a path matches a specific pattern.

#### `extractParams(path: string, pattern: string): RouteParams`

Extracts parameters from a path based on a pattern.

### Query Parameter Utilities

#### `parseQueryString(search: string): QueryParams`

Parses a query string into an object.

#### `stringifyQueryParams(params: QueryParams): string`

Converts an object into a query string.

#### `updateQueryParams(currentSearch: string, updates: QueryParams): string`

Updates query parameters in a URL.

#### `removeQueryParams(currentSearch: string, keysToRemove: string[]): string`

Removes specific query parameters from a URL.

#### `getQueryParam(search: string, key: string): string | string[] | undefined`

Gets a single query parameter value.

## TypeScript Support

This library is written in TypeScript and provides full type definitions. All functions and hooks are fully typed for the best development experience.

## Publishing to NPM

### Prerequisites

1. Create an account on [npmjs.com](https://www.npmjs.com/)
2. Login to npm via CLI:
   ```bash
   npm login
   ```

### Building

Build the library before publishing:

```bash
npm install
npm run build
```

This will create:

- `dist/cjs/` - CommonJS modules
- `dist/esm/` - ES modules
- `dist/types/` - TypeScript declarations

### Publishing

#### First Time Publishing

```bash
npm publish
```

#### Publishing Updates

1. Update version in `package.json`:

   ```bash
   npm version patch  # for bug fixes
   npm version minor  # for new features
   npm version major  # for breaking changes
   ```

2. Publish:
   ```bash
   npm publish
   ```

#### Dry Run

Test the publish process without actually publishing:

```bash
npm publish --dry-run
```

## License

MIT

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## Repository

If you encounter any issues or have questions, please file an issue on the GitHub repository.
