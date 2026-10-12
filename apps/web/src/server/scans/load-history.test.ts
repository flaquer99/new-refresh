import { describe, expect, it, vi } from "vitest";
import { useFakeScanStore } from "@/testing/fake-scan-store";
import { loadHistory } from "./load-history";

vi.mock("@/server/db/scan-store", () => ({ getScanStore: vi.fn() }));
vi.mock("next/server", () => ({ connection: vi.fn(() => Promise.resolve()) }));

describe("loadHistory", () => {
	const store = useFakeScanStore();

	it("lists 20 scans before the given cursor", async () => {
		// WHEN
		await loadHistory("cursor");

		// THEN
		expect(store().list).toHaveBeenCalledWith({ before: "cursor", limit: 20 });
	});

	it("settles stale scans before listing", async () => {
		// WHEN
		await loadHistory(null);

		// THEN
		expect(store().settleStale).toHaveBeenCalledTimes(1);
	});
});
