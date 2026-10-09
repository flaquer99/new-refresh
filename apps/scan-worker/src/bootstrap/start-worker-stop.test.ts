import { describe, expect, it } from "vitest";
import { bootWorker } from "../testing/worker-harness.js";

describe("startWorker shutdown", () => {
  it("closes the browser and the egress guard on stop", async () => {
    // GIVEN
    const { worker, guard, launched } = await bootWorker();

    // WHEN
    await worker.stop();

    // THEN
    expect(launched[0]?.close).toHaveBeenCalledTimes(1);
    expect(guard.close).toHaveBeenCalledTimes(1);
  });

  it("stops accepting connections on stop", async () => {
    // GIVEN
    const { worker } = await bootWorker();

    // WHEN
    await worker.stop();

    // THEN
    await expect(fetch(`${worker.address}/health`)).rejects.toThrowError(
      "fetch failed",
    );
  });
});
