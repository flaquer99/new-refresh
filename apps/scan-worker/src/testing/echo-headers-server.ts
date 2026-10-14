import { createServer } from "node:http";

const HTTP_OK = 200;
const EPHEMERAL_PORT = 0;
const LOOPBACK_HOST = "127.0.0.1";

export type EchoHeadersServer = {
  origin: string;
  close: () => Promise<void>;
};

export const startEchoHeadersServer = () =>
  new Promise<EchoHeadersServer>((resolve) => {
    const server = createServer((req, res) => {
      res.writeHead(HTTP_OK, { "content-type": "application/json" });
      res.end(JSON.stringify(req.headers));
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
