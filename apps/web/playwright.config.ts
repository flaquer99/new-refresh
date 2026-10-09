import { randomBytes } from "node:crypto";
import { defineConfig, devices } from "@playwright/test";
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
} from "./e2e/support/ports";

const TOKEN_BYTES = 32;
const TEST_TIMEOUT_MS = 90_000;
const SERVER_START_TIMEOUT_MS = 60_000;
const WEB_BUILD_TIMEOUT_MS = 300_000;
const SHUTDOWN_GRACE_MS = 5000;
const MOBILE_VIEWPORT = { width: 320, height: 640 };
const DESKTOP_VIEWPORT = { width: 1280, height: 800 };
const isCi = Boolean(process.env.CI);

process.env.E2E_SCAN_WORKER_TOKEN ??= randomBytes(TOKEN_BYTES).toString("hex");
const token = process.env.E2E_SCAN_WORKER_TOKEN;
const gracefulShutdown = {
	signal: "SIGTERM",
	timeout: SHUTDOWN_GRACE_MS,
} as const;

export default defineConfig({
	testDir: "./e2e",
	timeout: TEST_TIMEOUT_MS,
	fullyParallel: false,
	workers: 1,
	forbidOnly: isCi,
	retries: 0,
	reporter: "list",
	use: { baseURL: WEB_ORIGIN, trace: "retain-on-failure" },
	projects: [
		{
			name: "desktop-chromium",
			use: { ...devices["Desktop Chrome"], viewport: DESKTOP_VIEWPORT },
		},
		{
			name: "mobile-chromium",
			testMatch: ["dogfooding.spec.ts", "scan-journey.spec.ts"],
			use: { ...devices["Desktop Chrome"], viewport: MOBILE_VIEWPORT },
		},
	],
	webServer: [
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
				SCAN_WORKER_TOKEN: token,
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
			env: { SCAN_WORKER_URL: WORKER_ORIGIN, SCAN_WORKER_TOKEN: token },
			gracefulShutdown,
			timeout: WEB_BUILD_TIMEOUT_MS,
		},
	],
});
