import {
  type IncomingHttpHeaders,
  type IncomingMessage,
  request,
  type ServerResponse,
} from "node:http";
import {
  EGRESS_VERDICT_HEADER,
  type EgressContext,
  HTTP_BAD_GATEWAY,
  HTTP_BAD_REQUEST,
  refusalFor,
  UNREACHABLE,
  UNRESOLVED,
  vetEgress,
} from "./egress-policy.js";
import { parseWebUrl, targetPort } from "./target-port.js";

const HOP_BY_HOP_HEADERS = ["proxy-connection", "proxy-authorization"];

type Upstream = { address: string; target: URL };

const respond = (res: ServerResponse, status: number, verdict?: string) => {
  if (res.headersSent) {
    res.destroy();
    return;
  }
  const headers = verdict ? { [EGRESS_VERDICT_HEADER]: verdict } : {};
  res.writeHead(status, headers);
  res.end();
};

const upstreamHeaders = (headers: IncomingHttpHeaders, target: URL) => {
  const forwarded: IncomingHttpHeaders = { ...headers, host: target.host };
  for (const name of HOP_BY_HOP_HEADERS) {
    delete forwarded[name];
  }
  return forwarded;
};

const downstreamHeaders = (headers: IncomingHttpHeaders) => {
  const { [EGRESS_VERDICT_HEADER]: _spoofed, ...rest } = headers;
  return rest;
};

const pipeUpstream = (
  req: IncomingMessage,
  res: ServerResponse,
  { address, target }: Upstream,
) => {
  const upstream = request(
    {
      host: address,
      port: targetPort(target),
      method: req.method,
      path: `${target.pathname}${target.search}`,
      headers: upstreamHeaders(req.headers, target),
    },
    (upstreamRes) => {
      res.writeHead(
        upstreamRes.statusCode ?? HTTP_BAD_GATEWAY,
        downstreamHeaders(upstreamRes.headers),
      );
      upstreamRes.pipe(res);
    },
  );
  upstream.on("error", () => respond(res, HTTP_BAD_GATEWAY, UNREACHABLE));
  res.on("close", () => upstream.destroy());
  req.pipe(upstream);
};

const forward = async (
  context: EgressContext,
  req: IncomingMessage,
  res: ServerResponse,
) => {
  const target = parseWebUrl(req.url ?? "");
  if (target?.protocol !== "http:") {
    respond(res, HTTP_BAD_REQUEST);
    return;
  }
  const authority = { host: target.hostname, port: targetPort(target) };
  const verdict = await vetEgress(context, authority);
  if (verdict.kind !== "allowed") {
    const refusal = refusalFor(verdict);
    respond(res, refusal.status, refusal.verdict);
    return;
  }
  pipeUpstream(req, res, { address: verdict.address, target });
};

export const createForwardHandler =
  (context: EgressContext) =>
  async (req: IncomingMessage, res: ServerResponse) => {
    try {
      await forward(context, req, res);
    } catch {
      respond(res, HTTP_BAD_GATEWAY, UNRESOLVED);
    }
  };
