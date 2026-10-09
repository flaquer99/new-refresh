import { afterEach, describe, expect, it, vi } from "vitest";
import { stubAuditor } from "../testing/stub-auditor.js";
import { STUB_SCAN_ID, stubRunnerDeps } from "../testing/stub-runner-deps.js";
import { PAGE_DELAY_MS } from "./scan-limits.js";
import { createScanRunner } from "./scan-runner.js";

const A = "https://a.test/";
const B = "https://a.test/b";
const SITE = { [A]: { links: [B] }, [B]: {} };
const REQUEST = { url: A, depth: 1 } as const;

describe("ScanRunner progress and pacing", () => {
  afterEach(() => {
    vi.useRealTimers();
  });

  it("emits progress before and after each page", async () => {
    // GIVEN
    const onProgress = vi.fn();
    const runScan = createScanRunner(stubRunnerDeps(stubAuditor(SITE)));

    // WHEN
    await runScan({
      scanId: STUB_SCAN_ID,
      request: REQUEST,
      signal: new AbortController().signal,
      onProgress,
    });

    // THEN
    expect(onProgress.mock.calls.map(([progress]) => progress)).toEqual([
      { pagesScanned: 0, pagesDiscovered: 1, currentUrl: A },
      { pagesScanned: 1, pagesDiscovered: 2, currentUrl: A },
      { pagesScanned: 1, pagesDiscovered: 2, currentUrl: B },
      { pagesScanned: 2, pagesDiscovered: 2, currentUrl: B },
    ]);
  });

  it("waits the politeness delay before the next page", async () => {
    // GIVEN
    vi.useFakeTimers();
    const auditor = stubAuditor(SITE);
    const deps = { ...stubRunnerDeps(auditor), pageDelayMs: undefined };
    const signal = new AbortController().signal;
    const scanning = createScanRunner(deps)({
      scanId: STUB_SCAN_ID,
      request: REQUEST,
      signal,
      onProgress: vi.fn(),
    });

    // WHEN
    await vi.advanceTimersByTimeAsync(PAGE_DELAY_MS - 1);

    // THEN
    expect(auditor.audit).toHaveBeenCalledTimes(1);
    await vi.advanceTimersByTimeAsync(1);
    await scanning;
  });

  it("audits the next page once the politeness delay has passed", async () => {
    // GIVEN
    vi.useFakeTimers();
    const auditor = stubAuditor(SITE);
    const deps = { ...stubRunnerDeps(auditor), pageDelayMs: undefined };
    const signal = new AbortController().signal;
    const scanning = createScanRunner(deps)({
      scanId: STUB_SCAN_ID,
      request: REQUEST,
      signal,
      onProgress: vi.fn(),
    });

    // WHEN
    await vi.advanceTimersByTimeAsync(PAGE_DELAY_MS);

    // THEN
    await scanning;
    expect(auditor.audit).toHaveBeenLastCalledWith({
      url: B,
      isStartPage: false,
    });
  });
});
