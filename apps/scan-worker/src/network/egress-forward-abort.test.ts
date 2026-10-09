import { request } from "node:http";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import {
  type HangingServer,
  startHangingServer,
} from "../testing/hanging-server.js";
import { createRecordingLogger } from "../testing/recording-logger.js";
import { stubResolver } from "../testing/stub-resolver.js";
import { type EgressGuard, startEgressGuard } from "./egress-guard.js";

describe("EgressGuard client aborts", () => {
  let upstream: HangingServer;
  let guard: EgressGuard;

  beforeEach(async () => {
    upstream = await startHangingServer();
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

  it("releases the upstream connection when the client goes away", async () => {
    // GIVEN
    const { hostname, port } = new URL(guard.url);
    const client = request({
      host: hostname,
      port: Number(port),
      path: `http://${upstream.authority}/slow`,
    });
    client.on("error", () => undefined);
    client.end();
    const upstreamSocket = await upstream.requestReceived;
    const upstreamClosed = new Promise<boolean>((resolve) =>
      upstreamSocket.on("close", () => resolve(true)),
    );

    // WHEN
    client.destroy();

    // THEN
    await expect(upstreamClosed).resolves.toBe(true);
  });
});
