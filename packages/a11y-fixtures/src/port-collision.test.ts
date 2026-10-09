import { createServer, type Server } from "node:net";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { LOOPBACK_HOST } from "./listen.js";
import { serveFixtures } from "./serve-fixtures.js";

const EPHEMERAL_PORT = 0;

const listenOn = (port: number): Promise<Server> =>
  new Promise((resolve, reject) => {
    const server = createServer();
    server.once("error", reject);
    server.listen(port, LOOPBACK_HOST, () => resolve(server));
  });

const closeServer = (server: Server): Promise<void> =>
  new Promise((resolve) => server.close(() => resolve()));

const portOf = (server: Server): number => {
  const address = server.address();
  if (address === null || typeof address === "string") {
    throw new Error("Server is not bound to a TCP port");
  }
  return address.port;
};

const reserveFreePort = async (): Promise<number> => {
  const probe = await listenOn(EPHEMERAL_PORT);
  const port = portOf(probe);
  await closeServer(probe);
  return port;
};

describe("serveFixtures when the cross-origin port is taken", () => {
  let blocker: Server;

  beforeEach(async () => {
    blocker = await listenOn(EPHEMERAL_PORT);
  });

  afterEach(async () => {
    await closeServer(blocker);
  });

  it("rejects with the address-in-use error", async () => {
    // WHEN
    const started = serveFixtures({
      port: EPHEMERAL_PORT,
      crossOriginPort: portOf(blocker),
    });

    // THEN
    await expect(started).rejects.toMatchObject({ code: "EADDRINUSE" });
  });

  it("releases the primary port it already bound", async () => {
    // GIVEN
    const primaryPort = await reserveFreePort();
    await serveFixtures({
      port: primaryPort,
      crossOriginPort: portOf(blocker),
    }).catch(() => undefined);

    // WHEN
    const rebound = await listenOn(primaryPort);

    // THEN
    expect(portOf(rebound)).toBe(primaryPort);
    await closeServer(rebound);
  });
});
