import { describe, expect, it } from "vitest";
import {
  postScan,
  startTestServer,
  useServerTestClock,
} from "../../testing/server-harness.js";

const HTTP_OK = 200;
const HTTP_SERVICE_UNAVAILABLE = 503;

describe("GET /health", () => {
  useServerTestClock();

  it("reports ok without a bearer token", async () => {
    // GIVEN
    const { app } = startTestServer();

    // WHEN
    const response = await app.inject({ method: "GET", url: "/health" });

    // THEN
    expect(response.statusCode).toBe(HTTP_OK);
    expect(response.json()).toEqual({
      status: "ok",
      activeScans: 0,
      browserConnected: true,
    });
  });

  it("counts the running scans", async () => {
    // GIVEN
    const { app } = startTestServer();
    await postScan(app);

    // WHEN
    const response = await app.inject({ method: "GET", url: "/health" });

    // THEN
    expect(response.json().activeScans).toBe(1);
  });

  it("reports degraded with 503 while Chromium is disconnected", async () => {
    // GIVEN
    const { app } = startTestServer({ browserConnected: false });

    // WHEN
    const response = await app.inject({ method: "GET", url: "/health" });

    // THEN
    expect(response.statusCode).toBe(HTTP_SERVICE_UNAVAILABLE);
    expect(response.json()).toEqual({
      status: "degraded",
      activeScans: 0,
      browserConnected: false,
    });
  });
});
