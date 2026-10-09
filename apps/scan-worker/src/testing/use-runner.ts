import type { ScanReport } from "@refresh/scan-contracts/report";
import { afterAll, beforeAll, vi } from "vitest";
import type { LoadTimeouts } from "../audit/load-page.js";
import {
  createGuardedFetch,
  type GuardedFetchClient,
} from "../network/guarded-fetch.js";
import { browserAuditorFactory } from "../scans/open-browser-auditor.js";
import { createScanRunner } from "../scans/scan-runner.js";
import { type AuditorHarness, startAuditorHarness } from "./auditor-harness.js";
import { createScanRecorder } from "./scan-logger.js";
import { STUB_SCAN_ID } from "./stub-runner-deps.js";

const FAST_TIMEOUTS: LoadTimeouts = { loadMs: 10_000, settleMs: 100 };

type RunnerState = { env?: AuditorHarness; client?: GuardedFetchClient };

export type RunnerFixture = {
  origin: () => string;
  crossOrigin: () => string;
  scan: (url: string, depth: number) => Promise<ScanReport>;
};

const ready = (state: RunnerState) => {
  if (!(state.env && state.client)) {
    throw new Error("Runner harness is not ready; call it inside a test");
  }
  return { env: state.env, client: state.client };
};

const scanWith = (
  { env, client }: ReturnType<typeof ready>,
  request: { url: string; depth: number },
) =>
  createScanRunner({
    openAuditor: browserAuditorFactory({
      browser: env.browser,
      policy: env.harness.policy,
      timeouts: FAST_TIMEOUTS,
    }),
    fetch: client.fetch,
    logger: createScanRecorder(),
    pageDelayMs: 0,
  })({
    scanId: STUB_SCAN_ID,
    request,
    signal: new AbortController().signal,
    onProgress: vi.fn(),
  });

export const useRunner = (): RunnerFixture => {
  const state: RunnerState = {};
  beforeAll(async () => {
    state.env = await startAuditorHarness();
    state.client = createGuardedFetch(state.env.harness.guard);
  });
  afterAll(async () => {
    const { env, client } = ready(state);
    await client.close();
    await env.close();
  });
  const scan = (path: string, depth: number) => {
    const harness = ready(state);
    const { origin } = harness.env;
    const url = path.startsWith("http") ? path : `${origin}${path}`;
    return scanWith(harness, { url, depth });
  };
  return {
    origin: () => ready(state).env.origin,
    crossOrigin: () => ready(state).env.harness.fixtures.crossOrigin,
    scan,
  };
};
