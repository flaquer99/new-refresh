import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { type FixtureServer, serveFixtures } from "./serve-fixtures.js";

const EPHEMERAL_PORT = 0;
const LARGE_SITE_PAGE_COUNT = 60;
const PAGE_LINK = /href="\/large\/page-\d+\.html"/g;

describe("large fixture site", () => {
  let fixtures: FixtureServer;

  beforeEach(async () => {
    fixtures = await serveFixtures({ port: EPHEMERAL_PORT });
  });

  afterEach(async () => {
    await fixtures.close();
  });

  it("links the large site index to every other page of the site", async () => {
    // WHEN
    const html = await (await fetch(`${fixtures.origin}/large/`)).text();

    // THEN
    expect(new Set(html.match(PAGE_LINK)).size).toBe(LARGE_SITE_PAGE_COUNT - 1);
  });

  it("serves the last page of the large site", async () => {
    // WHEN
    const response = await fetch(
      `${fixtures.origin}/large/page-${LARGE_SITE_PAGE_COUNT - 1}.html`,
    );

    // THEN
    expect(response.status).toBe(200);
  });

  it("returns 404 past the last page of the large site", async () => {
    // WHEN
    const response = await fetch(
      `${fixtures.origin}/large/page-${LARGE_SITE_PAGE_COUNT}.html`,
    );

    // THEN
    expect(response.status).toBe(404);
  });
});
