import { defineConfig, devices } from "@playwright/test";
import { exposeClerkKeysToTestRunner } from "./e2e/support/clerk-env";
import { WEB_ORIGIN } from "./e2e/support/ports";
import { WEB_SERVERS } from "./e2e/support/servers";

const TEST_TIMEOUT_MS = 90_000;
const MOBILE_VIEWPORT = { width: 320, height: 640 };
const TABLET_VIEWPORT = { width: 768, height: 1024 };
const DESKTOP_VIEWPORT = { width: 1280, height: 800 };
const THEME_COVERAGE_SPECS = [
	"dogfooding.spec.ts",
	"dogfooding-persistence.spec.ts",
	"theme.spec.ts",
	"theme-first-paint.spec.ts",
];
const isCi = Boolean(process.env.CI);
const SETUP_PROJECT = "clerk-setup";
const TEARDOWN_PROJECT = "clerk-teardown";

exposeClerkKeysToTestRunner();

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
			name: SETUP_PROJECT,
			testMatch: "clerk.setup.ts",
			teardown: TEARDOWN_PROJECT,
		},
		{ name: TEARDOWN_PROJECT, testMatch: "clerk.teardown.ts" },
		{
			name: "desktop-chromium",
			dependencies: [SETUP_PROJECT],
			use: { ...devices["Desktop Chrome"], viewport: DESKTOP_VIEWPORT },
		},
		{
			name: "mobile-chromium",
			dependencies: [SETUP_PROJECT],
			testMatch: [
				"dogfooding.spec.ts",
				"dogfooding-persistence.spec.ts",
				"scan-journey.spec.ts",
			],
			use: { ...devices["Desktop Chrome"], viewport: MOBILE_VIEWPORT },
		},
		{
			name: "tablet-chromium",
			dependencies: [SETUP_PROJECT],
			testMatch: THEME_COVERAGE_SPECS,
			use: { ...devices["Desktop Chrome"], viewport: TABLET_VIEWPORT },
		},
		{
			name: "desktop-dark",
			dependencies: [SETUP_PROJECT],
			testMatch: THEME_COVERAGE_SPECS,
			use: {
				...devices["Desktop Chrome"],
				viewport: DESKTOP_VIEWPORT,
				colorScheme: "dark",
			},
		},
		{
			name: "tablet-dark",
			dependencies: [SETUP_PROJECT],
			testMatch: THEME_COVERAGE_SPECS,
			use: {
				...devices["Desktop Chrome"],
				viewport: TABLET_VIEWPORT,
				colorScheme: "dark",
			},
		},
		{
			name: "mobile-dark",
			dependencies: [SETUP_PROJECT],
			testMatch: THEME_COVERAGE_SPECS,
			use: {
				...devices["Desktop Chrome"],
				viewport: MOBILE_VIEWPORT,
				colorScheme: "dark",
			},
		},
	],
	webServer: WEB_SERVERS,
});
