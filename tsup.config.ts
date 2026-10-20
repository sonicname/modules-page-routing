import { defineConfig } from 'tsup';

export default defineConfig([
  {
    entry: { index: 'src/index.ts' },
    format: ['esm', 'cjs'],
    dts: true,
    sourcemap: true,
    // Cleaning is done by the build script so parallel configs don't wipe each other's output.
    clean: false,
    splitting: false,
    treeshake: true,
    minify: false,
    target: 'es2022',
    outDir: 'dist',
  },
  {
    entry: { cli: 'src/cli/index.ts' },
    format: ['esm'],
    dts: false,
    sourcemap: false,
    splitting: false,
    target: 'node20',
    platform: 'node',
    removeNodeProtocol: false,
    outDir: 'dist',
    banner: { js: '#!/usr/bin/env node' },
  },
]);
