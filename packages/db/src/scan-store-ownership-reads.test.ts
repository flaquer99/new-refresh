import { describe, expect, it } from "vitest";
import {
  firstPage,
  history,
  OTHER_OWNER,
  otherKey,
  ownKey,
  runningInput,
} from "./testing/ownership-fixtures.js";
import { readScanRow } from "./testing/read-scan-row.js";
import { SAMPLE_SCAN_ID } from "./testing/sample-result.js";
import { seedScans } from "./testing/seed-scans.js";
import { TEST_ORGANIZATION_ID, TEST_OWNER } from "./testing/test-owner.js";
import { useTestStore } from "./testing/use-test-store.js";

const _PAGE_SIZE = 20;

describe("ScanStore ownership reads", () => {
  const db = useTestStore();

  it("lists only the requested organization's scans", async () => {
    // GIVEN
    const own = history(3);
    await seedScans(db.databaseUrl(), [...own, ...history(4, OTHER_OWNER)]);

    // WHEN
    const page = await db.store().list(firstPage(TEST_ORGANIZATION_ID));

    // THEN
    expect(page.entries.map((entry) => entry.scanId)).toEqual(
      own.map((scan) => scan.scanId),
    );
  });

  it("returns null when getting another organization's scan", async () => {
    // GIVEN
    await db.store().createRunning(runningInput);

    // WHEN
    const stored = await db.store().get(otherKey);

    // THEN
    expect(stored).toBeNull();
  });

  it("returns the owner of a scan to its organization", async () => {
    // GIVEN
    await db.store().createRunning(runningInput);

    // WHEN
    const stored = await db.store().get(ownKey);

    // THEN
    expect(stored).toMatchObject(TEST_OWNER);
  });

  it("persists the owner columns on createRunning", async () => {
    // GIVEN
    await db.store().createRunning(runningInput);

    // WHEN
    const row = await readScanRow(db.databaseUrl(), SAMPLE_SCAN_ID);

    // THEN
    expect(row).toMatchObject({
      organizationId: TEST_OWNER.organizationId,
      startedByUserId: TEST_OWNER.startedByUserId,
      startedByName: TEST_OWNER.startedByName,
    });
  });

  it("stores a null starter name", async () => {
    // GIVEN
    const owner = { ...TEST_OWNER, startedByName: null };
    await db.store().createRunning({ ...runningInput, owner });

    // WHEN
    const stored = await db.store().get(ownKey);

    // THEN
    expect(stored?.startedByName).toBeNull();
  });
});
