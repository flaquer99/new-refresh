import type { ScanStore, StoredScan } from "@refresh/db/scan-store-types";
import { beforeEach, type Mock, vi } from "vitest";
import { getScanStore } from "@/server/db/scan-store";
import { buildReport } from "./report-fixtures";
import { SCAN_ID } from "./scan-route-requests";

export type FakeScanStore = { [K in keyof ScanStore]: Mock<ScanStore[K]> };

export const createFakeScanStore = (): FakeScanStore => ({
	createRunning: vi.fn<ScanStore["createRunning"]>(() => Promise.resolve()),
	discard: vi.fn<ScanStore["discard"]>(() => Promise.resolve()),
	recordResult: vi.fn<ScanStore["recordResult"]>(() =>
		Promise.resolve("recorded"),
	),
	get: vi.fn<ScanStore["get"]>(() => Promise.resolve(null)),
	list: vi.fn<ScanStore["list"]>(() =>
		Promise.resolve({ entries: [], nextBefore: null }),
	),
	settleStale: vi.fn<ScanStore["settleStale"]>(() => Promise.resolve(0)),
	markInterrupted: vi.fn<ScanStore["markInterrupted"]>(() =>
		Promise.resolve(false),
	),
	deleteFinished: vi.fn<ScanStore["deleteFinished"]>(() =>
		Promise.resolve("deleted"),
	),
	close: vi.fn<ScanStore["close"]>(() => Promise.resolve()),
});

export const useFakeScanStore = (): (() => FakeScanStore) => {
	let store = createFakeScanStore();
	beforeEach(() => {
		store = createFakeScanStore();
		vi.mocked(getScanStore).mockReturnValue(store);
	});
	return () => store;
};

export const buildStoredScan = (
	overrides: Partial<StoredScan> = {},
): StoredScan => ({
	scanId: SCAN_ID,
	startUrl: "https://www.example.org/",
	depth: 1,
	status: "completed",
	startedAt: "2026-10-09T10:00:00.000Z",
	finishedAt: "2026-10-09T10:00:20.000Z",
	report: buildReport(),
	error: null,
	...overrides,
});

export const RUNNING_STORED_SCAN = buildStoredScan({
	status: "running",
	finishedAt: null,
	report: null,
});
