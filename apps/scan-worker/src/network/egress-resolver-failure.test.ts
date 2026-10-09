import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { proxyConnect, proxyGet } from "../testing/proxy-client.js";
import { createRecordingLogger } from "../testing/recording-logger.js";
import { type EgressGuard, startEgressGuard } from "./egress-guard.js";

const HTTP_BAD_GATEWAY = 502;
const VERDICT_HEADER = "x-refresh-egress";

const failingResolver = () => Promise.reject(new Error("resolver exploded"));

describe("EgressGuard resolver failures", () => {
  let guard: EgressGuard;

  beforeEach(async () => {
    guard = await startEgressGuard({
      resolve: failingResolver,
      allowlist: new Set(),
      logger: createRecordingLogger(),
    });
  });

  afterEach(async () => {
    await guard.close();
  });

  it("marks an HTTP request as unresolved when the resolver throws", async () => {
    // WHEN
    const response = await proxyGet({
      proxyUrl: guard.url,
      target: "http://example.com/",
    });

    // THEN
    expect(response.status).toBe(HTTP_BAD_GATEWAY);
    expect(response.headers[VERDICT_HEADER]).toBe("unresolved");
  });

  it("marks a tunnel as unresolved when the resolver throws", async () => {
    // WHEN
    const { status, headers, socket } = await proxyConnect({
      proxyUrl: guard.url,
      authority: "example.com:443",
    });
    socket.destroy();

    // THEN
    expect(status).toBe(HTTP_BAD_GATEWAY);
    expect(headers[VERDICT_HEADER]).toBe("unresolved");
  });
});
