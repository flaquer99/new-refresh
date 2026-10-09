import { resetScans } from "@refresh/db/testing/seed-scans";
import { afterEach, beforeEach, inject, vi } from "vitest";
import { closeScanStore } from "@/server/db/scan-store";
import { DATABASE_URL_KEY } from "./database-url-key";

export const useTestDatabase = () => {
	beforeEach(async () => {
		const databaseUrl = inject(DATABASE_URL_KEY);
		await resetScans(databaseUrl);
		vi.stubEnv("DATABASE_URL", databaseUrl);
	});
	afterEach(async () => {
		await closeScanStore();
	});
};
