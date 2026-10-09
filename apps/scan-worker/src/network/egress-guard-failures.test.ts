import { serveFixtures } from "@refresh/a11y-fixtures/serve-fixtures";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { proxyConnect, proxyGet } from "../testing/proxy-client.js";
import { createRecordingLogger } from "../testing/recording-logger.js";
import { stubResolver } from "../testing/stub-resolver.js";
import { type EgressGuard, startEgressGuard } from "./egress-guard.js";

const EPHEMERAL_PORT = 0;
const HTTP_BAD_GATEWAY = 502;

describe("EgressGuard upstream failures", () => {
  let guard: EgressGuard;
  let closedOrigin: string;

  beforeEach(async () => {
    const fixtures = await serveFixtures({ port: EPHEMERAL_PORT });
    closedOrigin = fixtures.origin;
    guard = await startEgressGuard({
      resolve: stubResolver(),
      allowlist: new Set([new URL(closedOrigin).host]),
      logger: createRecordingLogger(),
    });
    await fixtures.close();
  });

  afterEach(async () => {
    await guard.close();
  });

  it("answers 502 when the allowlisted HTTP upstream refuses the connection", async () => {
    // WHEN
    const response = await proxyGet({
      proxyUrl: guard.url,
      target: `${closedOrigin}/clean/`,
    });

    // THEN
    expect(response.status).toBe(HTTP_BAD_GATEWAY);
  });

  it("marks a refused HTTP upstream as unreachable so the auditor can tell it from a site's own 502", async () => {
    // WHEN
    const response = await proxyGet({
      proxyUrl: guard.url,
      target: `${closedOrigin}/clean/`,
    });

    // THEN
    expect(response.headers["x-refresh-egress"]).toBe("unreachable");
  });

  it("answers 502 when the allowlisted tunnel upstream refuses the connection", async () => {
    // WHEN
    const { status, socket } = await proxyConnect({
      proxyUrl: guard.url,
      authority: new URL(closedOrigin).host,
    });
    socket.destroy();

    // THEN
    expect(status).toBe(HTTP_BAD_GATEWAY);
  });
});
