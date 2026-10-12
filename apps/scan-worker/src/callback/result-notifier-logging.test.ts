import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import {
  FAILED_RESULT,
  failingCallbackFetch,
  NOTIFIER_SCAN_ID,
  newNotifier,
  stubCallbackFetch,
} from "../testing/notifier-harness.js";

const HTTP_UNAUTHORIZED = 401;

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

  it("logs scan.result_undelivered as rejected on an HTTP 401 answer", async () => {
    // GIVEN
    stubCallbackFetch(() =>
      Promise.resolve(new Response("", { status: HTTP_UNAUTHORIZED })),
    );
    const { notifier, logger } = newNotifier();

    // WHEN
    await notifier.notify(FAILED_RESULT);

    // THEN
    expect(logger.error).toHaveBeenCalledWith(
      {
        event: "scan.result_undelivered",
        scanId: NOTIFIER_SCAN_ID,
        outcome: "rejected",
      },
      "scan.result_undelivered",
    );
  });

  it("logs each retry with the failure", async () => {
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
