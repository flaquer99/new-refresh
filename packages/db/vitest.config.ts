import { baseTestConfig } from "@refresh/config/vitest/base";
import { defineConfig } from "vitest/config";

const CONTAINER_STARTUP_TIMEOUT_MS = 120_000;
const DATABASE_TEST_TIMEOUT_MS = 30_000;

export default defineConfig({
  test: {
    ...baseTestConfig,
    globalSetup: ["./src/testing/global-setup.ts"],
    fileParallelism: false,
    hookTimeout: CONTAINER_STARTUP_TIMEOUT_MS,
    testTimeout: DATABASE_TEST_TIMEOUT_MS,
    coverage: {
      ...baseTestConfig.coverage,
      exclude: [...baseTestConfig.coverage.exclude, "src/generated/**"],
    },
  },
});
