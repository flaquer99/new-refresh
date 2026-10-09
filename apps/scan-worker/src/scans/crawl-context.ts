import type {
  RunScanInput,
  ScanAuditor,
  ScanRunnerDeps,
} from "./scan-runner.js";

export type CrawlContext = {
  deps: ScanRunnerDeps;
  auditor: ScanAuditor;
  input: RunScanInput;
};

export const START_DEPTH = 0;
