import { z } from "zod";

const DEFAULT_HOST = "127.0.0.1";
const DEFAULT_PORT = 3001;
const MAX_PORT = 65_535;
const MIN_TOKEN_LENGTH = 32;
const DEFAULT_LOG_LEVEL = "info";
export const LOG_LEVELS = [
  "fatal",
  "error",
  "warn",
  "info",
  "debug",
  "trace",
] as const;
const ALLOWLIST_ENTRY = /^[^\s:]+:\d+$/;
const HTTP_PROTOCOL = /^https?$/;
const DEFAULT_CALLBACK_URL = "http://127.0.0.1:3000/api/internal/scans";
const TOKEN_LENGTH_MESSAGE = `must be at least ${MIN_TOKEN_LENGTH} characters`;

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

const TokenSchema = z
  .string({ error: "is required" })
  .min(MIN_TOKEN_LENGTH, TOKEN_LENGTH_MESSAGE);

export const EnvSchema = z.object({
  SCAN_WORKER_HOST: z.string().min(1).default(DEFAULT_HOST),
  SCAN_WORKER_PORT: z.coerce
    .number()
    .int()
    .min(0)
    .max(MAX_PORT)
    .default(DEFAULT_PORT),
  SCAN_WORKER_TOKEN: TokenSchema,
  SCAN_CALLBACK_URL: z
    .url({ protocol: HTTP_PROTOCOL, error: "must be an http(s) URL" })
    .default(DEFAULT_CALLBACK_URL),
  SCAN_CALLBACK_TOKEN: TokenSchema,
  SCAN_EGRESS_ALLOWLIST: AllowlistSchema,
  LOG_LEVEL: z.enum(LOG_LEVELS).default(DEFAULT_LOG_LEVEL),
  NODE_ENV: z.string().optional(),
});

export type ParsedEnv = z.infer<typeof EnvSchema>;
