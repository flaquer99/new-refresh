import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import {
  newNotifier,
  slowFailingCallbackFetch,
} from "../testing/notifier-harness.js";
import { sampleReport } from "../testing/registry-harness.js";
import {
  pendingNotifier,
  shutdownServices,
  startShutdownScan,
} from "../testing/shutdown-harness.js";
import { INTERRUPT_BUDGET_MS, stopServices } from "./stop-services.js";

const ATTEMPT_FAILS_AFTER_MS = 4000;
const LONG_AFTER_DEADLINE_MS = 60_000;

describe("stopServices", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.unstubAllGlobals();
  });

  it("closes the browser at the interrupt deadline when deliveries never settle", async () => {
    // GIVEN
    const { notifier } = pendingNotifier();
    const { services, registry, browser } = shutdownServices(() => notifier);
    startShutdownScan(registry);
    const stopping = stopServices(services);

    // WHEN
    await vi.advanceTimersByTimeAsync(INTERRUPT_BUDGET_MS - 1);
    const closedBeforeDeadline = browser.close.mock.calls.length;
    await vi.advanceTimersByTimeAsync(1);
    await stopping;

    // THEN
    expect([closedBeforeDeadline, browser.close.mock.calls.length]).toEqual([
      0, 1,
    ]);
  });

  it("attempts no callback after the interrupt deadline", async () => {
    // GIVEN
    const fetchMock = slowFailingCallbackFetch(ATTEMPT_FAILS_AFTER_MS);
    const { services, registry } = shutdownServices(
      (signal) => newNotifier({ signal }).notifier,
    );
    startShutdownScan(registry);
    const stopping = stopServices(services);
    await vi.advanceTimersByTimeAsync(INTERRUPT_BUDGET_MS);
    await stopping;
    const attemptsAtDeadline = fetchMock.mock.calls.length;

    // WHEN
    await vi.advanceTimersByTimeAsync(LONG_AFTER_DEADLINE_MS);

    // THEN
    expect(fetchMock.mock.calls.length).toBe(attemptsAtDeadline);
  });

  it("waits for the delivery of a scan that finished before shutdown", async () => {
    // GIVEN
    const { notifier, settle } = pendingNotifier();
    const { services, registry, controlled, browser } = shutdownServices(
      () => notifier,
    );
    startShutdownScan(registry);
    controlled.latest().finish(sampleReport());
    await vi.advanceTimersByTimeAsync(0);

    // WHEN
    const stopping = stopServices(services);
    await vi.advanceTimersByTimeAsync(0);
    const closedWhileDelivering = browser.close.mock.calls.length;
    settle();
    await stopping;

    // THEN
    expect([closedWhileDelivering, browser.close.mock.calls.length]).toEqual([
      0, 1,
    ]);
  });
});
