export declare const COVERAGE_THRESHOLD_PERCENT: number;

export declare const baseTestConfig: {
  include: string[];
  coverage: {
    provider: "v8";
    include: string[];
    exclude: string[];
    reporter: string[];
    thresholds: {
      lines: number;
      branches: number;
      functions: number;
      statements: number;
    };
  };
};
