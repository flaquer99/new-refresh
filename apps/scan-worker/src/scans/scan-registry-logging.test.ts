import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import {
  REGISTRY_SCAN_ID,
  startLoggedRegistryScan as startLoggedScan,
} from "../testing/registry-harness.js";
import { ScanFailedError } from "./scan-failed-error.js";

describe("ScanRegistry failure logging", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.restoreAllMocks();
  });

  it("logs the details of an unexpected runner error as scan.failed", async () => {
    // GIVEN
    const { logger, scan } = startLoggedScan();
    const crash = new Error("Target page, context or browser has been closed");

    // WHEN
    scan.fail(crash);
    await vi.advanceTimersByTimeAsync(0);

    // THEN
    expect(logger.error).toHaveBeenCalledWith(
      {
        event: "scan.failed",
        scanId: REGISTRY_SCAN_ID,
        code: "INTERNAL_ERROR",
        err: expect.objectContaining({ message: crash.message }),
      },
      "scan.failed",
    );
  });

  it("strips query strings from URLs in the logged error", async () => {
    // GIVEN
    const { logger, scan } = startLoggedScan();
    const crash = new Error(
      'page.goto: net::ERR_ABORTED at https://a.test/login?token=s3cret#x\nCall log:\n  - navigating to "https://a.test/login?token=s3cret"',
    );

    // WHEN
    scan.fail(crash);
    await vi.advanceTimersByTimeAsync(0);

    // THEN
    const [[details]] = logger.error.mock.calls;
    expect(details.err).toMatchObject({
      message:
        'page.goto: net::ERR_ABORTED at https://a.test/login\nCall log:\n  - navigating to "https://a.test/login"',
    });
  });

  it("strips query strings from URLs in the logged stack trace", async () => {
    // GIVEN
    const { logger, scan } = startLoggedScan();
    const crash = new Error("failed at https://a.test/p?session=abc");

    // WHEN
    scan.fail(crash);
    await vi.advanceTimersByTimeAsync(0);

    // THEN
    const [[details]] = logger.error.mock.calls;
    expect(details.err.stack.split("\n")[0]).toBe(
      "Error: failed at https://a.test/p",
    );
  });

  it("logs the scan error code when the start page is unreachable", async () => {
    // GIVEN
    const { logger, scan } = startLoggedScan();

    // WHEN
    scan.fail(new ScanFailedError("SITE_UNREACHABLE", "We couldn't reach it."));
    await vi.advanceTimersByTimeAsync(0);

    // THEN
    expect(logger.error).toHaveBeenCalledWith(
      expect.objectContaining({ code: "SITE_UNREACHABLE" }),
      "scan.failed",
    );
  });
});
