import { afterEach, beforeEach, describe, expect, it } from "vitest";
import {
  type GuardHarness,
  startGuardHarness,
} from "../testing/guard-harness.js";
import { proxyGet } from "../testing/proxy-client.js";

const HTTP_FORBIDDEN = 403;
const HTTP_BAD_GATEWAY = 502;
const HTTP_BAD_REQUEST = 400;
const HTTP_OK = 200;
const GUARD_URL = /^http:\/\/127\.0\.0\.1:\d+$/;

describe("EgressGuard HTTP forwarding", () => {
  let harness: GuardHarness;

  beforeEach(async () => {
    harness = await startGuardHarness();
  });

  afterEach(async () => {
    await harness.close();
  });

  const get = (target: string) =>
    proxyGet({ proxyUrl: harness.guard.url, target });

  it("listens on an ephemeral loopback port", () => {
    // THEN
    expect(harness.guard.url).toMatch(GUARD_URL);
  });

  it("forwards a request to an allowlisted fixture", async () => {
    // WHEN
    const response = await get(`${harness.fixtures.origin}/clean/`);

    // THEN
    expect(response.status).toBe(HTTP_OK);
    expect(response.body).toContain("<h1");
  });

  it("refuses a loopback target that is not allowlisted", async () => {
    // WHEN
    const response = await get(`${harness.fixtures.crossOrigin}/clean/`);

    // THEN
    expect(response.status).toBe(HTTP_FORBIDDEN);
    expect(response.headers["x-refresh-egress"]).toBe("blocked-address");
  });

  it("logs the blocked host without the resolved address", async () => {
    // WHEN
    await get("http://localhost:9/");

    // THEN
    expect(harness.logger.warn).toHaveBeenCalledWith(
      { event: "egress.blocked", host: "localhost", reason: "blocked-address" },
      "egress.blocked",
    );
  });

  it("refuses a target that does not resolve", async () => {
    // WHEN
    const response = await get("http://unresolvable.invalid/");

    // THEN
    expect(response.status).toBe(HTTP_BAD_GATEWAY);
    expect(response.headers["x-refresh-egress"]).toBe("unresolved");
  });

  it("rejects a request that is not in absolute form", async () => {
    // WHEN
    const response = await get("/clean/");

    // THEN
    expect(response.status).toBe(HTTP_BAD_REQUEST);
  });
});
