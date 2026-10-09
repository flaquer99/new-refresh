import type { ScanReport } from "@refresh/scan-contracts/report";
import type { ScanRequest } from "@refresh/scan-contracts/scan-request";
import { vi } from "vitest";
import { createScanRunner } from "../scans/scan-runner.js";
import { type StubSite, stubAuditor } from "./stub-auditor.js";
import { STUB_SCAN_ID, stubRunnerDeps } from "./stub-runner-deps.js";

export type StubScanInput = {
  request: ScanRequest;
  site: StubSite;
  robotsTxt?: string | null;
};

export const runStubScan = ({
  request,
  site,
  robotsTxt = null,
}: StubScanInput): Promise<ScanReport> =>
  createScanRunner(stubRunnerDeps(stubAuditor(site), robotsTxt))({
    scanId: STUB_SCAN_ID,
    request,
    signal: new AbortController().signal,
    onProgress: vi.fn(),
  });
