import { type Browser, chromium } from "playwright";
import {
  afterAll,
  afterEach,
  beforeAll,
  beforeEach,
  describe,
  expect,
  it,
} from "vitest";
import {
  createViewportContexts,
  type ViewportContexts,
} from "./create-contexts.js";

const DEFAULT_UA_PATTERN = /HeadlessChrome\/[\d.]+ /;

describe("createViewportContexts", () => {
  let browser: Browser;
  let contexts: ViewportContexts;

  beforeAll(async () => {
    browser = await chromium.launch({ headless: true });
  });

  afterAll(async () => {
    await browser.close();
  });

  beforeEach(async () => {
    contexts = await createViewportContexts(browser);
  });

  afterEach(async () => {
    await contexts.close();
  });

  it("appends the scanner token to Chromium's default user agent", async () => {
    // GIVEN
    const page = await contexts.desktop.newPage();

    // WHEN
    const userAgent = await page.evaluate(() => navigator.userAgent);

    // THEN
    expect(userAgent).toMatch(DEFAULT_UA_PATTERN);
    expect(userAgent.endsWith(" RefreshA11yScanner/1.0")).toBe(true);
  });

  it("sizes the desktop context at 1280 by 800", async () => {
    // GIVEN
    const page = await contexts.desktop.newPage();

    // WHEN
    const size = await page.evaluate(() => [
      window.innerWidth,
      window.innerHeight,
    ]);

    // THEN
    expect(size).toEqual([1280, 800]);
  });

  it("sizes the mobile context at 320 by 640", async () => {
    // GIVEN
    const page = await contexts.mobile.newPage();

    // WHEN
    const size = await page.evaluate(() => [
      window.innerWidth,
      window.innerHeight,
    ]);

    // THEN
    expect(size).toEqual([320, 640]);
  });

  it("leaves no page open in the browser after creating the contexts", () => {
    // WHEN
    const openPages = browser.contexts().flatMap((context) => context.pages());

    // THEN
    expect(openPages).toEqual([]);
  });
});
