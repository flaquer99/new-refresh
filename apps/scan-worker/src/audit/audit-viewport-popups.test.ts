import {
  type FixtureServer,
  serveFixtures,
} from "@refresh/a11y-fixtures/serve-fixtures";
import { type Browser, type BrowserContext, chromium } from "playwright";
import {
  afterAll,
  afterEach,
  beforeAll,
  beforeEach,
  describe,
  expect,
  it,
} from "vitest";
import { auditViewport } from "./audit-viewport.js";
import { DEFAULT_LOAD_TIMEOUTS } from "./load-page.js";

const EPHEMERAL_PORT = 0;

describe("auditViewport popups", () => {
  let fixtures: FixtureServer;
  let browser: Browser;
  let context: BrowserContext;

  beforeAll(async () => {
    fixtures = await serveFixtures({ port: EPHEMERAL_PORT });
    browser = await chromium.launch({ headless: true });
  });

  afterAll(async () => {
    await browser.close();
    await fixtures.close();
  });

  beforeEach(async () => {
    context = await browser.newContext();
  });

  afterEach(async () => {
    await context.close();
  });

  it("closes every popup the audited page opens", async () => {
    // WHEN
    await auditViewport({
      context,
      viewport: "desktop",
      url: `${fixtures.origin}/popups/`,
      timeouts: DEFAULT_LOAD_TIMEOUTS,
      collectLinks: false,
    });

    // THEN
    expect(context.pages()).toEqual([]);
  });

  it("still audits a page that opens popups", async () => {
    // WHEN
    const result = await auditViewport({
      context,
      viewport: "desktop",
      url: `${fixtures.origin}/popups/`,
      timeouts: DEFAULT_LOAD_TIMEOUTS,
      collectLinks: false,
    });

    // THEN
    expect(result.kind).toBe("audited");
  });
});
