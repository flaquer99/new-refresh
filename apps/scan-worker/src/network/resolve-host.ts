import { lookup } from "node:dns/promises";

export type ResolveHost = (host: string) => Promise<string[]>;

const BRACKETED_HOST = /^\[(.*)\]$/;

export const stripBrackets = (host: string): string =>
  host.replace(BRACKETED_HOST, "$1");

export const resolveHost: ResolveHost = async (host) => {
  try {
    const entries = await lookup(stripBrackets(host), {
      all: true,
      order: "verbatim",
    });
    return entries.map((entry) => entry.address);
  } catch {
    return [];
  }
};
