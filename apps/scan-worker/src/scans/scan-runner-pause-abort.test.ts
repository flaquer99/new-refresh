import { afterEach, describe, expect, it, vi } from "vitest";
import { stubAuditor } from "../testing/stub-auditor.js";
import { STUB_SCAN_ID, stubRunnerDeps } from "../testing/stub-runner-deps.js";
import { createScanRunner } from "./scan-runner.js";

const A = "https://a.test/";
const B = "https://a.test/b";
const SITE = { [A]: { links: [B] }, [B]: {} };

const startPacedScan = () => {
  const auditor = stubAuditor(SITE);
  const controller = new AbortController();
  const deps = { ...stubRunnerDeps(auditor), pageDelayMs: undefined };
  const scanning = createScanRunner(deps)({
    scanId: STUB_SCAN_ID,
    request: { url: A, depth: 1 },
    signal: controller.signal,
    onProgress: vi.fn(),
  });
  return { auditor, controller, scanning };
};

describe("ScanRunner cancel during the politeness delay", () => {
  afterEach(() => {
    vi.useRealTimers();
  });

  it("does not start the next page after a cancel", async () => {
    // GIVEN
    vi.useFakeTimers();
    const scan = startPacedScan();
    await vi.waitFor(() => expect(scan.auditor.audit).toHaveBeenCalledTimes(1));

    // WHEN
    scan.controller.abort();
    await scan.scanning;

    // THEN
    expect(scan.auditor.audit).toHaveBeenCalledTimes(1);
  });

  it("records the page waiting for its turn as not-reached", async () => {
    // GIVEN
    vi.useFakeTimers();
    const scan = startPacedScan();
    await vi.waitFor(() => expect(scan.auditor.audit).toHaveBeenCalledTimes(1));

    // WHEN
    scan.controller.abort();

    // THEN
    const { pages } = await scan.scanning;
    expect(pages.map(({ url, reason }) => [url, reason])).toEqual([
      [A, null],
      [B, "not-reached"],
    ]);
  });
});
