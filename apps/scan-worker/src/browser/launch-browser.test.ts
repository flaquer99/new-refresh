import {
  type FixtureServer,
  serveFixtures,
} from "@refresh/a11y-fixtures/serve-fixtures";
import type { Browser, Page } from "playwright";
import {
  afterAll,
  afterEach,
  beforeAll,
  beforeEach,
  describe,
  expect,
  it,
} from "vitest";
import { type EgressGuard, startEgressGuard } from "../network/egress-guard.js";
import { createRecordingLogger } from "../testing/recording-logger.js";
import { stubResolver } from "../testing/stub-resolver.js";
import { launchGuardedBrowser } from "./launch-browser.js";

const EPHEMERAL_PORT = 0;
const HTTP_OK = 200;
const HTTP_FORBIDDEN = 403;

describe("launchGuardedBrowser", () => {
  let fixtures: FixtureServer;
  let guard: EgressGuard;
  let logger: ReturnType<typeof createRecordingLogger>;
  let browser: Browser;
  let page: Page;

  beforeAll(async () => {
    fixtures = await serveFixtures({ port: EPHEMERAL_PORT });
    logger = createRecordingLogger();
    guard = await startEgressGuard({
      resolve: stubResolver(),
      allowlist: new Set([new URL(fixtures.origin).host]),
      logger,
    });
    browser = await launchGuardedBrowser(guard);
  });

  afterAll(async () => {
    await browser.close();
    await guard.close();
    await fixtures.close();
  });

  beforeEach(async () => {
    logger.warn.mockClear();
    page = await browser.newPage();
  });

  afterEach(async () => {
    await page.close();
  });

  it("loads an allowlisted loopback fixture through the guard", async () => {
    // WHEN
    const response = await page.goto(`${fixtures.origin}/clean/`);

    // THEN
    expect(response?.status()).toBe(HTTP_OK);
  });

  it("routes a non-allowlisted loopback navigation through the guard, which blocks it", async () => {
    // WHEN
    const response = await page.goto(`${fixtures.crossOrigin}/clean/`);

    // THEN
    expect(response?.status()).toBe(HTTP_FORBIDDEN);
    expect(await response?.headerValue("x-refresh-egress")).toBe(
      "blocked-address",
    );
  });

  it("logs the block when Chromium targets a non-allowlisted loopback address", async () => {
    // WHEN
    await page.goto(`${fixtures.crossOrigin}/clean/`);

    // THEN
    expect(logger.warn).toHaveBeenCalledWith(
      { event: "egress.blocked", host: "127.0.0.1", reason: "blocked-address" },
      "egress.blocked",
    );
  });

  it("fails an HTTPS navigation to a non-allowlisted loopback address at the tunnel", async () => {
    // WHEN
    const navigation = page.goto(
      `https://127.0.0.1:${new URL(fixtures.crossOrigin).port}/`,
    );

    // THEN
    await expect(navigation).rejects.toThrowError(
      /ERR_TUNNEL_CONNECTION_FAILED/,
    );
  });
});
