import { createServer, type Server } from "node:http";
import type { AddressInfo, Socket } from "node:net";
import { createForwardHandler } from "./egress-forward.js";
import type { EgressContext } from "./egress-policy.js";
import { createTunnelHandler } from "./egress-tunnel.js";

const LOOPBACK_HOST = "127.0.0.1";
const EPHEMERAL_PORT = 0;

export type EgressGuard = { url: string; close: () => Promise<void> };

export type StartEgressGuard = (context: EgressContext) => Promise<EgressGuard>;

const trackSockets = (server: Server): Set<Socket> => {
  const sockets = new Set<Socket>();
  server.on("connection", (socket: Socket) => {
    sockets.add(socket);
    socket.on("close", () => sockets.delete(socket));
  });
  return sockets;
};

const closeGuard = (server: Server, sockets: Set<Socket>) =>
  new Promise<void>((resolve, reject) => {
    for (const socket of sockets) {
      socket.destroy();
    }
    if (!server.listening) {
      resolve();
      return;
    }
    server.close((error) => (error ? reject(error) : resolve()));
  });

const boundPort = (address: string | AddressInfo | null): number =>
  typeof address === "object" && address !== null ? address.port : 0;

const listen = (server: Server) =>
  new Promise<number>((resolve, reject) => {
    server.once("error", reject);
    server.listen(EPHEMERAL_PORT, LOOPBACK_HOST, () =>
      resolve(boundPort(server.address())),
    );
  });

export const startEgressGuard: StartEgressGuard = async (context) => {
  const server = createServer(createForwardHandler(context));
  server.on("connect", createTunnelHandler(context));
  const sockets = trackSockets(server);
  const port = await listen(server);
  return {
    url: `http://${LOOPBACK_HOST}:${port}`,
    close: () => closeGuard(server, sockets),
  };
};
