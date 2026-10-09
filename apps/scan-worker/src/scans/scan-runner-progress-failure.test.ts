import { describe, expect, it, vi } from "vitest";
import { stubAuditor } from "../testing/stub-auditor.js";
import { STUB_SCAN_ID, stubRunnerDeps } from "../testing/stub-runner-deps.js";
import { createScanRunner } from "./scan-runner.js";

const START = "https://a.test/";

describe("ScanRunner progress when the start page fails", () => {
  it("counts the unreachable start page as attempted before failing", async () => {
    // GIVEN
    const onProgress = vi.fn();
    const auditor = stubAuditor({
      [START]: { kind: "failed", reason: "network-error", httpStatus: null },
    });
    const runScan = createScanRunner(stubRunnerDeps(auditor));

    // WHEN
    await Promise.allSettled([
      runScan({
        scanId: STUB_SCAN_ID,
        request: { url: START, depth: 1 },
        signal: new AbortController().signal,
        onProgress,
      }),
    ]);

    // THEN
    expect(onProgress).toHaveBeenLastCalledWith({
      pagesScanned: 1,
      pagesDiscovered: 1,
      currentUrl: START,
    });
  });
});
