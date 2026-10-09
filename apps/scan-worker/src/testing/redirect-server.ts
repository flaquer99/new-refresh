import { createServer } from "node:http";

const HTTP_FOUND = 302;
const EPHEMERAL_PORT = 0;
const LOOPBACK_HOST = "127.0.0.1";

export type RedirectServer = {
  origin: string;
  hits: () => number;
  close: () => Promise<void>;
};

export const startRedirectServer = (location: string) =>
  new Promise<RedirectServer>((resolve) => {
    let hitCount = 0;
    const server = createServer((_req, res) => {
      hitCount += 1;
      res.writeHead(HTTP_FOUND, { location });
      res.end();
    });
    server.listen(EPHEMERAL_PORT, LOOPBACK_HOST, () => {
      const address = server.address();
      const port = typeof address === "object" && address ? address.port : 0;
      resolve({
        origin: `http://${LOOPBACK_HOST}:${port}`,
        hits: () => hitCount,
        close: () =>
          new Promise((done) => {
            server.closeAllConnections();
            server.close(() => done());
          }),
      });
    });
  });
