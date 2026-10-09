import { afterEach, beforeEach, describe, expect, it } from "vitest";
import {
  type GuardHarness,
  startGuardHarness,
} from "../testing/guard-harness.js";
import { getOverSocket, proxyConnect } from "../testing/proxy-client.js";

const HTTP_OK = 200;
const HTTP_BAD_REQUEST = 400;
const HTTP_FORBIDDEN = 403;
const HTTP_BAD_GATEWAY = 502;

describe("EgressGuard CONNECT tunnels", () => {
  let harness: GuardHarness;

  beforeEach(async () => {
    harness = await startGuardHarness();
  });

  afterEach(async () => {
    await harness.close();
  });

  const connectTo = async (authority: string) => {
    const result = await proxyConnect({
      proxyUrl: harness.guard.url,
      authority,
    });
    result.socket.destroy();
    return result;
  };

  it("tunnels to an allowlisted fixture", async () => {
    // GIVEN
    const authority = harness.fixtureAuthority;

    // WHEN
    const { status, socket } = await proxyConnect({
      proxyUrl: harness.guard.url,
      authority,
    });
    const response = await getOverSocket(socket, authority);

    // THEN
    expect(status).toBe(HTTP_OK);
    expect(response).toContain("HTTP/1.1 200 OK");
  });

  it("refuses a tunnel to a loopback target that is not allowlisted", async () => {
    // WHEN
    const { status, headers } = await connectTo(
      new URL(harness.fixtures.crossOrigin).host,
    );

    // THEN
    expect(status).toBe(HTTP_FORBIDDEN);
    expect(headers["x-refresh-egress"]).toBe("blocked-address");
  });

  it("refuses a tunnel to a host that does not resolve", async () => {
    // WHEN
    const { status } = await connectTo("unresolvable.invalid:443");

    // THEN
    expect(status).toBe(HTTP_BAD_GATEWAY);
  });

  it("rejects a CONNECT target that is not in authority form", async () => {
    // WHEN
    const { status } = await connectTo("/not-an-authority");

    // THEN
    expect(status).toBe(HTTP_BAD_REQUEST);
  });
});
