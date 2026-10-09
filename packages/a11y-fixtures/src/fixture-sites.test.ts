import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { type FixtureServer, serveFixtures } from "./serve-fixtures.js";

const EPHEMERAL_PORT = 0;

describe("fixture sites", () => {
  let fixtures: FixtureServer;

  beforeEach(async () => {
    fixtures = await serveFixtures({ port: EPHEMERAL_PORT });
  });

  afterEach(async () => {
    await fixtures.close();
  });

  it.each([
    "/missing-alt/",
    "/low-contrast/",
    "/aaa-contrast/",
    "/small-targets/",
    "/late-injection/",
    "/media-form/",
    "/crawl/",
    "/crawl/b.html",
    "/crawl/c.html",
    "/crawl/d.html",
    "/fragments/",
    "/fragments/p.html",
    "/page-coverage/",
    "/page-coverage/about.html",
    "/private/secret.html",
    "/report-mix/",
    "/popups/",
    "/popups/opener.html",
  ])("serves the %s scenario page", async (path) => {
    // WHEN
    const response = await fetch(`${fixtures.origin}${path}`);

    // THEN
    expect(response.status).toBe(200);
  });

  it("disallows the private section in robots.txt", async () => {
    // WHEN
    const robots = await (await fetch(`${fixtures.origin}/robots.txt`)).text();

    // THEN
    expect(robots).toContain("Disallow: /private");
  });

  it("serves the brochure as a pdf", async () => {
    // WHEN
    const response = await fetch(
      `${fixtures.origin}/page-coverage/brochure.pdf`,
    );

    // THEN
    expect(response.headers.get("content-type")).toBe("application/pdf");
  });

  it("links the coverage page to a route that returns 404", async () => {
    // GIVEN
    const html = await (
      await fetch(`${fixtures.origin}/page-coverage/`)
    ).text();
    const missingHref = html.match(
      /href="(\/page-coverage\/missing\.html)"/,
    )?.[1];

    // WHEN
    const response = await fetch(`${fixtures.origin}${missingHref}`);

    // THEN
    expect(response.status).toBe(404);
  });
});
