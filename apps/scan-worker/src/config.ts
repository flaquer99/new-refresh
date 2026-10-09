import type { z } from "zod";
import { EnvSchema, type LOG_LEVELS, type ParsedEnv } from "./config-env.js";

const DISTINCT_TOKENS_MESSAGE =
  "SCAN_CALLBACK_TOKEN must differ from SCAN_WORKER_TOKEN";

export type WorkerConfig = {
  host: string;
  port: number;
  token: string;
  callbackUrl: string;
  callbackToken: string;
  egressAllowlist: ReadonlySet<string>;
  logLevel: (typeof LOG_LEVELS)[number];
};

export type WorkerEnv = Readonly<Record<string, string | undefined>>;

const describeIssues = (error: z.ZodError): string =>
  error.issues
    .map((issue) => `${issue.path.join(".")} ${issue.message}`)
    .join("; ");

const assertSafeEnvironment = (env: ParsedEnv) => {
  if (env.NODE_ENV === "production" && env.SCAN_EGRESS_ALLOWLIST.length > 0) {
    throw new Error(
      "SCAN_EGRESS_ALLOWLIST must not be set when NODE_ENV=production",
    );
  }
  if (env.SCAN_CALLBACK_TOKEN === env.SCAN_WORKER_TOKEN) {
    throw new Error(DISTINCT_TOKENS_MESSAGE);
  }
};

export const loadConfig = (env: WorkerEnv): WorkerConfig => {
  const parsed = EnvSchema.safeParse(env);
  if (!parsed.success) {
    throw new Error(`Invalid worker config: ${describeIssues(parsed.error)}`);
  }
  assertSafeEnvironment(parsed.data);
  return {
    host: parsed.data.SCAN_WORKER_HOST,
    port: parsed.data.SCAN_WORKER_PORT,
    token: parsed.data.SCAN_WORKER_TOKEN,
    callbackUrl: parsed.data.SCAN_CALLBACK_URL,
    callbackToken: parsed.data.SCAN_CALLBACK_TOKEN,
    egressAllowlist: new Set(parsed.data.SCAN_EGRESS_ALLOWLIST),
    logLevel: parsed.data.LOG_LEVEL,
  };
};
