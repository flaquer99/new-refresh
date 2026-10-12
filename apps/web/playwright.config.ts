import { defineConfig, devices } from "@playwright/test";
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
		{
			name: "tablet-chromium",
			testMatch: THEME_COVERAGE_SPECS,
			use: { ...devices["Desktop Chrome"], viewport: TABLET_VIEWPORT },
		},
		{
			name: "desktop-dark",
			testMatch: THEME_COVERAGE_SPECS,
			use: {
				...devices["Desktop Chrome"],
				viewport: DESKTOP_VIEWPORT,
				colorScheme: "dark",
			},
		},
		{
			name: "tablet-dark",
			testMatch: THEME_COVERAGE_SPECS,
			use: {
				...devices["Desktop Chrome"],
				viewport: TABLET_VIEWPORT,
				colorScheme: "dark",
			},
		},
		{
			name: "mobile-dark",
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
