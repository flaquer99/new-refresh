import { execFileSync } from "node:child_process";
import { resolve } from "node:path";

const SEED_SCRIPT = resolve("e2e/support/seed-database.mts");

const runSeedScript = (args: readonly string[]): string =>
	execFileSync(process.execPath, [SEED_SCRIPT, ...args], {
		encoding: "utf8",
		env: process.env,
	});

export const seedNewestScans = (count: number, startUrl: string): string[] =>
	JSON.parse(runSeedScript(["seed", String(count), startUrl])) as string[];

export const removeScans = (scanIds: readonly string[]): void => {
	if (scanIds.length > 0) {
		runSeedScript(["remove", ...scanIds]);
	}
};
