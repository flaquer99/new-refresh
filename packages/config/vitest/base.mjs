export const COVERAGE_THRESHOLD_PERCENT = 80;

export const baseTestConfig = {
  include: ["src/**/*.test.{ts,tsx}"],
  coverage: {
    provider: "v8",
    include: ["src/**/*.{ts,tsx}"],
    exclude: ["src/**/*.test.{ts,tsx}", "src/testing/**"],
    reporter: ["text", "json-summary"],
    thresholds: {
      lines: COVERAGE_THRESHOLD_PERCENT,
      branches: COVERAGE_THRESHOLD_PERCENT,
      functions: COVERAGE_THRESHOLD_PERCENT,
      statements: COVERAGE_THRESHOLD_PERCENT,
    },
  },
};
