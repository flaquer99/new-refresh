import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { proxyConnect } from "../testing/proxy-client.js";
import { createRecordingLogger } from "../testing/recording-logger.js";
import {
  type ResetServer,
  readUntilClose,
  startResetServer,
} from "../testing/reset-server.js";
import { stubResolver } from "../testing/stub-resolver.js";
import { type EgressGuard, startEgressGuard } from "./egress-guard.js";

describe("EgressGuard established tunnel failures", () => {
  let upstream: ResetServer;
  let guard: EgressGuard;

  beforeEach(async () => {
    upstream = await startResetServer();
    guard = await startEgressGuard({
      resolve: stubResolver(),
      allowlist: new Set([upstream.authority]),
      logger: createRecordingLogger(),
    });
  });

  afterEach(async () => {
    await guard.close();
    await upstream.close();
  });

  it("drops the client without injecting an HTTP response into the tunnel", async () => {
    // GIVEN
    const { socket } = await proxyConnect({
      proxyUrl: guard.url,
      authority: upstream.authority,
    });

    // WHEN
    const received = await readUntilClose(socket, "client-hello");

    // THEN
    expect(received).toBe("");
  });
});
