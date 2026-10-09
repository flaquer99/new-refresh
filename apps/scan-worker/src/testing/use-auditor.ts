import { afterAll, afterEach, beforeAll, beforeEach } from "vitest";
import {
  createViewportContexts,
  type ViewportContexts,
} from "../audit/create-contexts.js";
import type { PageAuditResult } from "../audit/page-audit-result.js";
import { createPageAuditor } from "../audit/page-auditor.js";
import { type AuditorHarness, startAuditorHarness } from "./auditor-harness.js";

type AuditorState = { env?: AuditorHarness; contexts?: ViewportContexts };

export type AuditorFixture = {
  origin: () => string;
  crossOrigin: () => string;
  contexts: () => ViewportContexts;
  audit: (path: string) => Promise<PageAuditResult>;
};

const required = <T>(value: T | undefined, name: string): T => {
  if (value === undefined) {
    throw new Error(`${name} is not ready; call it inside a test`);
  }
  return value;
};

export const useAuditor = (): AuditorFixture => {
  const state: AuditorState = {};
  beforeAll(async () => {
    state.env = await startAuditorHarness();
  });
  afterAll(() => required(state.env, "harness").close());
  beforeEach(async () => {
    state.contexts = await createViewportContexts(
      required(state.env, "harness").browser,
    );
  });
  afterEach(() => required(state.contexts, "contexts").close());
  const env = () => required(state.env, "harness");
  const contexts = () => required(state.contexts, "contexts");
  return {
    origin: () => env().origin,
    crossOrigin: () => env().harness.fixtures.crossOrigin,
    contexts,
    audit: (path) =>
      createPageAuditor({
        contexts: contexts(),
        policy: env().harness.policy,
      }).audit({
        url: path.startsWith("http") ? path : `${env().origin}${path}`,
        isStartPage: true,
      }),
  };
};
