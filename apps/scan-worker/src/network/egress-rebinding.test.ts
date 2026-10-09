import {
  type FixtureServer,
  serveFixtures,
} from "@refresh/a11y-fixtures/serve-fixtures";
import {
  afterEach,
  beforeEach,
  describe,
  expect,
  it,
  type Mock,
  vi,
} from "vitest";
import {
  getOverSocket,
  proxyConnect,
  proxyGet,
} from "../testing/proxy-client.js";
import { createRecordingLogger } from "../testing/recording-logger.js";
import { type EgressGuard, startEgressGuard } from "./egress-guard.js";
import type { ResolveHost } from "./resolve-host.js";

const EPHEMERAL_PORT = 0;
const HTTP_OK = 200;
const REBINDING_HOST = "rebind.test";
const VETTED_ADDRESS = "127.0.0.1";
const REBOUND_ADDRESS = "10.0.0.1";

describe("EgressGuard DNS rebinding defense", () => {
  let fixtures: FixtureServer;
  let guard: EgressGuard;
  let resolve: Mock<ResolveHost>;
  let authority: string;

  beforeEach(async () => {
    fixtures = await serveFixtures({ port: EPHEMERAL_PORT });
    authority = `${REBINDING_HOST}:${new URL(fixtures.origin).port}`;
    resolve = vi
      .fn<ResolveHost>()
      .mockResolvedValueOnce([VETTED_ADDRESS])
      .mockResolvedValue([REBOUND_ADDRESS]);
    guard = await startEgressGuard({
      resolve,
      allowlist: new Set([authority]),
      logger: createRecordingLogger(),
    });
  });

  afterEach(async () => {
    await guard.close();
    await fixtures.close();
  });

  it("forwards HTTP to the vetted address instead of re-resolving the host", async () => {
    // WHEN
    const response = await proxyGet({
      proxyUrl: guard.url,
      target: `http://${authority}/clean/`,
    });

    // THEN
    expect(response.status).toBe(HTTP_OK);
    expect(resolve).toHaveBeenCalledTimes(1);
  });

  it("tunnels CONNECT to the vetted address instead of re-resolving the host", async () => {
    // WHEN
    const { status, socket } = await proxyConnect({
      proxyUrl: guard.url,
      authority,
    });
    const response = await getOverSocket(socket, authority);

    // THEN
    expect(status).toBe(HTTP_OK);
    expect(response).toContain("HTTP/1.1 200 OK");
    expect(resolve).toHaveBeenCalledTimes(1);
  });
});
