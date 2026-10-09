import { request } from "node:http";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { type FixtureServer, serveFixtures } from "./serve-fixtures.js";

const EPHEMERAL_PORT = 0;

const rawGetStatus = (origin: string, path: string): Promise<number> =>
  new Promise((resolve, reject) => {
    const { hostname, port } = new URL(origin);
    const req = request({ hostname, port, path }, (res) => {
      res.resume();
      resolve(res.statusCode ?? 0);
    });
    req.on("error", reject);
    req.end();
  });

describe("serveFixtures with unsafe paths", () => {
  let fixtures: FixtureServer;

  beforeEach(async () => {
    fixtures = await serveFixtures({ port: EPHEMERAL_PORT });
  });

  afterEach(async () => {
    await fixtures.close();
  });

  it("refuses to serve files outside the sites folder", async () => {
    // WHEN
    const status = await rawGetStatus(fixtures.origin, "/..%2fpackage.json");

    // THEN
    expect(status).toBe(404);
  });

  it("returns 404 for a malformed percent-encoded path", async () => {
    // WHEN
    const status = await rawGetStatus(fixtures.origin, "/clean/%E0%A4%A");

    // THEN
    expect(status).toBe(404);
  });

  it("returns 404 for a request target that is not a valid URL", async () => {
    // WHEN
    const status = await rawGetStatus(fixtures.origin, "http://[");

    // THEN
    expect(status).toBe(404);
  });
});
