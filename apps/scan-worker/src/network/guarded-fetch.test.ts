import {
  type FixtureServer,
  serveFixtures,
} from "@refresh/a11y-fixtures/serve-fixtures";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { createRecordingLogger } from "../testing/recording-logger.js";
import {
  type RedirectServer,
  startRedirectServer,
} from "../testing/redirect-server.js";
import { stubResolver } from "../testing/stub-resolver.js";
import { type EgressGuard, startEgressGuard } from "./egress-guard.js";
import {
  createGuardedFetch,
  type GuardedFetchClient,
} from "./guarded-fetch.js";

const EPHEMERAL_PORT = 0;
const HTTP_OK = 200;

describe("guardedFetch", () => {
  let fixtures: FixtureServer;
  let privateTarget: RedirectServer;
  let redirector: RedirectServer;
  let guard: EgressGuard;
  let client: GuardedFetchClient;
  let logger: ReturnType<typeof createRecordingLogger>;

  beforeEach(async () => {
    fixtures = await serveFixtures({ port: EPHEMERAL_PORT });
    privateTarget = await startRedirectServer(`${fixtures.origin}/clean/`);
    redirector = await startRedirectServer(`${privateTarget.origin}/secret`);
    logger = createRecordingLogger();
    guard = await startEgressGuard({
      resolve: stubResolver(),
      allowlist: new Set(
        [fixtures.origin, redirector.origin].map((o) => new URL(o).host),
      ),
      logger,
    });
    client = createGuardedFetch(guard);
  });

  afterEach(async () => {
    await client.close();
    await guard.close();
    await Promise.all([
      fixtures.close(),
      privateTarget.close(),
      redirector.close(),
    ]);
  });

  it("fetches an allowlisted fixture through the guard", async () => {
    // WHEN
    const response = await client.fetch(`${fixtures.origin}/robots.txt`);

    // THEN
    expect(response.status).toBe(HTTP_OK);
    expect(await response.text()).toContain("User-agent");
  });

  it("refuses a direct request to a non-allowlisted loopback target", async () => {
    // WHEN
    const fetching = client.fetch(`${privateTarget.origin}/secret`);

    // THEN
    await expect(fetching).rejects.toThrowError("fetch failed");
    expect(privateTarget.hits()).toBe(0);
  });

  it("refuses a redirect from an allowed host to a non-allowlisted loopback target", async () => {
    // WHEN
    const fetching = client.fetch(`${redirector.origin}/start`);

    // THEN
    await expect(fetching).rejects.toThrowError("fetch failed");
    expect(redirector.hits()).toBe(1);
    expect(privateTarget.hits()).toBe(0);
  });

  it("logs the blocked redirect hop", async () => {
    // WHEN
    await client.fetch(`${redirector.origin}/start`).catch(() => null);

    // THEN
    expect(logger.warn).toHaveBeenCalledWith(
      { event: "egress.blocked", host: "127.0.0.1", reason: "blocked-address" },
      "egress.blocked",
    );
  });
});
