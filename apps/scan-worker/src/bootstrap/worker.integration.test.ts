import { afterEach, describe, expect, it, vi } from "vitest";
import {
  bootIntegrationWorker,
  type IntegrationWorker,
} from "../testing/integration-boot.js";
import {
  CALLBACK_TOKEN,
  callbacksFor,
  postWorkerScan,
} from "../testing/integration-worker.js";
import { scanIdFor } from "../testing/scan-ids.js";

const SCAN_TIMEOUT_MS = 25_000;
const POLL_INTERVAL_MS = 200;

describe("worker with a real browser", () => {
  let booted: IntegrationWorker | undefined;

  afterEach(async () => {
    await booted?.close();
    booted = undefined;
  });

  it("calls web back once with the completed result of a fixture scan", async () => {
    // GIVEN
    booted = await bootIntegrationWorker();
    const { worker, fixtures, callbacks } = booted;
    const scanId = scanIdFor(1);
    await postWorkerScan(worker, { scanId, url: `${fixtures.origin}/clean/` });

    // WHEN
    await vi.waitFor(
      () => expect(callbacksFor(callbacks, scanId)).toHaveLength(1),
      { timeout: SCAN_TIMEOUT_MS, interval: POLL_INTERVAL_MS },
    );
    await booted.stop();

    // THEN
    expect(callbacksFor(callbacks, scanId)).toMatchObject([
      {
        path: `/api/internal/scans/${scanId}/result`,
        authorization: `Bearer ${CALLBACK_TOKEN}`,
        result: {
          status: "completed",
          report: { pages: [{ status: "scanned" }] },
        },
      },
    ]);
  });

  it("calls web back with the scan interrupted before it stops", async () => {
    // GIVEN
    booted = await bootIntegrationWorker();
    const { worker, fixtures, callbacks } = booted;
    const scanId = scanIdFor(2);
    await postWorkerScan(worker, {
      scanId,
      url: `${fixtures.origin}/large/`,
      depth: 3,
    });

    // WHEN
    await booted.stop();

    // THEN
    expect(
      callbacksFor(callbacks, scanId).map(({ result }) => result.error?.code),
    ).toEqual(["SCAN_INTERRUPTED"]);
  });
});
