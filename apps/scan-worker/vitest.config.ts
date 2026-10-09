import { baseTestConfig } from "@refresh/config/vitest/base";
import { defineConfig } from "vitest/config";

const BROWSER_TEST_TIMEOUT_MS = 30_000;

export default defineConfig({
  test: {
    ...baseTestConfig,
    testTimeout: BROWSER_TEST_TIMEOUT_MS,
    hookTimeout: BROWSER_TEST_TIMEOUT_MS,
  },
});
