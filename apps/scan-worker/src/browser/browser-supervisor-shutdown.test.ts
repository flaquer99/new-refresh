import { describe, expect, it, vi } from "vitest";
import { FakeBrowser } from "../testing/fake-browser.js";
import {
  startSupervised,
  useSupervisorClock,
} from "../testing/supervisor-harness.js";
import { RELAUNCH_RETRY_MS } from "./browser-supervisor.js";

describe("superviseBrowser retries and shutdown", () => {
  useSupervisorClock();

  it("retries a failed relaunch after the retry delay", async () => {
    // GIVEN
    const { supervisor, launched, launch } = await startSupervised();
    launch.mockRejectedValueOnce(new Error("chromium missing"));
    launched[0]?.crash();
    await vi.advanceTimersByTimeAsync(0);

    // WHEN
    await vi.advanceTimersByTimeAsync(RELAUNCH_RETRY_MS);

    // THEN
    expect(launch).toHaveBeenCalledTimes(3);
    expect(supervisor.isConnected()).toBe(true);
  });

  it("does not relaunch after close", async () => {
    // GIVEN
    const { supervisor, launch } = await startSupervised();

    // WHEN
    await supervisor.close();
    await vi.advanceTimersByTimeAsync(RELAUNCH_RETRY_MS);

    // THEN
    expect(launch).toHaveBeenCalledTimes(1);
  });

  it("closes the current browser", async () => {
    // GIVEN
    const { supervisor, launched } = await startSupervised();

    // WHEN
    await supervisor.close();

    // THEN
    expect(launched[0]?.close).toHaveBeenCalledTimes(1);
  });

  it("closes a browser whose relaunch finishes after close", async () => {
    // GIVEN
    const { supervisor, launched, launch } = await startSupervised();
    const late = new FakeBrowser();
    let finishLaunch: (browser: FakeBrowser) => void = () => undefined;
    launch.mockImplementationOnce(
      () =>
        new Promise<FakeBrowser>((resolve) => {
          finishLaunch = resolve;
        }),
    );
    launched[0]?.crash();
    await supervisor.close();

    // WHEN
    finishLaunch(late);
    await vi.advanceTimersByTimeAsync(0);

    // THEN
    expect(late.close).toHaveBeenCalledTimes(1);
  });

  it("stops a pending retry when closed", async () => {
    // GIVEN
    const { supervisor, launched, launch } = await startSupervised();
    launch.mockRejectedValueOnce(new Error("chromium missing"));
    launched[0]?.crash();
    await vi.advanceTimersByTimeAsync(0);

    // WHEN
    await supervisor.close();
    await vi.advanceTimersByTimeAsync(RELAUNCH_RETRY_MS);

    // THEN
    expect(launch).toHaveBeenCalledTimes(2);
  });
});
