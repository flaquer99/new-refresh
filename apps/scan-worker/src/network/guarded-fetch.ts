import { fetch, ProxyAgent, type Response } from "undici";
import type { EgressGuard } from "./egress-guard.js";

export type GuardedFetchInit = {
  signal?: AbortSignal;
  headers?: Record<string, string>;
};

export type GuardedFetch = (
  url: string,
  init?: GuardedFetchInit,
) => Promise<Response>;

export type GuardedFetchClient = {
  fetch: GuardedFetch;
  close: () => Promise<void>;
};

export const createGuardedFetch = (
  guard: Pick<EgressGuard, "url">,
): GuardedFetchClient => {
  const dispatcher = new ProxyAgent({ uri: guard.url });
  return {
    fetch: (url, init) =>
      fetch(url, {
        signal: init?.signal,
        headers: init?.headers,
        dispatcher,
      }),
    close: () => dispatcher.close(),
  };
};
