import { createServer, type Socket } from "node:net";

const EPHEMERAL_PORT = 0;
const LOOPBACK_HOST = "127.0.0.1";

export type ResetServer = { authority: string; close: () => Promise<void> };

export const startResetServer = () =>
  new Promise<ResetServer>((resolve) => {
    const sockets = new Set<Socket>();
    const server = createServer((socket) => {
      sockets.add(socket);
      socket.once("data", () => socket.resetAndDestroy());
    });
    server.listen(EPHEMERAL_PORT, LOOPBACK_HOST, () => {
      const address = server.address();
      const port = typeof address === "object" && address ? address.port : 0;
      resolve({
        authority: `${LOOPBACK_HOST}:${port}`,
        close: () =>
          new Promise((done) => {
            for (const socket of sockets) {
              socket.destroy();
            }
            server.close(() => done());
          }),
      });
    });
  });

export const readUntilClose = (socket: Socket, payload: string) =>
  new Promise<string>((resolve) => {
    const chunks: Buffer[] = [];
    socket.on("data", (chunk: Buffer) => chunks.push(chunk));
    socket.on("error", () => undefined);
    socket.on("close", () => resolve(Buffer.concat(chunks).toString("utf8")));
    socket.write(payload);
  });
