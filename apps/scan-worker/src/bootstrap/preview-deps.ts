import type { PreviewFetchResult } from "@refresh/scan-contracts/preview";
import type { FastifyBaseLogger } from "fastify";
import type { TargetPolicy } from "../audit/settle-refusal.js";
import { USER_AGENT_SUFFIX } from "../audit/viewports.js";
import type { GuardedFetch } from "../network/guarded-fetch.js";
import { fetchPreviewPage } from "../preview/fetch-preview-page.js";
import { clientIdHash } from "../server/client-id.js";

const PREVIEW_USER_AGENT = `Mozilla/5.0 ${USER_AGENT_SUFFIX}`;

export type PreviewDepsInput = {
  fetch: GuardedFetch;
  policy: TargetPolicy;
  logger: FastifyBaseLogger;
};

export const createFetchPreview =
  ({ fetch, policy, logger }: PreviewDepsInput) =>
  (url: string, clientId: string): Promise<PreviewFetchResult> =>
    fetchPreviewPage({
      url,
      fetch,
      policy,
      logger,
      userAgent: PREVIEW_USER_AGENT,
      clientIdHash: clientIdHash(clientId),
    });
