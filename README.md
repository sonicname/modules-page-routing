# modules-page-routing

Utility library for React Router v7 - Automatically build routes from file-system with support for modules and API handlers.

## Features

- 🎯 **Type-safe** - Full TypeScript support with comprehensive type definitions
- 📁 **File-based routing** - Automatically build routes from directory structure
- 🧩 **Module-based** - Organize code by independent modules
- 🔌 **API routes** - Support for building API handlers
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

### 1. Directory Structure

Organize your code using a module-based structure:

```
app/
├── modules/
│   ├── __root.tsx          # Shared layout for all modules
│   ├── __homepage.tsx      # Homepage (index route)
│   ├── auth/
│   │   └── pages/
│   │       ├── _layout.tsx       # Layout for auth module
│   │       ├── sign-in.tsx       # /auth/sign-in
│   │       ├── sign-up.tsx       # /auth/sign-up
│   │       └── forgot-password.tsx
│   ├── admin/
│   │   └── pages/
│   │       ├── _layout.tsx       # Layout for admin module
│   │       ├── index.tsx         # /admin (index route)
│   │       ├── users/
│   │       │   ├── index.tsx     # /admin/users
│   │       │   └── [id].tsx      # /admin/users/:id
│   │       └── settings.tsx      # /admin/settings
│   └── shop/
│       └── pages/
│           ├── index.tsx          # /shop
│           ├── products/
│           │   ├── index.tsx      # /shop/products
│           │   └── [id].tsx       # /shop/products/:id
│           └── cart.tsx           # /shop/cart
├── api/
│   └── v1/
│       ├── users.ts               # API: /api/v1/users
│       ├── users.$id.ts           # API: /api/v1/users/:id
│       └── products.search.ts     # API: /api/v1/products/search
└── routes.ts
```

### 2. `routes.ts` File

```typescript
import {
  index,
  layout,
  prefix,
  type RouteConfig,
} from '@react-router/dev/routes';
import { flatRoutes } from '@react-router/fs-routes';
import { buildApiRouteConfig } from 'modules-page-routing';
import { buildGlobRouteConfig, type GlobModules } from 'modules-page-routing';

// Import all files in modules/*/pages/* and api/**/*
const globTree = import.meta.glob('./modules/**/pages/**/*.{tsx,ts}');
const apiTree = import.meta.glob('./api/**/*.ts');

// Build React Router v7 RouteConfig from glob
const moduleRoutes = buildGlobRouteConfig(globTree as GlobModules);
const apiRoutes = buildApiRouteConfig(apiTree);

const routes = [
  // All module pages are nested under a shared layout
  layout('modules/__root.tsx', [
    index('modules/__homepage.tsx'),
    ...moduleRoutes,
  ]),

  // API routes with /api prefix
  ...prefix('api', apiRoutes),

  // Routes from app/routes/** (optional - if you still want traditional file-based routing)
  ...(await flatRoutes({
    rootDirectory: 'routes',
  })),
];

export default routes satisfies RouteConfig;
```

### 3. File Naming Conventions

#### Module Pages

- **`index.tsx`** → Index route of the module/folder

  - `modules/admin/pages/index.tsx` → `/admin`
  - `modules/admin/pages/users/index.tsx` → `/admin/users`

- **`_layout.tsx`** → Layout wrapper for child routes

  - `modules/admin/pages/_layout.tsx` → Layout for all routes in `/admin/*`
  - `modules/admin/pages/users/_layout.tsx` → Layout for `/admin/users/*`

- **`[param].tsx`** → Dynamic route parameter

  - `modules/admin/pages/users/[id].tsx` → `/admin/users/:id`
  - `modules/shop/pages/products/[slug].tsx` → `/shop/products/:slug`

- **`[...rest].tsx`** → Catch-all/splat route

  - `modules/docs/pages/[...path].tsx` → `/docs/*`

- **`_not-found.tsx`** → 404 page for the module
  - `modules/admin/pages/_not-found.tsx` → 404 for `/admin/*`

#### API Routes

API routes use a different convention:

- **`filename.ts`** → Single segment

  - `api/v1/users.ts` → `/api/v1/users`

- **`filename.segment.ts`** → Multiple segments (using `.`)

  - `api/v1/products.search.ts` → `/api/v1/products/search`
  - `api/v1/orders.export.csv.ts` → `/api/v1/orders/export/csv`

- **`filename.$param.ts`** → Dynamic parameter (using `$` prefix)
  - `api/v1/users.$id.ts` → `/api/v1/users/:id`
  - `api/v1/posts.$slug.comments.ts` → `/api/v1/posts/:slug/comments`

### 4. Component Examples

#### Module Layout (`modules/admin/pages/_layout.tsx`)

```tsx
import { Outlet } from 'react-router';

export default function AdminLayout() {
  return (
    <div className='admin-layout'>
      <aside>
        <nav>
          <a href='/admin'>Dashboard</a>
          <a href='/admin/users'>Users</a>
          <a href='/admin/settings'>Settings</a>
        </nav>
      </aside>
      <main>
        <Outlet /> {/* Render nested routes */}
      </main>
    </div>
  );
}
```

#### Module Page (`modules/admin/pages/users/[id].tsx`)

```tsx
import { useParams } from 'react-router';

export default function UserDetail() {
  const { id } = useParams();

  return (
    <div>
      <h1>User Detail: {id}</h1>
      {/* Your component code */}
    </div>
  );
}
```

#### API Handler (`api/v1/users.$id.ts`)

```tsx
import type { LoaderFunctionArgs } from 'react-router';

export async function loader({ params }: LoaderFunctionArgs) {
  const userId = params.id;

  // Fetch user data
  const user = await fetchUser(userId);

  return Response.json(user);
}

export async function action({ request, params }: LoaderFunctionArgs) {
  const userId = params.id;
  const data = await request.json();

  // Update user
  await updateUser(userId, data);

  return Response.json({ success: true });
}
```

## API Reference

### `buildGlobRouteConfig(globModules: GlobModules): RouteConfigNode[]`

Builds React Router v7 RouteConfig from Vite `import.meta.glob()`.

**Parameters:**

- `globModules`: Object returned from `import.meta.glob('./modules/**/pages/**/*.{tsx,ts}')`

**Returns:** Array of RouteConfigNode to use with React Router v7 config

**Conventions:**

- Files in `modules/<module>/pages/**/*` → URL `/<module>/**/*`
- `_layout.tsx` → Layout wrapper with `<Outlet />`
- `index.tsx` → Index route
- `[param]` → Dynamic parameter
- `[...rest]` → Catch-all route
- `_not-found.tsx` → 404 handler

### `buildApiRouteConfig(globModules: Record<string, unknown>): RouteConfigNode[]`

Builds API route config from Vite `import.meta.glob()`.

**Parameters:**

- `globModules`: Object returned from `import.meta.glob('./api/**/*.ts')`

**Returns:** Array of RouteConfigNode to use with `prefix('api', ...)`

**Conventions:**

- `api/v1/users.ts` → `/api/v1/users`
- `api/v1/users.$id.ts` → `/api/v1/users/:id`
- `api/v1/products.search.ts` → `/api/v1/products/search`
- `.` in filename → additional path segment
- `$` prefix → dynamic parameter

## TypeScript Support

This library is written entirely in TypeScript with full type definitions:

```typescript
import type { GlobModules, RouteConfigNode } from 'modules-page-routing';
```

## Benefits

✅ **Automatic** - No need to manually define routes, just create files following conventions

✅ **Module-based** - Organize code by features/modules, easy to scale

✅ **Type-safe** - Full TypeScript support

✅ **Flexible** - Can be combined with traditional file-based routing

✅ **Nested layouts** - Support for nested layouts with `_layout.tsx`

✅ **API routes** - Build both UI routes and API endpoints the same way

## Real-world Example

See complete examples at: https://github.com/sonicname/modules-page-routing/tree/main/examples

## License

MIT

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request or create an Issue on GitHub.

## Repository

https://github.com/sonicname/modules-page-routing

If you encounter any issues or have questions, please create an issue on the GitHub repository.
