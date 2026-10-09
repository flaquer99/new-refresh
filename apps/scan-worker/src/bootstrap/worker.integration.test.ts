import {
  type FixtureServer,
  serveFixtures,
} from "@refresh/a11y-fixtures/serve-fixtures";
import type { ScanStatus } from "@refresh/scan-contracts/scan-status";
import { afterAll, beforeAll, describe, expect, it, vi } from "vitest";
import { createRecordingFastifyLogger } from "../testing/fastify-logger.js";
import { type RunningWorker, startWorker } from "./start-worker.js";

const EPHEMERAL_PORT = 0;
const TOKEN = "i".repeat(32);
const AUTH = { authorization: `Bearer ${TOKEN}`, "x-client-id": "it" };
const SCAN_TIMEOUT_MS = 25_000;
const POLL_INTERVAL_MS = 200;

const pollUntilTerminal = (worker: RunningWorker, scanId: string) =>
  vi.waitFor(
    async () => {
      const response = await worker.app.inject({
        method: "GET",
        url: `/scans/${scanId}`,
        headers: AUTH,
      });
      const status: ScanStatus = response.json();
      expect(status.status).not.toBe("running");
      return status;
    },
    { timeout: SCAN_TIMEOUT_MS, interval: POLL_INTERVAL_MS },
  );

describe("worker with a real browser", () => {
  let fixtures: FixtureServer;
  let worker: RunningWorker;

  beforeAll(async () => {
    fixtures = await serveFixtures({ port: EPHEMERAL_PORT });
    worker = await startWorker({
      config: {
        host: "127.0.0.1",
        port: EPHEMERAL_PORT,
        token: TOKEN,
        egressAllowlist: new Set([new URL(fixtures.origin).host]),
        logLevel: "info",
      },
      loggerInstance: createRecordingFastifyLogger(),
    });
  });

  afterAll(async () => {
    await worker.stop();
    await fixtures.close();
  });

  it("scans an allowlisted fixture page to a completed report", async () => {
    // GIVEN
    const created = await worker.app.inject({
      method: "POST",
      url: "/scans",
      headers: AUTH,
      payload: { url: `${fixtures.origin}/clean/`, depth: 0 },
    });

    // WHEN
    const status = await pollUntilTerminal(worker, created.json().scanId);

    // THEN
    expect(status).toMatchObject({
      status: "completed",
      report: { pages: [{ status: "scanned" }] },
    });
  });
});
