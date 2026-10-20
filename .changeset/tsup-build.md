---
'modules-page-routing': patch
---

The package is now built with tsup: `dist/index.js` (ESM), `dist/index.cjs` (CommonJS) with matching type declarations, and the CLI at `dist/cli.js`. Imports through the package entry are unchanged; deep imports into the old `dist/esm`, `dist/cjs` and `dist/types` folders no longer exist.
