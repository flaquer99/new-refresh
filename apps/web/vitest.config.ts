import { fileURLToPath } from "node:url";
import { baseTestConfig } from "@refresh/config/vitest/base";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vitest/config";

const CONTAINER_STARTUP_TIMEOUT_MS = 120_000;
const DATABASE_TEST_TIMEOUT_MS = 30_000;
const DATABASE_TESTS = "src/**/*.db.test.ts";

export default defineConfig({
	plugins: [react()],
	resolve: {
		alias: {
			"@": fileURLToPath(new URL("./src", import.meta.url)),
			"server-only": fileURLToPath(
				new URL(
					"./node_modules/next/dist/compiled/server-only/empty.js",
					import.meta.url,
				),
			),
		},
	},
	test: {
		coverage: baseTestConfig.coverage,
		unstubEnvs: true,
		unstubGlobals: true,
		restoreMocks: true,
		projects: [
			{
				extends: true,
				test: {
					name: "server",
					include: ["src/{app,server}/**/*.test.ts"],
					exclude: [DATABASE_TESTS],
					environment: "node",
				},
			},
			{
				extends: true,
				test: {
					name: "db",
					include: [DATABASE_TESTS],
					environment: "node",
					globalSetup: ["./src/testing/db-global-setup.ts"],
					fileParallelism: false,
					hookTimeout: CONTAINER_STARTUP_TIMEOUT_MS,
					testTimeout: DATABASE_TEST_TIMEOUT_MS,
				},
			},
			{
				extends: true,
				test: {
					name: "dom",
					include: ["src/{components,hooks,lib}/**/*.test.{ts,tsx}"],
					environment: "jsdom",
					setupFiles: ["./src/testing/setup-dom.ts"],
				},
			},
		],
	},
});
