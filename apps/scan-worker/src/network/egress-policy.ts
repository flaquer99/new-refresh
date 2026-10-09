import type { ResolveHost } from "./resolve-host.js";
import { type HostVerdict, vetHost } from "./vet-host.js";

export const EGRESS_VERDICT_HEADER = "x-refresh-egress";
export const BLOCKED_ADDRESS = "blocked-address";
export const UNRESOLVED = "unresolved";
export const UNREACHABLE = "unreachable";
export const HTTP_BAD_REQUEST = 400;
export const HTTP_FORBIDDEN = 403;
export const HTTP_BAD_GATEWAY = 502;

export type EgressBlockedLog = {
  event: "egress.blocked";
  host: string;
  reason: typeof BLOCKED_ADDRESS;
};

export type EgressLogger = {
  warn: (details: EgressBlockedLog, message: string) => void;
};

export type EgressContext = {
  resolve: ResolveHost;
  allowlist: ReadonlySet<string>;
  logger: EgressLogger;
};

export type Authority = { host: string; port: number };

export type Refusal = { status: number; verdict: string };

export const vetEgress = async (
  context: EgressContext,
  { host, port }: Authority,
): Promise<HostVerdict> => {
  const { resolve, allowlist, logger } = context;
  const verdict = await vetHost({ host, port, resolve, allowlist });
  if (verdict.kind === "blocked") {
    logger.warn(
      { event: "egress.blocked", host, reason: BLOCKED_ADDRESS },
      "egress.blocked",
    );
  }
  return verdict;
};

export const refusalFor = (verdict: HostVerdict): Refusal =>
  verdict.kind === "blocked"
    ? { status: HTTP_FORBIDDEN, verdict: BLOCKED_ADDRESS }
    : { status: HTTP_BAD_GATEWAY, verdict: UNRESOLVED };
