import { createServer, type OutgoingHttpHeaders } from "node:http";

const HTTP_OK = 200;
const EPHEMERAL_PORT = 0;
const LOOPBACK_HOST = "127.0.0.1";

export type HeaderServer = { origin: string; close: () => Promise<void> };

export const startHeaderServer = (headers: OutgoingHttpHeaders) =>
  new Promise<HeaderServer>((resolve) => {
    const server = createServer((_req, res) => {
      res.writeHead(HTTP_OK, { "content-type": "text/html", ...headers });
      res.end("<!doctype html><title>spoof</title>");
    });
    server.listen(EPHEMERAL_PORT, LOOPBACK_HOST, () => {
      const address = server.address();
      const port = typeof address === "object" && address ? address.port : 0;
      resolve({
        origin: `http://${LOOPBACK_HOST}:${port}`,
        close: () =>
          new Promise((done) => {
            server.closeAllConnections();
            server.close(() => done());
          }),
      });
    });
  });
