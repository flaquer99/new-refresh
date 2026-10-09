import { describe, expect, it, vi } from "vitest";
import { stubAuditor } from "../testing/stub-auditor.js";
import { STUB_SCAN_ID, stubRunnerDeps } from "../testing/stub-runner-deps.js";
import { createScanRunner } from "./scan-runner.js";

const START = "https://a.test/";
const ROBOTS_DISALLOW_PRIVATE = "User-agent: *\nDisallow: /private";

describe("ScanRunner progress with robots.txt", () => {
  it("does not count robots-disallowed links as attempted pages", async () => {
    // GIVEN
    const onProgress = vi.fn();
    const links = [`${START}private/x`, `${START}private/y`];
    const auditor = stubAuditor({ [START]: { links } });
    const runScan = createScanRunner(
      stubRunnerDeps(auditor, ROBOTS_DISALLOW_PRIVATE),
    );

    // WHEN
    await runScan({
      scanId: STUB_SCAN_ID,
      request: { url: START, depth: 1 },
      signal: new AbortController().signal,
      onProgress,
    });

    // THEN
    expect(onProgress).toHaveBeenLastCalledWith({
      pagesScanned: 1,
      pagesDiscovered: 1,
      currentUrl: START,
    });
  });
});
