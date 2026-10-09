import { describe, expect, it, vi } from "vitest";
import type { FakeBrowser } from "../testing/fake-browser.js";
import {
  startSupervised,
  useSupervisorClock,
} from "../testing/supervisor-harness.js";

describe("superviseBrowser", () => {
  useSupervisorClock();

  it("launches one browser and reports it connected", async () => {
    // WHEN
    const { supervisor, launched } = await startSupervised();

    // THEN
    expect(supervisor.current()).toBe(launched[0]);
    expect(supervisor.isConnected()).toBe(true);
  });

  it("relaunches the browser after it disconnects", async () => {
    // GIVEN
    const { supervisor, launched } = await startSupervised();

    // WHEN
    launched[0]?.crash();
    await vi.advanceTimersByTimeAsync(0);

    // THEN
    expect(launched).toHaveLength(2);
    expect(supervisor.current()).toBe(launched[1]);
  });

  it("reports disconnected until the relaunch completes", async () => {
    // GIVEN
    const { supervisor, launched, launch } = await startSupervised();
    launch.mockImplementationOnce(() => new Promise<FakeBrowser>(() => {}));

    // WHEN
    launched[0]?.crash();

    // THEN
    expect(supervisor.isConnected()).toBe(false);
  });

  it("logs the disconnect and the relaunch", async () => {
    // GIVEN
    const { launched, logger } = await startSupervised();

    // WHEN
    launched[0]?.crash();
    await vi.advanceTimersByTimeAsync(0);

    // THEN
    expect(logger.error).toHaveBeenCalledWith(
      { event: "browser.disconnected" },
      "browser.disconnected",
    );
    expect(logger.info).toHaveBeenCalledWith(
      { event: "browser.relaunched" },
      "browser.relaunched",
    );
  });
});
