# modules-page-routing

## 0.2.0

### Minor Changes

- 6ed1ebe: API routes: `index.ts` maps to its folder. `api/index.ts` is the prefix itself (`/api`), `users/index.ts` and `users.index.ts` map to `users`, and `modules/<module>/api/index.ts` to the module root (`/api/<module>`).

### Patch Changes

- 6ed1ebe: The package is now built with tsup: `dist/index.js` (ESM), `dist/index.cjs` (CommonJS) with matching type declarations, and the CLI at `dist/cli.js`. Imports through the package entry are unchanged; deep imports into the old `dist/esm`, `dist/cjs` and `dist/types` folders no longer exist.
