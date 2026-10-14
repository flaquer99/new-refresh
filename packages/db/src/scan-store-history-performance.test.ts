import { performance } from "node:perf_hooks";
import { beforeEach, describe, expect, it } from "vitest";
import { explainHistoryPage } from "./testing/explain-history-page.js";
import {
  buildSeedHistory,
  explainQuery,
  seedScans,
} from "./testing/seed-scans.js";
import { TEST_ORGANIZATION_ID } from "./testing/test-owner.js";
import { useTestStore } from "./testing/use-test-store.js";

const PAGE_SIZE = 20;
const SEEDED_SCANS = 1000;
const RUNS = 20;
const P95_BUDGET_MS = 50;
const P95_INDEX = Math.ceil(RUNS * 0.95) - 1;
// Matches an index scan whose Index Cond bounds started_at at the cursor
const OLDER_PAGE_INDEX_RANGE =
  /Index Scan using scans_organization_started_at_idx[\s\S]*Index Cond: \(.*started_at <=/;
const FIRST_PAGE_SQL = `SELECT * FROM "scans" WHERE "organization_id" = '${TEST_ORGANIZATION_ID}' ORDER BY "started_at" DESC, "id" DESC LIMIT ${PAGE_SIZE + 1}`;

describe("ScanStore history performance", () => {
  const db = useTestStore();

  beforeEach(async () => {
    await seedScans(
      db.databaseUrl(),
      buildSeedHistory({
        count: SEEDED_SCANS,
        newest: new Date("2026-10-09T12:00:00.000Z"),
        stepMs: 1000,
        startUrl: "https://load.example.org/",
      }),
    );
  });

  it("reads the first history page through the organization index", async () => {
    // WHEN
    const plan = await explainQuery(db.databaseUrl(), FIRST_PAGE_SQL);

    // THEN
    expect(plan).toContain("scans_organization_started_at_idx");
  });

  it("starts an older history page at the cursor through the organization index", async () => {
    // GIVEN
    const firstPage = await db.store().list({
      organizationId: TEST_ORGANIZATION_ID,
      before: null,
      limit: PAGE_SIZE,
    });

    // WHEN
    const plan = await explainHistoryPage(db.databaseUrl(), {
      organizationId: TEST_ORGANIZATION_ID,
      before: firstPage.nextBefore,
      limit: PAGE_SIZE,
    });

    // THEN
    expect(plan).toMatch(OLDER_PAGE_INDEX_RANGE);
  });

  it("reads the first history page of 1,000 scans within the p95 budget", async () => {
    // GIVEN
    await db.store().list({
      organizationId: TEST_ORGANIZATION_ID,
      before: null,
      limit: PAGE_SIZE,
    });
    const durations: number[] = [];

    // WHEN
    for (let run = 0; run < RUNS; run += 1) {
      const start = performance.now();
      await db.store().list({
        organizationId: TEST_ORGANIZATION_ID,
        before: null,
        limit: PAGE_SIZE,
      });
      durations.push(performance.now() - start);
    }

    // THEN
    const p95 =
      durations.sort((a, b) => a - b)[P95_INDEX] ?? Number.POSITIVE_INFINITY;
    expect(p95).toBeLessThanOrEqual(P95_BUDGET_MS);
  });
});
