import { afterEach, beforeEach, describe, expect, it } from "vitest";
import {
  type EchoHeadersServer,
  startEchoHeadersServer,
} from "../testing/echo-headers-server.js";
import { createRecordingLogger } from "../testing/recording-logger.js";
import { stubResolver } from "../testing/stub-resolver.js";
import { type EgressGuard, startEgressGuard } from "./egress-guard.js";
import {
  createGuardedFetch,
  type GuardedFetchClient,
} from "./guarded-fetch.js";

describe("guardedFetch headers", () => {
  let echo: EchoHeadersServer;
  let guard: EgressGuard;
  let client: GuardedFetchClient;

  beforeEach(async () => {
    echo = await startEchoHeadersServer();
    guard = await startEgressGuard({
      resolve: stubResolver(),
      allowlist: new Set([new URL(echo.origin).host]),
      logger: createRecordingLogger(),
    });
    client = createGuardedFetch(guard);
  });

  afterEach(async () => {
    await client.close();
    await guard.close();
    await echo.close();
  });

  it("sends the custom headers to the target", async () => {
    // WHEN
    const response = await client.fetch(echo.origin, {
      headers: { "user-agent": "Probe/1.0", accept: "text/html" },
    });
    const received = (await response.json()) as Record<string, string>;

    // THEN
    expect(received["user-agent"]).toBe("Probe/1.0");
    expect(received.accept).toBe("text/html");
  });
});
