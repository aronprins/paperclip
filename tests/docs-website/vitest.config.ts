import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    name: "docs-website",
    environment: "node",
    include: ["./**/*.test.ts"],
  },
});
