import { createServer } from "node:http";

const EPHEMERAL_PORT = 0;
const LOOPBACK_HOST = "127.0.0.1";
const HTTP_NOT_FOUND = 404;
export const SEQUENCE_PATH = "/page";

export type ScriptedResponse = { status: number; body: string };

export type SequenceServer = {
  origin: string;
  authority: string;
  close: () => Promise<void>;
};

export const startSequenceServer = (responses: readonly ScriptedResponse[]) =>
  new Promise<SequenceServer>((resolve) => {
    let served = 0;
    const server = createServer((req, res) => {
      const next = responses[Math.min(served, responses.length - 1)];
      if (req.url !== SEQUENCE_PATH || !next) {
        res.writeHead(HTTP_NOT_FOUND).end();
        return;
      }
      served += 1;
      res.writeHead(next.status, { "content-type": "text/html" });
      res.end(next.body);
    });
    server.listen(EPHEMERAL_PORT, LOOPBACK_HOST, () => {
      const address = server.address();
      const port = typeof address === "object" && address ? address.port : 0;
      resolve({
        origin: `http://${LOOPBACK_HOST}:${port}`,
        authority: `${LOOPBACK_HOST}:${port}`,
        close: () =>
          new Promise((done) => {
            server.closeAllConnections();
            server.close(() => done());
          }),
      });
    });
  });
