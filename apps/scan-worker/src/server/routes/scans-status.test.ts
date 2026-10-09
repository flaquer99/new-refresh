import { describe, expect, it, vi } from "vitest";
import { sampleReport } from "../../testing/registry-harness.js";
import {
  postScan,
  SERVER_SCAN_ID,
  scanRequest,
  startTestServer,
  useServerTestClock,
} from "../../testing/server-harness.js";

const HTTP_OK = 200;
const HTTP_NOT_FOUND = 404;

describe("GET /scans/:id", () => {
  useServerTestClock();

  it("returns the running status with the latest progress", async () => {
    // GIVEN
    const { app, controlled } = startTestServer();
    await postScan(app);
    const progress = {
      pagesScanned: 2,
      pagesDiscovered: 5,
      currentUrl: "https://www.example.org/about",
    };
    controlled.latest().input.onProgress(progress);

    // WHEN
    const response = await scanRequest(app, "GET");

    // THEN
    expect(response.statusCode).toBe(HTTP_OK);
    expect(response.json()).toEqual({
      scanId: SERVER_SCAN_ID,
      status: "running",
      progress,
      report: null,
      error: null,
    });
  });

  it("reports increasing pages scanned between polls", async () => {
    // GIVEN
    const { app, controlled } = startTestServer();
    await postScan(app);
    const { onProgress } = controlled.latest().input;
    onProgress({ pagesScanned: 1, pagesDiscovered: 4, currentUrl: null });
    const first = await scanRequest(app, "GET");

    // WHEN
    onProgress({ pagesScanned: 3, pagesDiscovered: 4, currentUrl: null });
    const second = await scanRequest(app, "GET");

    // THEN
    expect([first, second].map((r) => r.json().progress.pagesScanned)).toEqual([
      1, 3,
    ]);
  });

  it("returns the completed status with the report once the scan finishes", async () => {
    // GIVEN
    const { app, controlled } = startTestServer();
    await postScan(app);
    const report = sampleReport();
    controlled.latest().finish(report);
    await vi.advanceTimersByTimeAsync(0);

    // WHEN
    const response = await scanRequest(app, "GET");

    // THEN
    expect(response.json()).toMatchObject({ status: "completed", report });
  });

  it("answers 404 SCAN_NOT_FOUND for an unknown id", async () => {
    // GIVEN
    const { app } = startTestServer();

    // WHEN
    const response = await scanRequest(app, "GET", "missing");

    // THEN
    expect(response.statusCode).toBe(HTTP_NOT_FOUND);
    expect(response.json()).toEqual({
      error: {
        code: "SCAN_NOT_FOUND",
        message: "This scan no longer exists. Start a new scan.",
      },
    });
  });
});
