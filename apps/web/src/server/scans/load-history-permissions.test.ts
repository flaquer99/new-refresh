import { describe, expect, it, vi } from "vitest";
import { fakeClerkStates } from "@/testing/fake-clerk";
import { useFakeScanStore } from "@/testing/fake-scan-store";
import { buildStoredHistoryEntry } from "@/testing/history-fixtures";
import { signInAs, useFakeClerk } from "@/testing/use-fake-clerk";
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

describe("loadHistory permissions", () => {
	useFakeClerk();
	const store = useFakeScanStore();

	it("lets a member delete only their own finished scans", async () => {
		// GIVEN
		listing(store);

		// WHEN
		const page = await loadHistory(null);

		// THEN
		expect(page.entries.map(({ canDelete }) => canDelete)).toEqual([
			true,
			false,
			false,
			false,
		]);
	});

	it("lets an admin delete any finished scan", async () => {
		// GIVEN
		signInAs(fakeClerkStates.admin);
		listing(store);

		// WHEN
		const page = await loadHistory(null);

		// THEN
		expect(page.entries.map(({ canDelete }) => canDelete)).toEqual([
			true,
			true,
			false,
			false,
		]);
	});

	it("strips user ids and the stored deletable flag from the entries", async () => {
		// GIVEN
		listing(store);

		// WHEN
		const page = await loadHistory(null);

		// THEN
		expect(
			page.entries.map((entry) => [
				"startedByUserId" in entry,
				"deletable" in entry,
				entry.startedByName,
			]),
		).toEqual(Array(4).fill([false, false, "Ana Souza"]));
	});
});
