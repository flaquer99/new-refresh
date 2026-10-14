import type { PreviewFetchResult } from "@refresh/scan-contracts/preview";
import type { TargetPolicy } from "../audit/settle-refusal.js";
import { parseWebUrl, targetPort } from "../network/target-port.js";
import { vetHost } from "../network/vet-host.js";
import { unavailable } from "./classify-preview-response.js";

export type MapFetchErrorInput = {
  aborted: boolean;
  url: string;
  policy: TargetPolicy;
};

const isBlocked = async (url: string, policy: TargetPolicy) => {
  const target = parseWebUrl(url);
  if (target === null) {
    return false;
  }
  const verdict = await vetHost({
    host: target.hostname,
    port: targetPort(target),
    ...policy,
  });
  return verdict.kind === "blocked";
};

export const mapFetchError = async ({
  aborted,
  url,
  policy,
}: MapFetchErrorInput): Promise<PreviewFetchResult> => {
  if (aborted) {
    return unavailable("timeout");
  }
  const blocked = await isBlocked(url, policy).catch(() => false);
  return unavailable(blocked ? "blocked-address" : "network-error");
};
