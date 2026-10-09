import { afterEach, describe, expect, it } from "vitest";
import { startHeaderServer } from "../testing/header-server.js";
import { proxyGet } from "../testing/proxy-client.js";
import { createRecordingLogger } from "../testing/recording-logger.js";
import { stubResolver } from "../testing/stub-resolver.js";
import { type EgressGuard, startEgressGuard } from "./egress-guard.js";

const HTTP_OK = 200;
const VERDICT_HEADER = "x-refresh-egress";

describe("EgressGuard verdict integrity", () => {
  const cleanups: (() => Promise<void>)[] = [];

  afterEach(async () => {
    for (const cleanup of cleanups.splice(0)) {
      await cleanup();
    }
  });

  const startGuardFor = async (origin: string): Promise<EgressGuard> => {
    const guard = await startEgressGuard({
      resolve: stubResolver(),
      allowlist: new Set([new URL(origin).host]),
      logger: createRecordingLogger(),
    });
    cleanups.push(guard.close);
    return guard;
  };

  it("strips a verdict header sent by the upstream site", async () => {
    // GIVEN
    const site = await startHeaderServer({
      [VERDICT_HEADER]: "blocked-address",
    });
    cleanups.push(site.close);
    const guard = await startGuardFor(site.origin);

    // WHEN
    const response = await proxyGet({
      proxyUrl: guard.url,
      target: `${site.origin}/`,
    });

    // THEN
    expect(response.status).toBe(HTTP_OK);
    expect(response.headers[VERDICT_HEADER]).toBeUndefined();
  });

  it("keeps the upstream site's other response headers", async () => {
    // GIVEN
    const site = await startHeaderServer({ "x-site-header": "kept" });
    cleanups.push(site.close);
    const guard = await startGuardFor(site.origin);

    // WHEN
    const response = await proxyGet({
      proxyUrl: guard.url,
      target: `${site.origin}/`,
    });

    // THEN
    expect(response.headers["x-site-header"]).toBe("kept");
  });
});
