import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    globals: false,
    environment: 'node',
    include: ['src/**/*.test.ts', 'tests/**/*.test.ts'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'html', 'lcov'],
      include: ['src/**/*.ts'],
      // The CLI entry only parses argv and prints; its parts are tested separately.
      exclude: ['src/**/*.test.ts', 'src/cli/index.ts'],
      thresholds: {
        lines: 90,
        functions: 90,
        // Current baseline of the existing suite; raise it as branch tests are added.
        branches: 74,
        statements: 90,
      },
    },
  },
});
