import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    include: ["tests/**/*.test.ts"],
    exclude: ["tests/**/*.js", "node_modules/**", "dist/**"],
    environment: "node",
  },
});
