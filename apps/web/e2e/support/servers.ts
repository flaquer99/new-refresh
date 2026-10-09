import { randomBytes } from "node:crypto";
import type { PlaywrightTestConfig } from "@playwright/test";
import {
	CLOSED_PORT,
	FIXTURES_ORIGIN,
	FIXTURES_PORT,
	hostPort,
	LOOPBACK_HOST,
	WEB_ORIGIN,
	WEB_PORT,
	WORKER_ORIGIN,
	WORKER_PORT,
} from "./ports";

const TOKEN_BYTES = 32;
const SERVER_START_TIMEOUT_MS = 60_000;
const DATABASE_START_TIMEOUT_MS = 120_000;
const WEB_BUILD_TIMEOUT_MS = 300_000;
const SHUTDOWN_GRACE_MS = 5000;
const DATABASE_URL_LINE = /DATABASE_URL=(?<database_url>\S+)/;

const newToken = (): string => randomBytes(TOKEN_BYTES).toString("hex");

process.env.E2E_SCAN_WORKER_TOKEN ??= newToken();
process.env.E2E_SCAN_CALLBACK_TOKEN ??= newToken();
const workerToken = process.env.E2E_SCAN_WORKER_TOKEN;
const callbackToken = process.env.E2E_SCAN_CALLBACK_TOKEN;
const gracefulShutdown = {
	signal: "SIGTERM",
	timeout: SHUTDOWN_GRACE_MS,
} as const;

export const WEB_SERVERS: PlaywrightTestConfig["webServer"] = [
	{
		name: "database",
		command: "node e2e/support/start-database.mts",
		wait: { stdout: DATABASE_URL_LINE },
		gracefulShutdown,
		timeout: DATABASE_START_TIMEOUT_MS,
	},
	{
		name: "fixtures",
		command: "node e2e/support/serve-fixtures.mts",
		url: `${FIXTURES_ORIGIN}/clean/`,
		env: { E2E_FIXTURES_PORT: String(FIXTURES_PORT) },
		gracefulShutdown,
		timeout: SERVER_START_TIMEOUT_MS,
	},
	{
		name: "worker",
		command: "pnpm --filter @refresh/scan-worker start",
		url: `${WORKER_ORIGIN}/health`,
		env: {
			NODE_ENV: "test",
			SCAN_WORKER_HOST: LOOPBACK_HOST,
			SCAN_WORKER_PORT: String(WORKER_PORT),
			SCAN_WORKER_TOKEN: workerToken,
			SCAN_CALLBACK_URL: `${WEB_ORIGIN}/api/internal/scans`,
			SCAN_CALLBACK_TOKEN: callbackToken,
			SCAN_EGRESS_ALLOWLIST: [FIXTURES_PORT, WEB_PORT, CLOSED_PORT]
				.map(hostPort)
				.join(","),
			LOG_LEVEL: "warn",
		},
		gracefulShutdown,
		timeout: SERVER_START_TIMEOUT_MS,
	},
	{
		name: "web",
		command: `next build && next start --hostname ${LOOPBACK_HOST} --port ${WEB_PORT}`,
		url: WEB_ORIGIN,
		env: {
			SCAN_WORKER_URL: WORKER_ORIGIN,
			SCAN_WORKER_TOKEN: workerToken,
			SCAN_CALLBACK_TOKEN: callbackToken,
		},
		gracefulShutdown,
		timeout: WEB_BUILD_TIMEOUT_MS,
	},
];
