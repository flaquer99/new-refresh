import { type IncomingHttpHeaders, request } from "node:http";
import type { Socket } from "node:net";

export type ProxiedResponse = {
  status: number;
  headers: IncomingHttpHeaders;
  body: string;
};

type ProxyGetInput = { proxyUrl: string; target: string };
type ProxyConnectInput = { proxyUrl: string; authority: string };
type ConnectResult = {
  status: number;
  headers: IncomingHttpHeaders;
  socket: Socket;
};

const proxyAddress = (proxyUrl: string) => {
  const { hostname, port } = new URL(proxyUrl);
  return { host: hostname, port: Number(port) };
};

export const proxyGet = ({ proxyUrl, target }: ProxyGetInput) =>
  new Promise<ProxiedResponse>((resolve, reject) => {
    const req = request({ ...proxyAddress(proxyUrl), path: target }, (res) => {
      const chunks: Buffer[] = [];
      res.on("data", (chunk: Buffer) => chunks.push(chunk));
      res.on("end", () =>
        resolve({
          status: res.statusCode ?? 0,
          headers: res.headers,
          body: Buffer.concat(chunks).toString("utf8"),
        }),
      );
    });
    req.on("error", reject);
    req.end();
  });

export const proxyConnect = ({ proxyUrl, authority }: ProxyConnectInput) =>
  new Promise<ConnectResult>((resolve, reject) => {
    const req = request({
      ...proxyAddress(proxyUrl),
      method: "CONNECT",
      path: authority,
    });
    req.on("connect", (res, socket) =>
      resolve({ status: res.statusCode ?? 0, headers: res.headers, socket }),
    );
    req.on("error", reject);
    req.end();
  });

export const getOverSocket = (socket: Socket, authority: string) =>
  new Promise<string>((resolve, reject) => {
    const chunks: Buffer[] = [];
    socket.on("data", (chunk: Buffer) => chunks.push(chunk));
    socket.on("end", () => resolve(Buffer.concat(chunks).toString("utf8")));
    socket.on("error", reject);
    socket.write(
      `GET /clean/ HTTP/1.1\r\nHost: ${authority}\r\nConnection: close\r\n\r\n`,
    );
  });
