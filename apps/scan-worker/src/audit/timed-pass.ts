import type { Viewport } from "@refresh/scan-contracts/findings";
import { auditViewport, type ViewportAudit } from "./audit-viewport.js";
import type { LoadRejection } from "./classify-response.js";
import type { ViewportContexts } from "./create-contexts.js";
import type { LoadTimeouts } from "./load-page.js";

export type PassDurations = Partial<Record<Viewport, number>>;

export type TimedPassInput = {
  contexts: ViewportContexts;
  timeouts: LoadTimeouts;
  url: string;
  viewport: Viewport;
};

const LINK_VIEWPORT: Viewport = "desktop";

export const timedPass = async (
  { contexts, timeouts, url, viewport }: TimedPassInput,
  durationsMs: PassDurations,
): Promise<ViewportAudit | LoadRejection> => {
  const startedMs = Date.now();
  const pass = await auditViewport({
    context: contexts[viewport],
    viewport,
    url,
    timeouts,
    collectLinks: viewport === LINK_VIEWPORT,
  });
  durationsMs[viewport] = Date.now() - startedMs;
  return pass;
};
