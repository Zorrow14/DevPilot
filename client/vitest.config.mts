import path from "node:path";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vitest/config";

export default defineConfig({
  plugins: [react()],
  resolve: {
    // Mirrors tsconfig's "@/*" -> package root mapping, so test imports read
    // exactly like app imports (`@/src/lib/api`).
    alias: { "@": path.resolve(import.meta.dirname) },
  },
  test: {
    environment: "jsdom",
    globals: true,
    setupFiles: ["./vitest.setup.ts"],
    include: ["src/**/*.test.{ts,tsx}"],
    // The default `forks` pool times out spawning workers on this Windows setup;
    // threads start reliably and these tests need no process isolation.
    pool: "threads",
    coverage: {
      provider: "v8",
      include: ["src/**/*.{ts,tsx}"],
      exclude: ["src/**/*.test.{ts,tsx}", "src/**/*.d.ts"],
    },
  },
});
