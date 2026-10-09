import { createViewportContexts } from "../audit/create-contexts.js";
import type { LoadTimeouts } from "../audit/load-page.js";
import { createPageAuditor, type PageAuditor } from "../audit/page-auditor.js";
import { launchGuardedBrowser } from "../browser/launch-browser.js";
import { startEgressGuard } from "../network/egress-guard.js";
import { createRecordingLogger } from "./recording-logger.js";
import { stubResolver } from "./stub-resolver.js";

export const SHORT_TIMEOUTS: LoadTimeouts = { loadMs: 1000, settleMs: 300 };

export type CustomAuditor = {
  auditor: PageAuditor;
  close: () => Promise<void>;
};

export const startCustomAuditor = async (
  allowedAuthorities: readonly string[],
): Promise<CustomAuditor> => {
  const policy = {
    resolve: stubResolver(),
    allowlist: new Set(allowedAuthorities),
  };
  const guard = await startEgressGuard({
    ...policy,
    logger: createRecordingLogger(),
  });
  const browser = await launchGuardedBrowser(guard);
  const contexts = await createViewportContexts(browser);
  return {
    auditor: createPageAuditor({
      contexts,
      policy,
      timeouts: SHORT_TIMEOUTS,
    }),
    close: async () => {
      await browser.close();
      await guard.close();
    },
  };
};
