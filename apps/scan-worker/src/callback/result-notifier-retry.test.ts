import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import {
  FAILED_RESULT,
  failingCallbackFetch,
  newNotifier,
  stubCallbackFetch,
} from "../testing/notifier-harness.js";

const HTTP_SERVICE_UNAVAILABLE = 503;

describe("result notifier retries", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.unstubAllGlobals();
  });

  it("retries a 5xx answer after 1, 2 and 4 seconds", async () => {
    // GIVEN
    const fetchMock = stubCallbackFetch(() =>
      Promise.resolve(new Response("", { status: HTTP_SERVICE_UNAVAILABLE })),
    );
    const { notifier } = newNotifier();
    const notifying = notifier.notify(FAILED_RESULT);
    const callsAt: number[] = [];

    // WHEN
    for (const step of [0, 1000, 2000, 4000]) {
      await vi.advanceTimersByTimeAsync(step);
      callsAt.push(fetchMock.mock.calls.length);
    }
    await notifying;

    // THEN
    expect(callsAt).toEqual([1, 2, 3, 4]);
  });

  it("reports exhausted after four failed attempts", async () => {
    // GIVEN
    failingCallbackFetch();
    const { notifier } = newNotifier();

    // WHEN
    const notifying = notifier.notify(FAILED_RESULT);
    await vi.runAllTimersAsync();

    // THEN
    await expect(notifying).resolves.toBe("exhausted");
  });

  it.each([400, 401])("does not retry an HTTP %d answer", async (status) => {
    // GIVEN
    const fetchMock = stubCallbackFetch(() =>
      Promise.resolve(new Response("", { status })),
    );
    const { notifier } = newNotifier();

    // WHEN
    const outcome = await notifier.notify(FAILED_RESULT);

    // THEN
    expect([outcome, fetchMock.mock.calls.length]).toEqual(["rejected", 1]);
  });
});
