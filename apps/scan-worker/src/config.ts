import { z } from "zod";

const DEFAULT_HOST = "127.0.0.1";
const DEFAULT_PORT = 3001;
const MAX_PORT = 65_535;
const MIN_TOKEN_LENGTH = 32;
const DEFAULT_LOG_LEVEL = "info";
const LOG_LEVELS = [
  "fatal",
  "error",
  "warn",
  "info",
  "debug",
  "trace",
] as const;
const ALLOWLIST_ENTRY = /^[^\s:]+:\d+$/;

export type WorkerConfig = {
  host: string;
  port: number;
  token: string;
  egressAllowlist: ReadonlySet<string>;
  logLevel: (typeof LOG_LEVELS)[number];
};

export type WorkerEnv = Readonly<Record<string, string | undefined>>;

const parseAllowlist = (raw: string): string[] =>
  raw
    .split(",")
    .map((entry) => entry.trim().toLowerCase())
    .filter((entry) => entry.length > 0);

const AllowlistSchema = z
  .string()
  .default("")
  .transform(parseAllowlist)
  .refine((entries) => entries.every((entry) => ALLOWLIST_ENTRY.test(entry)), {
    message: "every entry must be host:port",
  });

const EnvSchema = z.object({
  SCAN_WORKER_HOST: z.string().min(1).default(DEFAULT_HOST),
  SCAN_WORKER_PORT: z.coerce
    .number()
    .int()
    .min(0)
    .max(MAX_PORT)
    .default(DEFAULT_PORT),
  SCAN_WORKER_TOKEN: z
    .string({ error: "is required" })
    .min(MIN_TOKEN_LENGTH, `must be at least ${MIN_TOKEN_LENGTH} characters`),
  SCAN_EGRESS_ALLOWLIST: AllowlistSchema,
  LOG_LEVEL: z.enum(LOG_LEVELS).default(DEFAULT_LOG_LEVEL),
  NODE_ENV: z.string().optional(),
});

type ParsedEnv = z.infer<typeof EnvSchema>;

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
    egressAllowlist: new Set(parsed.data.SCAN_EGRESS_ALLOWLIST),
    logLevel: parsed.data.LOG_LEVEL,
  };
};
