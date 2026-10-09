import type { ResolveHost } from "../network/resolve-host.js";
import { parseWebUrl, targetPort } from "../network/target-port.js";
import { vetHost } from "../network/vet-host.js";
import { failed, type LoadRejection } from "./classify-response.js";

export type TargetPolicy = {
  resolve: ResolveHost;
  allowlist: ReadonlySet<string>;
};

const isBlockedTarget = async (
  url: string,
  { resolve, allowlist }: TargetPolicy,
): Promise<boolean> => {
  const target = parseWebUrl(url);
  if (target === null) {
    return false;
  }
  const verdict = await vetHost({
    host: target.hostname,
    port: targetPort(target),
    resolve,
    allowlist,
  });
  return verdict.kind === "blocked";
};

export const settleRefusal = async (
  rejection: LoadRejection,
  policy: TargetPolicy,
): Promise<LoadRejection> => {
  if (rejection.kind !== "failed" || rejection.refusedUrl === undefined) {
    return rejection;
  }
  const blocked = await isBlockedTarget(rejection.refusedUrl, policy);
  return failed(blocked ? "blocked-address" : "network-error");
};
