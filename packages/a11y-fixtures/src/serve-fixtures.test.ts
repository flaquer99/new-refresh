import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { type FixtureServer, serveFixtures } from "./serve-fixtures.js";

const EPHEMERAL_PORT = 0;
const LOOPBACK_ORIGIN = /^http:\/\/127\.0\.0\.1:\d+$/;

describe("serveFixtures", () => {
  let fixtures: FixtureServer;

  beforeEach(async () => {
    fixtures = await serveFixtures({ port: EPHEMERAL_PORT });
  });

  afterEach(async () => {
    await fixtures.close();
  });

  it("serves the clean page as html", async () => {
    // WHEN
    const response = await fetch(`${fixtures.origin}/clean/`);

    // THEN
    expect(response.headers.get("content-type")).toBe(
      "text/html; charset=utf-8",
    );
  });

  it("binds two distinct origins to the loopback address", () => {
    // WHEN
    const origins = new Set([fixtures.origin, fixtures.crossOrigin]);

    // THEN
    expect([...origins]).toEqual([
      expect.stringMatching(LOOPBACK_ORIGIN),
      expect.stringMatching(LOOPBACK_ORIGIN),
    ]);
  });

  it("returns 404 for an unknown route", async () => {
    // WHEN
    const response = await fetch(`${fixtures.origin}/missing`);

    // THEN
    expect(response.status).toBe(404);
  });

  it("links the cross-origin page to the second origin", async () => {
    // WHEN
    const html = await (await fetch(`${fixtures.origin}/cross-origin/`)).text();

    // THEN
    expect(html).toContain(`href="${fixtures.crossOrigin}/clean/"`);
  });

  it("serves the cross-origin server with the same sites", async () => {
    // WHEN
    const response = await fetch(`${fixtures.crossOrigin}/clean/`);

    // THEN
    expect(response.status).toBe(200);
  });

  it("stops accepting connections after close", async () => {
    // GIVEN
    const server = await serveFixtures({ port: EPHEMERAL_PORT });

    // WHEN
    await server.close();

    // THEN
    await expect(fetch(`${server.origin}/clean/`)).rejects.toThrowError(
      "fetch failed",
    );
  });
});
