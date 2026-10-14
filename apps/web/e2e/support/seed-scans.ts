import { execFileSync } from "node:child_process";
import { resolve } from "node:path";
import type { TestUser } from "./clerk-users";

const SEED_SCRIPT = resolve("e2e/support/seed-database.mts");

export type ScanOwnerInput = {
	organizationId: string;
	startedByUserId: string;
	startedByName: string | null;
};

export const ownerOf = (user: TestUser): ScanOwnerInput => {
	if (!user.organizationId) {
		throw new Error(`${user.email} has no organization to own scans.`);
	}
	return {
		organizationId: user.organizationId,
		startedByUserId: user.id,
		startedByName: user.fullName,
	};
};

const runSeedScript = (args: readonly string[]): string =>
	execFileSync(process.execPath, [SEED_SCRIPT, ...args], {
		encoding: "utf8",
		env: process.env,
	});

export const seedNewestScans = (
	count: number,
	startUrl: string,
	owner: ScanOwnerInput,
): string[] =>
	JSON.parse(
		runSeedScript(["seed", String(count), startUrl, JSON.stringify(owner)]),
	) as string[];

export const removeScans = (scanIds: readonly string[]): void => {
	if (scanIds.length > 0) {
		runSeedScript(["remove", ...scanIds]);
	}
};
