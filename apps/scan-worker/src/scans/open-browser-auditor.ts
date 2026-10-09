import type { Browser } from "playwright";
import { createViewportContexts } from "../audit/create-contexts.js";
import type { LoadTimeouts } from "../audit/load-page.js";
import { createPageAuditor } from "../audit/page-auditor.js";
import type { TargetPolicy } from "../audit/settle-refusal.js";
import type { ScanAuditor } from "./scan-runner.js";

export type BrowserAuditorOptions = {
  browser: Browser;
  policy: TargetPolicy;
  timeouts?: LoadTimeouts;
};

export const browserAuditorFactory =
  ({ browser, policy, timeouts }: BrowserAuditorOptions) =>
  async (): Promise<ScanAuditor> => {
    const contexts = await createViewportContexts(browser);
    const { audit } = createPageAuditor({ contexts, policy, timeouts });
    return { audit, close: contexts.close };
  };
