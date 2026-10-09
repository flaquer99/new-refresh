import { fileURLToPath } from "node:url";
import { baseTestConfig } from "@refresh/config/vitest/base";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vitest/config";

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
					environment: "node",
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
