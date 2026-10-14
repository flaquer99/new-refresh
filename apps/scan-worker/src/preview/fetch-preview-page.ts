import {
  PREVIEW_FETCH_TIMEOUT_MS,
  type PreviewFetchResult,
} from "@refresh/scan-contracts/preview";
import type { TargetPolicy } from "../audit/settle-refusal.js";
import type { GuardedFetch } from "../network/guarded-fetch.js";
import { validateTarget } from "../network/validate-target.js";
import { unavailable } from "./classify-preview-response.js";
import {
  logPreviewFetched,
  type PreviewLogger,
} from "./log-preview-fetched.js";
import { mapFetchError } from "./map-fetch-error.js";
import {
  type PreviewOutcome,
  settlePreviewResponse,
} from "./settle-preview-response.js";

const ACCEPT_HEADER = "text/html,application/xhtml+xml;q=0.9,*/*;q=0.1";

export type FetchPreviewPageInput = {
  url: string;
  fetch: GuardedFetch;
  policy: TargetPolicy;
  userAgent: string;
  logger: PreviewLogger;
  clientIdHash?: string;
};

const attemptFetch = async (
  input: FetchPreviewPageInput,
  signal: AbortSignal,
): Promise<PreviewOutcome> => {
  const response = await input.fetch(input.url, {
    signal,
    headers: { "user-agent": input.userAgent, accept: ACCEPT_HEADER },
  });
  return settlePreviewResponse(response);
};

const runTimedFetch = async (
  input: FetchPreviewPageInput,
): Promise<PreviewOutcome> => {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), PREVIEW_FETCH_TIMEOUT_MS);
  try {
    return await attemptFetch(input, controller.signal);
  } catch {
    const { url, policy } = input;
    const aborted = controller.signal.aborted;
    return { result: await mapFetchError({ aborted, url, policy }), bytes: 0 };
  } finally {
    clearTimeout(timer);
  }
};

const refuseBlockedTarget = async (
  input: FetchPreviewPageInput,
): Promise<PreviewOutcome | null> => {
  try {
    await validateTarget({ url: input.url, ...input.policy });
    return null;
  } catch {
    return { result: unavailable("blocked-address"), bytes: 0 };
  }
};

export const fetchPreviewPage = async (
  input: FetchPreviewPageInput,
): Promise<PreviewFetchResult> => {
  const startedAt = Date.now();
  const refused = await refuseBlockedTarget(input);
  const outcome = refused ?? (await runTimedFetch(input));
  const { url, logger, clientIdHash } = input;
  const durationMs = Date.now() - startedAt;
  logPreviewFetched({ ...outcome, durationMs, url, logger, clientIdHash });
  return outcome.result;
};
