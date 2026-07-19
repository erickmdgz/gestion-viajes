import { defineConfig } from "vitest/config";
import path from "node:path";

// Pure `src/lib/*` tests only — no jsdom/React rendering (see docs_en/08_test_plan.md).
export default defineConfig({
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  test: {
    environment: "node",
  },
});
