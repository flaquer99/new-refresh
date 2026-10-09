import { createServer, type IncomingMessage } from "node:http";
import type { AddressInfo } from "node:net";
import type { ScanResult } from "@refresh/scan-contracts/scan-result";

const HTTP_OK = 200;
const CALLBACK_PATH = "/api/internal/scans";

export type ReceivedCallback = {
  path: string;
  authorization: string | undefined;
  result: ScanResult;
};

export type CallbackServer = {
  url: string;
  received: ReceivedCallback[];
  close: () => Promise<void>;
};

const readBody = async (request: IncomingMessage): Promise<string> => {
  let body = "";
  for await (const chunk of request) {
    body += chunk;
  }
  return body;
};

export const startCallbackServer = async (): Promise<CallbackServer> => {
  const received: ReceivedCallback[] = [];
  const server = createServer(async (request, response) => {
    const result = JSON.parse(await readBody(request)) as ScanResult;
    received.push({
      path: request.url ?? "",
      authorization: request.headers.authorization,
      result,
    });
    response.writeHead(HTTP_OK, { "content-type": "application/json" });
    response.end(JSON.stringify({ recorded: true }));
  });
  await new Promise<void>((resolve) => {
    server.listen(0, "127.0.0.1", resolve);
  });
  const { port } = server.address() as AddressInfo;
  return {
    url: `http://127.0.0.1:${port}${CALLBACK_PATH}`,
    received,
    close: () =>
      new Promise<void>((resolve) => {
        server.close(() => resolve());
      }),
  };
};
