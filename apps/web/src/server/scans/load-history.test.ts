import { describe, expect, it, vi } from "vitest";
import { useFakeScanStore } from "@/testing/fake-scan-store";
import { buildStoredHistoryEntry } from "@/testing/history-fixtures";
import { useFakeClerk } from "@/testing/use-fake-clerk";
import { loadHistory } from "./load-history";

vi.mock("@clerk/nextjs/server", () => ({
	auth: vi.fn(),
	currentUser: vi.fn(),
}));
vi.mock("@/server/db/scan-store", () => ({ getScanStore: vi.fn() }));
vi.mock("next/server", () => ({ connection: vi.fn(() => Promise.resolve()) }));

const OWN = buildStoredHistoryEntry({ scanId: "own" });
const OTHERS = buildStoredHistoryEntry({
	scanId: "others",
	startedByUserId: "user_other",
});
const OTHERS_RUNNING = buildStoredHistoryEntry({
	scanId: "running",
	startedByUserId: "user_other",
	deletable: false,
});
const OWN_RUNNING = buildStoredHistoryEntry({
	scanId: "own-running",
	deletable: false,
});

const listing = (
	store: ReturnType<typeof useFakeScanStore>,
	entries = [OWN, OTHERS, OTHERS_RUNNING, OWN_RUNNING],
) => store().list.mockResolvedValue({ entries, nextBefore: "next" });

describe("loadHistory", () => {
	useFakeClerk();
	const store = useFakeScanStore();

	it("lists 20 scans of the actor's organization before the given cursor", async () => {
		// WHEN
		await loadHistory("cursor");

		// THEN
		expect(store().list).toHaveBeenCalledWith({
			organizationId: "org_test",
			before: "cursor",
			limit: 20,
		});
	});

	it("settles stale scans before listing", async () => {
		// WHEN
		await loadHistory(null);

		// THEN
		expect(store().settleStale).toHaveBeenCalledTimes(1);
	});

	it("keeps the cursor of the next page", async () => {
		// GIVEN
		listing(store);

		// WHEN
		const page = await loadHistory(null);

		// THEN
		expect(page.nextBefore).toBe("next");
	});
});
