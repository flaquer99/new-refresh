import { defineConfig, devices } from "@playwright/test";
import { WEB_ORIGIN } from "./e2e/support/ports";
import { WEB_SERVERS } from "./e2e/support/servers";

const TEST_TIMEOUT_MS = 90_000;
const MOBILE_VIEWPORT = { width: 320, height: 640 };
const DESKTOP_VIEWPORT = { width: 1280, height: 800 };
const isCi = Boolean(process.env.CI);

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
			testMatch: [
				"dogfooding.spec.ts",
				"dogfooding-persistence.spec.ts",
				"scan-journey.spec.ts",
			],
			use: { ...devices["Desktop Chrome"], viewport: MOBILE_VIEWPORT },
		},
	],
	webServer: WEB_SERVERS,
});
