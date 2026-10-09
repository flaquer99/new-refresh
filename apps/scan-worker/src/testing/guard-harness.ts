import {
  type FixtureServer,
  serveFixtures,
} from "@refresh/a11y-fixtures/serve-fixtures";
import type { TargetPolicy } from "../audit/settle-refusal.js";
import { type EgressGuard, startEgressGuard } from "../network/egress-guard.js";
import { createRecordingLogger } from "./recording-logger.js";
import { stubResolver } from "./stub-resolver.js";

const EPHEMERAL_PORT = 0;

export type GuardHarness = {
  fixtures: FixtureServer;
  guard: EgressGuard;
  policy: TargetPolicy;
  logger: ReturnType<typeof createRecordingLogger>;
  fixtureAuthority: string;
  close: () => Promise<void>;
};

export const startGuardHarness = async (): Promise<GuardHarness> => {
  const fixtures = await serveFixtures({ port: EPHEMERAL_PORT });
  const logger = createRecordingLogger();
  const fixtureAuthority = new URL(fixtures.origin).host;
  const policy = {
    resolve: stubResolver({ localhost: ["127.0.0.1"] }),
    allowlist: new Set([fixtureAuthority]),
  };
  const guard = await startEgressGuard({ ...policy, logger });
  return {
    fixtures,
    guard,
    policy,
    logger,
    fixtureAuthority,
    close: async () => {
      await guard.close();
      await fixtures.close();
    },
  };
};
