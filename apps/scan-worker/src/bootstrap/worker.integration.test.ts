import {
  type FixtureServer,
  serveFixtures,
} from "@refresh/a11y-fixtures/serve-fixtures";
import { afterAll, beforeAll, describe, expect, it, vi } from "vitest";
import {
  type CallbackServer,
  startCallbackServer,
} from "../testing/callback-server.js";
import { createRecordingFastifyLogger } from "../testing/fastify-logger.js";
import {
  CALLBACK_TOKEN,
  callbacksFor,
  postWorkerScan,
  workerConfig,
} from "../testing/integration-worker.js";
import { scanIdFor } from "../testing/scan-ids.js";
import { type RunningWorker, startWorker } from "./start-worker.js";

const SCAN_TIMEOUT_MS = 25_000;
const POLL_INTERVAL_MS = 200;

describe("worker with a real browser", () => {
  let fixtures: FixtureServer;
  let callbacks: CallbackServer;
  let worker: RunningWorker;

  beforeAll(async () => {
    fixtures = await serveFixtures({ port: 0 });
    callbacks = await startCallbackServer();
    worker = await startWorker({
      config: workerConfig(fixtures.origin, callbacks.url),
      loggerInstance: createRecordingFastifyLogger(),
    });
  });

  afterAll(async () => {
    await worker.stop();
    await callbacks.close();
    await fixtures.close();
  });

  it("calls web back with the completed result of a fixture scan", async () => {
    // GIVEN
    const scanId = scanIdFor(1);
    await postWorkerScan(worker, { scanId, url: `${fixtures.origin}/clean/` });

    // WHEN
    const [received] = await vi.waitFor(
      () => {
        const delivered = callbacksFor(callbacks, scanId);
        expect(delivered).toHaveLength(1);
        return delivered;
      },
      { timeout: SCAN_TIMEOUT_MS, interval: POLL_INTERVAL_MS },
    );

    // THEN
    expect(received).toMatchObject({
      path: `/api/internal/scans/${scanId}/result`,
      authorization: `Bearer ${CALLBACK_TOKEN}`,
      result: {
        status: "completed",
        report: { pages: [{ status: "scanned" }] },
      },
    });
  });
});

describe("worker shutdown with a running scan", () => {
  it("calls web back with the scan interrupted before it stops", async () => {
    // GIVEN
    const fixtures = await serveFixtures({ port: 0 });
    const callbacks = await startCallbackServer();
    const worker = await startWorker({
      config: workerConfig(fixtures.origin, callbacks.url),
      loggerInstance: createRecordingFastifyLogger(),
    });
    const scanId = scanIdFor(2);
    await postWorkerScan(worker, {
      scanId,
      url: `${fixtures.origin}/large/`,
      depth: 3,
    });

    // WHEN
    await worker.stop();

    // THEN
    expect(
      callbacksFor(callbacks, scanId).map(({ result }) => result.error?.code),
    ).toEqual(["SCAN_INTERRUPTED"]);
    await callbacks.close();
    await fixtures.close();
  });
});
