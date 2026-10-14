import { test as base } from "@playwright/test";
import { readWorld, type World } from "./clerk-world";
import { CLOSED_ORIGIN, FIXTURES_ORIGIN } from "./ports";
import { ScanApp } from "./scan-app";
import { ownerOf, removeScans, seedPreviewScan } from "./seed-scans";
import { signInAs } from "./sign-in";
import { createTeam, destroyTeam, type Team } from "./team";

export type Actor = "admin" | "member" | "outsider" | "visitor";

type ScanOptions = {
	actor: Actor;
};

type ScanFixtures = {
	app: ScanApp;
	world: World;
	team: Team;
	previewScanPath: string;
};

export const test = base.extend<ScanOptions & ScanFixtures>({
	actor: ["admin", { option: true }],
	// biome-ignore lint/correctness/noEmptyPattern: Playwright requires destructuring
	world: async ({}, use) => {
		await use(readWorld());
	},
	// biome-ignore lint/correctness/noEmptyPattern: Playwright requires destructuring
	team: async ({}, use) => {
		const team = await createTeam();
		await use(team);
		await destroyTeam(team);
	},
	page: async ({ page, world, actor }, use) => {
		if (actor !== "visitor") {
			await signInAs(page, world[actor]);
		}
		await use(page);
	},
	previewScanPath: async ({ page: _page, world }, use) => {
		const scanId = seedPreviewScan({
			origins: { fixtures: FIXTURES_ORIGIN, closed: CLOSED_ORIGIN },
			owner: ownerOf(world.admin),
		});
		await use(`/scans/${scanId}`);
		removeScans([scanId]);
	},
	app: async ({ page }, use) => {
		const app = new ScanApp(page);
		await app.open();
		await use(app);
	},
});

export { expect } from "@playwright/test";
