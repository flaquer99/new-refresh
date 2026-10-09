import type { ResolveHost } from "./resolve-host.js";
import { TargetNotAllowedError } from "./target-not-allowed-error.js";
import { parseWebUrl, targetPort } from "./target-port.js";
import { vetHost } from "./vet-host.js";

export type ValidateTargetInput = {
  url: string;
  resolve: ResolveHost;
  allowlist: ReadonlySet<string>;
};

export const validateTarget = async ({
  url,
  resolve,
  allowlist,
}: ValidateTargetInput): Promise<void> => {
  const target = parseWebUrl(url);
  if (target === null) {
    throw new TargetNotAllowedError();
  }
  const verdict = await vetHost({
    host: target.hostname,
    port: targetPort(target),
    resolve,
    allowlist,
  });
  if (verdict.kind === "blocked") {
    throw new TargetNotAllowedError();
  }
};
