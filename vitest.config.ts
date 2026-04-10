import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    globals: true,
    root: "./src",
    projects: [
      {
        test: {
          name: "unit",
          include: ["**/*.test.ts"],
          exclude: ["**/*.integration.test.ts"],
        },
      },
      {
        test: {
          name: "integration",
          include: ["**/*.integration.test.ts"],
          setupFiles: ["./tests/setup-integration.ts"],
          testTimeout: 15000,
          hookTimeout: 30000,
        },
      },
    ],
  },
});
