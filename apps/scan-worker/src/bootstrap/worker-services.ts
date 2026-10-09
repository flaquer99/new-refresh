import type { FastifyInstance } from "fastify";
import type { Browser } from "playwright";
import type { TargetPolicy } from "../audit/settle-refusal.js";
import {
  type BrowserSupervisor,
  superviseBrowser,
} from "../browser/browser-supervisor.js";
import { createResultNotifier } from "../callback/result-notifier.js";
import type { WorkerConfig } from "../config.js";
import type { EgressGuard, StartEgressGuard } from "../network/egress-guard.js";
import {
  createGuardedFetch,
  type GuardedFetchClient,
} from "../network/guarded-fetch.js";
import type { ResolveHost } from "../network/resolve-host.js";
import { validateTarget } from "../network/validate-target.js";
import { disconnectAwareAuditor } from "../scans/disconnect-aware-auditor.js";
import { browserAuditorFactory } from "../scans/open-browser-auditor.js";
import {
  createScanRegistry,
  type ScanRegistry,
} from "../scans/scan-registry.js";
import { createScanRunner } from "../scans/scan-runner.js";
import type { ServerDeps } from "../server/server-deps.js";

export type WorkerRuntime = {
  startGuard: StartEgressGuard;
  launchBrowser: (guard: Pick<EgressGuard, "url">) => Promise<Browser>;
  resolve: ResolveHost;
};

export type WorkerServices = {
  guard: EgressGuard;
  browser: BrowserSupervisor<Browser>;
  fetchClient: GuardedFetchClient;
  registry: ScanRegistry;
};

export type StartServicesInput = {
  app: FastifyInstance;
  config: WorkerConfig;
  runtime: WorkerRuntime;
};

const supervisedAuditorFactory =
  (supervisor: BrowserSupervisor<Browser>, policy: TargetPolicy) =>
  async () => {
    const browser = supervisor.current();
    const auditor = await browserAuditorFactory({ browser, policy })();
    return disconnectAwareAuditor(auditor, browser);
  };

export const startServices = async ({
  app,
  config,
  runtime,
}: StartServicesInput): Promise<WorkerServices> => {
  const policy = {
    resolve: runtime.resolve,
    allowlist: config.egressAllowlist,
  };
  const guard = await runtime.startGuard({ ...policy, logger: app.log });
  const launch = () => runtime.launchBrowser(guard);
  const browser = await superviseBrowser({ launch, logger: app.log });
  const fetchClient = createGuardedFetch(guard);
  const runner = createScanRunner({
    openAuditor: supervisedAuditorFactory(browser, policy),
    fetch: fetchClient.fetch,
    logger: app.log,
  });
  const notifier = createResultNotifier({
    url: config.callbackUrl,
    token: config.callbackToken,
    logger: app.log,
  });
  const registry = createScanRegistry({ runner, logger: app.log, notifier });
  return { guard, browser, fetchClient, registry };
};

export const serverDeps = (
  { config, runtime }: Omit<StartServicesInput, "app">,
  { browser, registry }: WorkerServices,
): ServerDeps => ({
  registry,
  token: config.token,
  browserConnected: browser.isConnected,
  validateTarget: (url) =>
    validateTarget({
      url,
      resolve: runtime.resolve,
      allowlist: config.egressAllowlist,
    }),
});
