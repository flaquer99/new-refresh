import { describe, expect, it } from "vitest";
import type { ScanStore } from "./scan-store-types.js";
import { buildSeedHistory, seedScans } from "./testing/seed-scans.js";
import { TEST_ORGANIZATION_ID } from "./testing/test-owner.js";
import { useTestStore } from "./testing/use-test-store.js";

const PAGE_SIZE = 20;
const TIED_SCANS = 25;
const SHARED_START = new Date("2026-10-09T12:00:00.000Z");

const tiedScanId = (index: number): string =>
  `00000000-0000-4000-8000-${String(index).padStart(12, "0")}`;

const seedTiedHistory = () =>
  buildSeedHistory({
    count: TIED_SCANS,
    newest: SHARED_START,
    stepMs: 0,
    startUrl: "https://ties.example.org/",
  }).map((scan, index) => ({ ...scan, scanId: tiedScanId(index) }));

const readAllPages = async (store: ScanStore): Promise<string[][]> => {
  const pages: string[][] = [];
  let before: string | null = null;
  do {
    const page = await store.list({
      organizationId: TEST_ORGANIZATION_ID,
      before,
      limit: PAGE_SIZE,
    });
    pages.push(page.entries.map((entry) => entry.scanId));
    before = page.nextBefore;
  } while (before !== null);
  return pages;
};

const idsNewestFirst = (): string[] =>
  Array.from({ length: TIED_SCANS }, (_, index) => tiedScanId(index)).reverse();

describe("ScanStore history with identical start times", () => {
  const db = useTestStore();

  it("splits scans that started in the same millisecond into 20 and 5", async () => {
    // GIVEN
    await seedScans(db.databaseUrl(), seedTiedHistory());

    // WHEN
    const pages = await readAllPages(db.store());

    // THEN
    expect(pages.map((page) => page.length)).toEqual([20, 5]);
  });

  it("orders scans that started in the same millisecond by id, newest id first, without repeats", async () => {
    // GIVEN
    await seedScans(db.databaseUrl(), seedTiedHistory());

    // WHEN
    const pages = await readAllPages(db.store());

    // THEN
    expect(pages.flat()).toEqual(idsNewestFirst());
  });
});
