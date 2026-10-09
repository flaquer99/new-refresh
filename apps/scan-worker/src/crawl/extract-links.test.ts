import { type Browser, chromium, type Page } from "playwright";
import {
  afterAll,
  afterEach,
  beforeAll,
  beforeEach,
  describe,
  expect,
  it,
} from "vitest";
import { extractLinks } from "./extract-links.js";

const BASE = '<base href="https://site.test/docs/">';

describe("extractLinks", () => {
  let browser: Browser;
  let page: Page;

  beforeAll(async () => {
    browser = await chromium.launch({ headless: true });
  });

  afterAll(async () => {
    await browser.close();
  });

  beforeEach(async () => {
    page = await browser.newPage();
  });

  afterEach(async () => {
    await page.close();
  });

  it("resolves anchor and area links to absolute URLs", async () => {
    // GIVEN
    await page.setContent(
      `${BASE}<a href="intro.html">Intro</a><map name="m"><area href="/map.html" alt="Map"></map>`,
    );

    // WHEN
    const links = await extractLinks(page);

    // THEN
    expect(links).toEqual([
      "https://site.test/docs/intro.html",
      "https://site.test/map.html",
    ]);
  });

  it("ignores links that are not http or https", async () => {
    // GIVEN
    await page.setContent(
      `${BASE}<a href="mailto:a@site.test">Mail</a><a href="tel:+100">Call</a><a href="javascript:void(0)">Run</a>`,
    );

    // WHEN
    const links = await extractLinks(page);

    // THEN
    expect(links).toEqual([]);
  });

  it("lists a repeated link once", async () => {
    // GIVEN
    await page.setContent(
      `${BASE}<a href="a.html">A</a><a href="a.html">A again</a>`,
    );

    // WHEN
    const links = await extractLinks(page);

    // THEN
    expect(links).toEqual(["https://site.test/docs/a.html"]);
  });

  it("ignores anchors without an href", async () => {
    // GIVEN
    await page.setContent(`${BASE}<a name="top">Top</a>`);

    // WHEN
    const links = await extractLinks(page);

    // THEN
    expect(links).toEqual([]);
  });
});
