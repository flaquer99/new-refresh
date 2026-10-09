import { createServer, type Socket } from "node:net";

const EPHEMERAL_PORT = 0;
const LOOPBACK_HOST = "127.0.0.1";

export type HangingServer = {
  authority: string;
  requestReceived: Promise<Socket>;
  close: () => Promise<void>;
};

export const startHangingServer = () =>
  new Promise<HangingServer>((resolve) => {
    const sockets = new Set<Socket>();
    let markReceived: (socket: Socket) => void = () => undefined;
    const requestReceived = new Promise<Socket>((done) => {
      markReceived = done;
    });
    const server = createServer((socket) => {
      sockets.add(socket);
      socket.once("data", () => markReceived(socket));
    });
    server.listen(EPHEMERAL_PORT, LOOPBACK_HOST, () => {
      const address = server.address();
      const port = typeof address === "object" && address ? address.port : 0;
      resolve({
        authority: `${LOOPBACK_HOST}:${port}`,
        requestReceived,
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
