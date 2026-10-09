import { createServer, type RequestListener, type Server } from "node:http";

export const LOOPBACK_HOST = "127.0.0.1";

export type ListeningServer = {
  origin: string;
  close: () => Promise<void>;
};

const closeServer = (server: Server): Promise<void> =>
  new Promise((resolve, reject) => {
    server.closeAllConnections();
    server.close((error) => (error ? reject(error) : resolve()));
  });

const boundPort = (server: Server, requestedPort: number): number => {
  const address = server.address();
  return typeof address === "object" && address ? address.port : requestedPort;
};

export const listen = (
  handler: RequestListener,
  port: number,
): Promise<ListeningServer> =>
  new Promise((resolve, reject) => {
    const server = createServer(handler);
    server.once("error", reject);
    server.listen(port, LOOPBACK_HOST, () => {
      resolve({
        origin: `http://${LOOPBACK_HOST}:${boundPort(server, port)}`,
        close: () => closeServer(server),
      });
    });
  });
