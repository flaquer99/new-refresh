import { createScanStore } from "@refresh/db/scan-store";
import { afterEach, describe, expect, it, vi } from "vitest";
import { createFakeScanStore } from "@/testing/fake-scan-store";
import { closeScanStore, getScanStore } from "./scan-store";

vi.mock("@refresh/db/scan-store", () => ({ createScanStore: vi.fn() }));

const DATABASE_URL = "postgresql://refresh:refresh@127.0.0.1:5432/refresh";

describe("getScanStore", () => {
	afterEach(async () => {
		await closeScanStore();
	});

	it("opens one store for the configured database and reuses it", () => {
		// GIVEN
		vi.stubEnv("DATABASE_URL", DATABASE_URL);
		vi.mocked(createScanStore).mockReturnValue(createFakeScanStore());

		// WHEN
		const stores = [getScanStore(), getScanStore()];

		// THEN
		expect([
			stores[0] === stores[1],
			vi.mocked(createScanStore).mock.calls.length,
		]).toEqual([true, 1]);
	});

	it("refuses to open a store without DATABASE_URL", () => {
		// GIVEN
		vi.stubEnv("DATABASE_URL", "");

		// WHEN
		const opening = () => getScanStore();

		// THEN
		expect(opening).toThrowError(
			"DATABASE_URL is not set, so the web app cannot store scans.",
		);
	});

	it("closes the open store", async () => {
		// GIVEN
		vi.stubEnv("DATABASE_URL", DATABASE_URL);
		const store = createFakeScanStore();
		vi.mocked(createScanStore).mockReturnValue(store);
		getScanStore();

		// WHEN
		await closeScanStore();

		// THEN
		expect(store.close).toHaveBeenCalledTimes(1);
	});
});
