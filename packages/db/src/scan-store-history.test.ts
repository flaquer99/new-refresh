import { describe, expect, it } from "vitest";
import type { ScanStore } from "./scan-store-types.js";
import { buildSeedHistory, seedScans } from "./testing/seed-scans.js";
import { useTestStore } from "./testing/use-test-store.js";

const PAGE_SIZE = 20;
const MINUTE_MS = 60_000;
const NEWEST = new Date("2026-10-09T12:00:00.000Z");
const START_URL = "https://history.example.org/";

const seedHistory = (count: number, newest = NEWEST) =>
  buildSeedHistory({ count, newest, stepMs: MINUTE_MS, startUrl: START_URL });

const readAllPages = async (store: ScanStore): Promise<string[][]> => {
  const pages: string[][] = [];
  let before: string | null = null;
  do {
    const page = await store.list({ before, limit: PAGE_SIZE });
    pages.push(page.entries.map((entry) => entry.scanId));
    before = page.nextBefore;
  } while (before !== null);
  return pages;
};

describe("ScanStore history", () => {
  const db = useTestStore();

  it("pages 45 scans as 20, 20 and 5", async () => {
    // GIVEN
    await seedScans(db.databaseUrl(), seedHistory(45));

    // WHEN
    const pages = await readAllPages(db.store());

    // THEN
    expect(pages.map((page) => page.length)).toEqual([20, 20, 5]);
  });

  it("lists every scan once, newest first", async () => {
    // GIVEN
    const seeded = seedHistory(45);
    await seedScans(db.databaseUrl(), seeded);

    // WHEN
    const pages = await readAllPages(db.store());

    // THEN
    expect(pages.flat()).toEqual(seeded.map((scan) => scan.scanId));
  });

  it("keeps the next page stable when newer scans arrive", async () => {
    // GIVEN
    const seeded = seedHistory(25);
    await seedScans(db.databaseUrl(), seeded);
    const first = await db.store().list({ before: null, limit: PAGE_SIZE });
    await seedScans(
      db.databaseUrl(),
      seedHistory(3, new Date("2026-10-10T00:00:00.000Z")),
    );

    // WHEN
    const second = await db
      .store()
      .list({ before: first.nextBefore, limit: PAGE_SIZE });

    // THEN
    expect(second.entries.map((entry) => entry.scanId)).toEqual(
      seeded.slice(PAGE_SIZE).map((scan) => scan.scanId),
    );
  });

  it("treats a malformed cursor as the first page", async () => {
    // GIVEN
    const seeded = seedHistory(3);
    await seedScans(db.databaseUrl(), seeded);

    // WHEN
    const page = await db.store().list({ before: "garbage", limit: PAGE_SIZE });

    // THEN
    expect(page.entries[0]?.scanId).toBe(seeded[0]?.scanId);
  });
});
