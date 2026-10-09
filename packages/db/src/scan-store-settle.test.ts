import { describe, expect, it } from "vitest";
import { SAMPLE_START_URL } from "./testing/sample-result.js";
import { seedScans } from "./testing/seed-scans.js";
import { useTestStore } from "./testing/use-test-store.js";

const CUTOFF = new Date("2026-10-09T12:00:00.000Z");
const FINISHED_AT = new Date("2026-10-09T12:12:00.000Z");
const MINUTE_MS = 60_000;
const OLD_RUNNING_ID = "11111111-1111-4111-8111-111111111111";
const NEW_RUNNING_ID = "22222222-2222-4222-8222-222222222222";
const OLD_FINISHED_ID = "33333333-3333-4333-8333-333333333333";

const at = (offsetMinutes: number) =>
  new Date(CUTOFF.getTime() + offsetMinutes * MINUTE_MS);

const seedMixedScans = (databaseUrl: string) =>
  seedScans(databaseUrl, [
    {
      scanId: OLD_RUNNING_ID,
      startUrl: SAMPLE_START_URL,
      status: "running",
      startedAt: at(-1),
    },
    {
      scanId: NEW_RUNNING_ID,
      startUrl: SAMPLE_START_URL,
      status: "running",
      startedAt: at(1),
    },
    {
      scanId: OLD_FINISHED_ID,
      startUrl: SAMPLE_START_URL,
      status: "completed",
      startedAt: at(-5),
    },
  ]);

describe("ScanStore settleStale", () => {
  const db = useTestStore();

  it("settles only running scans that started before the cutoff", async () => {
    // GIVEN
    await seedMixedScans(db.databaseUrl());

    // WHEN
    const settled = await db.store().settleStale(CUTOFF, FINISHED_AT);

    // THEN
    expect(settled).toBe(1);
  });

  it("marks a stale scan as failed with the interrupted reason", async () => {
    // GIVEN
    await seedMixedScans(db.databaseUrl());
    await db.store().settleStale(CUTOFF, FINISHED_AT);

    // WHEN
    const stored = await db.store().get(OLD_RUNNING_ID);

    // THEN
    expect(stored).toMatchObject({
      status: "failed",
      finishedAt: FINISHED_AT.toISOString(),
      error: { code: "SCAN_INTERRUPTED" },
    });
  });

  it("leaves a scan that started after the cutoff running", async () => {
    // GIVEN
    await seedMixedScans(db.databaseUrl());
    await db.store().settleStale(CUTOFF, FINISHED_AT);

    // WHEN
    const stored = await db.store().get(NEW_RUNNING_ID);

    // THEN
    expect(stored?.status).toBe("running");
  });
});
