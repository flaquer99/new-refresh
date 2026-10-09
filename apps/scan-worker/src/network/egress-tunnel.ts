import type { IncomingMessage } from "node:http";
import { connect, type Socket } from "node:net";
import type { Duplex } from "node:stream";
import {
  EGRESS_VERDICT_HEADER,
  type EgressContext,
  HTTP_BAD_GATEWAY,
  HTTP_BAD_REQUEST,
  refusalFor,
  UNRESOLVED,
  vetEgress,
} from "./egress-policy.js";
import { targetPort } from "./target-port.js";

const ESTABLISHED = "HTTP/1.1 200 Connection Established\r\n\r\n";
const CRLF = "\r\n";
const AUTHORITY_FORM = /^[^/?#@\s]+:\d+$/;

type TunnelRequest = { req: IncomingMessage; client: Duplex; head: Buffer };

const refuse = (client: Duplex, status: number, verdict?: string) => {
  const verdictLine = verdict
    ? `${EGRESS_VERDICT_HEADER}: ${verdict}${CRLF}`
    : "";
  client.end(`HTTP/1.1 ${status} Refused${CRLF}${verdictLine}${CRLF}`);
};

const parseAuthority = (raw = "") => {
  const candidate = `http://${raw}`;
  if (!(AUTHORITY_FORM.test(raw) && URL.canParse(candidate))) {
    return null;
  }
  const url = new URL(candidate);
  return { host: url.hostname, port: targetPort(url) };
};

const splice = (client: Duplex, upstream: Socket, head: Buffer) => {
  client.write(ESTABLISHED);
  upstream.write(head);
  upstream.pipe(client);
  client.pipe(upstream);
};

const openTunnel = (address: string, port: number, request: TunnelRequest) => {
  const { client, head } = request;
  let established = false;
  const upstream = connect({ host: address, port }, () => {
    established = true;
    splice(client, upstream, head);
  });
  upstream.on("error", () =>
    established ? client.destroy() : refuse(client, HTTP_BAD_GATEWAY),
  );
  client.on("error", () => upstream.destroy());
  client.on("close", () => upstream.destroy());
};

const tunnel = async (context: EgressContext, request: TunnelRequest) => {
  const authority = parseAuthority(request.req.url);
  if (!authority) {
    refuse(request.client, HTTP_BAD_REQUEST);
    return;
  }
  const verdict = await vetEgress(context, authority);
  if (verdict.kind !== "allowed") {
    const refusal = refusalFor(verdict);
    refuse(request.client, refusal.status, refusal.verdict);
    return;
  }
  openTunnel(verdict.address, authority.port, request);
};

export const createTunnelHandler =
  (context: EgressContext) =>
  async (req: IncomingMessage, client: Duplex, head: Buffer) => {
    try {
      await tunnel(context, { req, client, head });
    } catch {
      refuse(client, HTTP_BAD_GATEWAY, UNRESOLVED);
    }
  };
