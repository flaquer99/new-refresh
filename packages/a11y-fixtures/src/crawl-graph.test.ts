import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { type FixtureServer, serveFixtures } from "./serve-fixtures.js";

const EPHEMERAL_PORT = 0;
const ANCHOR_HREF = /<a href="([^"]+)"/g;

const hrefsOf = async (origin: string, path: string): Promise<string[]> => {
  const html = await (await fetch(`${origin}${path}`)).text();
  return [...html.matchAll(ANCHOR_HREF)].map(([, href]) => href ?? "");
};

describe("crawl fixture link structure", () => {
  let fixtures: FixtureServer;

  beforeEach(async () => {
    fixtures = await serveFixtures({ port: EPHEMERAL_PORT });
  });

  afterEach(async () => {
    await fixtures.close();
  });

  it("links page A to pages B and C only", async () => {
    // WHEN
    const hrefs = await hrefsOf(fixtures.origin, "/crawl/");

    // THEN
    expect(hrefs).toEqual(["/crawl/b.html", "/crawl/c.html"]);
  });

  it("links page B to page D only", async () => {
    // WHEN
    const hrefs = await hrefsOf(fixtures.origin, "/crawl/b.html");

    // THEN
    expect(hrefs).toEqual(["/crawl/d.html"]);
  });

  it("links pages C and D to nothing", async () => {
    // WHEN
    const hrefs = [
      ...(await hrefsOf(fixtures.origin, "/crawl/c.html")),
      ...(await hrefsOf(fixtures.origin, "/crawl/d.html")),
    ];

    // THEN
    expect(hrefs).toEqual([]);
  });

  it("links the fragments page to one document under three hrefs", async () => {
    // WHEN
    const hrefs = await hrefsOf(fixtures.origin, "/fragments/");

    // THEN
    expect(hrefs).toEqual([
      "/fragments/p.html#one",
      "/fragments/p.html#two",
      "/fragments/p.html",
    ]);
  });

  it("links the coverage page to the private, pdf and missing routes", async () => {
    // WHEN
    const hrefs = await hrefsOf(fixtures.origin, "/page-coverage/");

    // THEN
    expect(hrefs).toEqual([
      "/page-coverage/about.html",
      "/private/secret.html",
      "/page-coverage/brochure.pdf",
      "/page-coverage/missing.html",
    ]);
  });
});
