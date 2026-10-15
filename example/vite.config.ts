import { reactRouter } from "@react-router/dev/vite";
import tailwindcss from "@tailwindcss/vite";
import { autoTypesApi } from "auto-types-api/vite";
import { defineConfig } from "vite";
import tsconfigPaths from "vite-tsconfig-paths";

export default defineConfig({
  plugins: [
    // Generates app/api.gen.ts (typed endpoint-kit routes) from the API files.
    autoTypesApi(),
    tailwindcss(),
    reactRouter(),
    tsconfigPaths(),
  ],
});
