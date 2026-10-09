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

describe("runManualProbes computed probes", () => {
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

  it("matches the fixed-position probe for a sticky header", async () => {
    // GIVEN
    await page.setContent(
      '<header style="position: sticky; top: 0">Menu</header>',
    );

    // WHEN
    const probeIds = await runManualProbes(page, "desktop");

    // THEN
    expect(probeIds).toEqual(["fixed-position"]);
  });

  it("matches the animation probe for a running CSS animation", async () => {
    // GIVEN
    await page.setContent(
      "<style>@keyframes spin { to { transform: rotate(1turn) } } p { animation: spin 1s infinite }</style><p>Spinner</p>",
    );

    // WHEN
    const probeIds = await runManualProbes(page, "desktop");

    // THEN
    expect(probeIds).toEqual(["animation"]);
  });

  it("matches the animation probe for a marquee", async () => {
    // GIVEN
    await page.setContent("<marquee>News</marquee>");

    // WHEN
    const probeIds = await runManualProbes(page, "desktop");

    // THEN
    expect(probeIds).toContain("animation");
  });
});
