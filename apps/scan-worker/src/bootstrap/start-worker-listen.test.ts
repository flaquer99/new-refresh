import { afterEach, describe, expect, it } from "vitest";
import {
  bootWorker,
  fakeRuntime,
  startFakeWorker,
} from "../testing/worker-harness.js";
import type { RunningWorker } from "./start-worker.js";

const portOf = (address: string): number => Number(new URL(address).port);

describe("startWorker when the port is taken", () => {
  let occupant: RunningWorker | undefined;

  afterEach(async () => {
    await occupant?.stop();
    occupant = undefined;
  });

  it("rejects with the listen error", async () => {
    // GIVEN
    const { worker } = await bootWorker();
    occupant = worker;
    const { runtime } = fakeRuntime();

    // WHEN
    const starting = startFakeWorker(runtime, portOf(worker.address));

    // THEN
    await expect(starting).rejects.toMatchObject({ code: "EADDRINUSE" });
  });

  it("closes the browser and the egress guard it already started", async () => {
    // GIVEN
    const { worker } = await bootWorker();
    occupant = worker;
    const { runtime, guard, launched } = fakeRuntime();

    // WHEN
    await startFakeWorker(runtime, portOf(worker.address)).catch(
      () => undefined,
    );

    // THEN
    expect(launched[0]?.close).toHaveBeenCalledTimes(1);
    expect(guard.close).toHaveBeenCalledTimes(1);
  });
});
