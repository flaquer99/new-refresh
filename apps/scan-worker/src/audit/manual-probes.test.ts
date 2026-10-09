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
import { runManualProbes } from "./manual-probes.js";
import { VIEWPORT_SIZES } from "./viewports.js";

const WIDE_CONTENT = '<div style="width: 900px">Wide table</div>';

describe("runManualProbes", () => {
  let browser: Browser;
  let page: Page;

  beforeAll(async () => {
    browser = await chromium.launch({ headless: true });
  });

  afterAll(async () => {
    await browser.close();
  });

  beforeEach(async () => {
    page = await browser.newPage({ viewport: VIEWPORT_SIZES.mobile });
  });

  afterEach(async () => {
    await page.close();
  });

  it("matches nothing on a page with plain text only", async () => {
    // GIVEN
    await page.setContent("<p>Plain text</p>");

    // WHEN
    const probeIds = await runManualProbes(page, "desktop");

    // THEN
    expect(probeIds).toEqual([]);
  });

  it("matches the form-control and authentication probes for a password field", async () => {
    // GIVEN
    await page.setContent('<label>Password <input type="password"></label>');

    // WHEN
    const probeIds = await runManualProbes(page, "desktop");

    // THEN
    expect(probeIds).toEqual(
      expect.arrayContaining([
        "form-control",
        "authentication",
        "headings-or-labels",
      ]),
    );
  });

  it("matches horizontal overflow on the mobile pass", async () => {
    // GIVEN
    await page.setContent(WIDE_CONTENT);

    // WHEN
    const probeIds = await runManualProbes(page, "mobile");

    // THEN
    expect(probeIds).toContain("horizontal-overflow");
  });

  it("does not probe horizontal overflow on the desktop pass", async () => {
    // GIVEN
    await page.setContent(WIDE_CONTENT);

    // WHEN
    const probeIds = await runManualProbes(page, "desktop");

    // THEN
    expect(probeIds).not.toContain("horizontal-overflow");
  });
});
