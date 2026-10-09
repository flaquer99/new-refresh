import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import {
  FAILED_RESULT,
  failingCallbackFetch,
  NOTIFIER_SCAN_ID,
  newNotifier,
} from "../testing/notifier-harness.js";

describe("result notifier logging", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.unstubAllGlobals();
  });

  it("logs scan.result_undelivered when every attempt failed", async () => {
    // GIVEN
    failingCallbackFetch();
    const { notifier, logger } = newNotifier();

    // WHEN
    const notifying = notifier.notify(FAILED_RESULT);
    await vi.runAllTimersAsync();
    await notifying;

    // THEN
    expect(logger.error).toHaveBeenCalledWith(
      {
        event: "scan.result_undelivered",
        scanId: NOTIFIER_SCAN_ID,
        outcome: "exhausted",
      },
      "scan.result_undelivered",
    );
  });

  it("logs each retry with the failure, never the token or report", async () => {
    // GIVEN
    failingCallbackFetch();
    const { notifier, logger } = newNotifier();

    // WHEN
    const notifying = notifier.notify(FAILED_RESULT);
    await vi.runAllTimersAsync();
    await notifying;

    // THEN
    expect(logger.warn).toHaveBeenCalledWith(
      {
        event: "scan.result_retry",
        scanId: NOTIFIER_SCAN_ID,
        attempt: 1,
        errorName: "TypeError",
      },
      "scan.result_retry",
    );
  });
});
