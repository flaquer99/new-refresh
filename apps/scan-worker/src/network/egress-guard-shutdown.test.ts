import { afterEach, beforeEach, describe, expect, it } from "vitest";
import {
  type GuardHarness,
  startGuardHarness,
} from "../testing/guard-harness.js";
import { proxyConnect } from "../testing/proxy-client.js";

describe("EgressGuard shutdown", () => {
  let harness: GuardHarness;

  beforeEach(async () => {
    harness = await startGuardHarness();
  });

  afterEach(async () => {
    await harness.close();
  });

  it("closes open tunnels when the guard shuts down", async () => {
    // GIVEN
    const { socket } = await proxyConnect({
      proxyUrl: harness.guard.url,
      authority: harness.fixtureAuthority,
    });
    const closed = new Promise<boolean>((resolve) =>
      socket.on("close", () => resolve(true)),
    );

    // WHEN
    await harness.guard.close();

    // THEN
    await expect(closed).resolves.toBe(true);
  });

  it("resolves when closed more than once", async () => {
    // GIVEN
    await harness.guard.close();

    // WHEN
    const closing = harness.guard.close();

    // THEN
    await expect(closing).resolves.toBeUndefined();
  });
});
