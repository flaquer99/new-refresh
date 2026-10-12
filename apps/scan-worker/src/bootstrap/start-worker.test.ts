import { afterEach, describe, expect, it } from "vitest";
import type { FakeBrowser } from "../testing/fake-browser.js";
import { scanIdFor } from "../testing/scan-ids.js";
import { BOOT_TOKEN, bootWorker } from "../testing/worker-harness.js";
import type { RunningWorker } from "./start-worker.js";

const HTTP_UNPROCESSABLE = 422;

describe("startWorker", () => {
  let running: RunningWorker | undefined;

  afterEach(async () => {
    await running?.stop();
    running = undefined;
  });

  it("serves the health check on the configured host", async () => {
    // GIVEN
    const { worker } = await bootWorker();
    running = worker;

    // WHEN
    const response = await fetch(`${worker.address}/health`);

    // THEN
    expect(await response.json()).toEqual({
      status: "ok",
      activeScans: 0,
      browserConnected: true,
    });
  });

  it("reports degraded health while the browser is disconnected", async () => {
    // GIVEN
    const { worker, launched, launch } = await bootWorker();
    running = worker;
    launch.mockImplementationOnce(
      () => new Promise<FakeBrowser>(() => undefined),
    );
    launched[0]?.crash();

    // WHEN
    const response = await worker.app.inject({ method: "GET", url: "/health" });

    // THEN
    expect(response.json().status).toBe("degraded");
  });

  it("refuses a private target with the configured token and target policy", async () => {
    // GIVEN
    const { worker } = await bootWorker();
    running = worker;

    // WHEN
    const response = await worker.app.inject({
      method: "POST",
      url: "/scans",
      headers: { authorization: `Bearer ${BOOT_TOKEN}` },
      payload: {
        scanId: scanIdFor(1),
        url: "http://127.0.0.1:4100/",
        depth: 0,
      },
    });

    // THEN
    expect(response.statusCode).toBe(HTTP_UNPROCESSABLE);
  });
});
