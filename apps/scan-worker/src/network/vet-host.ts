import { isPublicAddress } from "./ip-policy.js";
import { type ResolveHost, stripBrackets } from "./resolve-host.js";

export type HostVerdict =
  | { kind: "allowed"; address: string }
  | { kind: "blocked" }
  | { kind: "unresolved" };

export type VetHostInput = {
  host: string;
  port: number;
  resolve: ResolveHost;
  allowlist: ReadonlySet<string>;
};

export const allowlistKey = (host: string, port: number): string =>
  `${stripBrackets(host).toLowerCase()}:${port}`;

export const vetHost = async ({
  host,
  port,
  resolve,
  allowlist,
}: VetHostInput): Promise<HostVerdict> => {
  const addresses = await resolve(host);
  const [first] = addresses;
  if (first === undefined) {
    return { kind: "unresolved" };
  }
  if (allowlist.has(allowlistKey(host, port))) {
    return { kind: "allowed", address: first };
  }
  if (!addresses.every(isPublicAddress)) {
    return { kind: "blocked" };
  }
  return { kind: "allowed", address: first };
};
