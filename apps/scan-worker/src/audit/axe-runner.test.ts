import {
  type Browser,
  type BrowserContext,
  chromium,
  type Page,
} from "playwright";
import {
  afterAll,
  afterEach,
  beforeAll,
  beforeEach,
  describe,
  expect,
  it,
} from "vitest";
import { runAxe } from "./axe-runner.js";

const SHADOW_IMAGE_PAGE = `<!doctype html><html lang="en"><title>Shadow</title><main><div id="host"></div></main>
<script>document.getElementById("host").attachShadow({ mode: "open" }).innerHTML = '<img id="inner" src="data:,">';</script></html>`;

describe("runAxe", () => {
  let browser: Browser;
  let context: BrowserContext;
  let page: Page;

  beforeAll(async () => {
    browser = await chromium.launch({ headless: true });
  });

  afterAll(async () => {
    await browser.close();
  });

  beforeEach(async () => {
    context = await browser.newContext();
    page = await context.newPage();
  });

  afterEach(async () => {
    await context.close();
  });

  it("keeps a shadow DOM target as the host selector followed by the inner selector", async () => {
    // GIVEN
    await page.setContent(SHADOW_IMAGE_PAGE);

    // WHEN
    const results = await runAxe(page);

    // THEN
    const imageAlt = results.violations.find((rule) => rule.id === "image-alt");
    expect(imageAlt?.nodes[0]?.target).toEqual([["#host", "#inner"]]);
  });

  it("does not report best-practice rules outside the WCAG A and AA tags", async () => {
    // GIVEN
    await page.setContent("<p>No landmarks or heading</p>");

    // WHEN
    const results = await runAxe(page);

    // THEN
    const ruleIds = results.violations.map((rule) => rule.id);
    expect(ruleIds).not.toContain("region");
  });
});
