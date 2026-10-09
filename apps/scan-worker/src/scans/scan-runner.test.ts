import type { ScanRequest } from "@refresh/scan-contracts/scan-request";
import { afterEach, describe, expect, it, vi } from "vitest";
import { type StubSite, stubAuditor } from "../testing/stub-auditor.js";
import { STUB_SCAN_ID, stubRunnerDeps } from "../testing/stub-runner-deps.js";
import { createScanRunner } from "./scan-runner.js";

const A = "https://a.test/";
const B = "https://a.test/b";
const C = "https://a.test/c";

const run = (request: ScanRequest, site: StubSite) =>
  createScanRunner(stubRunnerDeps(stubAuditor(site)))({
    scanId: STUB_SCAN_ID,
    request,
    signal: new AbortController().signal,
    onProgress: vi.fn(),
  });

describe("ScanRunner crawl", () => {
  afterEach(() => {
    vi.useRealTimers();
  });

  it("audits the start page and its links within the depth", async () => {
    // GIVEN
    const site = { [A]: { links: [B, C] }, [B]: {}, [C]: {} };

    // WHEN
    const report = await run({ url: A, depth: 1 }, site);

    // THEN
    expect(report.pages).toEqual([
      { url: A, depth: 0, status: "scanned", reason: null, httpStatus: null },
      { url: B, depth: 1, status: "scanned", reason: null, httpStatus: null },
      { url: C, depth: 1, status: "scanned", reason: null, httpStatus: null },
    ]);
  });

  it("stamps the report with the start and finish times", async () => {
    // GIVEN
    vi.useFakeTimers({ now: new Date("2026-10-09T10:00:00.000Z") });

    // WHEN
    const report = await run({ url: A, depth: 0 }, { [A]: {} });

    // THEN
    expect([report.startedAt, report.finishedAt]).toEqual([
      "2026-10-09T10:00:00.000Z",
      "2026-10-09T10:00:00.000Z",
    ]);
  });
});
