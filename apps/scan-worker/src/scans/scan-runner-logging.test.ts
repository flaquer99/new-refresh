import { afterEach, describe, expect, it, vi } from "vitest";
import { LOGGED_START, runLoggedScan } from "../testing/logged-scan.js";
import { stubAuditor } from "../testing/stub-auditor.js";
import { STUB_SCAN_ID } from "../testing/stub-runner-deps.js";

const T0 = new Date("2026-01-01T00:00:00Z");
const SCAN_DURATION_MS = 3500;

const slowAuditor = () => {
  const auditor = stubAuditor({ [LOGGED_START]: {} });
  const answer = auditor.audit.getMockImplementation();
  auditor.audit.mockImplementation((input) => {
    vi.setSystemTime(T0.getTime() + SCAN_DURATION_MS);
    return answer ? answer(input) : Promise.reject(new Error("No stub"));
  });
  return auditor;
};

describe("ScanRunner scan logging", () => {
  afterEach(() => {
    vi.useRealTimers();
  });

  it("logs through a child logger bound to the scan id", async () => {
    // WHEN
    const logger = await runLoggedScan(stubAuditor({ [LOGGED_START]: {} }));

    // THEN
    expect(logger.child).toHaveBeenCalledWith({ scanId: STUB_SCAN_ID });
  });

  it("logs scan.finished with the outcome, pages scanned, and duration", async () => {
    // GIVEN
    vi.useFakeTimers({ now: T0, toFake: ["Date"] });

    // WHEN
    const logger = await runLoggedScan(slowAuditor());

    // THEN
    expect(logger.info).toHaveBeenCalledWith(
      {
        event: "scan.finished",
        outcome: "complete",
        pagesScanned: 1,
        durationMs: SCAN_DURATION_MS,
      },
      "scan.finished",
    );
  });
});
