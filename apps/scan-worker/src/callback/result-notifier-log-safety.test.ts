import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import {
  FAILED_RESULT,
  failingCallbackFetch,
  NOTIFIER_TOKEN,
  newNotifier,
} from "../testing/notifier-harness.js";
import { sampleReport } from "../testing/registry-harness.js";

const REPORT_KEY = '"violations"';

describe("result notifier log safety", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.unstubAllGlobals();
  });

  it("never logs the callback token or the report", async () => {
    // GIVEN
    failingCallbackFetch();
    const { notifier, logger } = newNotifier();
    const completed = {
      ...FAILED_RESULT,
      status: "completed" as const,
      report: sampleReport(),
      error: null,
    };

    // WHEN
    const notifying = notifier.notify(completed);
    await vi.runAllTimersAsync();
    await notifying;
    const logged = JSON.stringify([
      logger.info.mock.calls,
      logger.warn.mock.calls,
      logger.error.mock.calls,
    ]);

    // THEN
    expect([
      logged.includes(NOTIFIER_TOKEN),
      logged.includes(REPORT_KEY),
    ]).toEqual([false, false]);
  });
});
