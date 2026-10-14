import { describe, expect, it } from "vitest";
import {
  firstPage,
  history,
  OTHER_OWNER,
  otherKey,
  ownKey,
  runningInput,
} from "./testing/ownership-fixtures.js";
import { buildCompletedResult } from "./testing/sample-result.js";
import { seedScans } from "./testing/seed-scans.js";
import {
  OTHER_ORGANIZATION_ID,
  TEST_ORGANIZATION_ID,
} from "./testing/test-owner.js";
import { useTestStore } from "./testing/use-test-store.js";

describe("ScanStore ownership removal", () => {
  const db = useTestStore();

  it("reports another organization's finished scan as not found on delete", async () => {
    // GIVEN
    await db.store().createRunning(runningInput);
    await db.store().recordResult(buildCompletedResult());

    // WHEN
    const outcome = await db.store().deleteFinished(otherKey);

    // THEN
    expect(outcome).toBe("not-found");
  });

  it("keeps the row after a cross-organization delete attempt", async () => {
    // GIVEN
    await db.store().createRunning(runningInput);
    await db.store().recordResult(buildCompletedResult());
    await db.store().deleteFinished(otherKey);

    // WHEN
    const stored = await db.store().get(ownKey);

    // THEN
    expect(stored?.status).toBe("completed");
  });

  it("reports another organization's running scan as not found on delete", async () => {
    // GIVEN
    await db.store().createRunning(runningInput);

    // WHEN
    const outcome = await db.store().deleteFinished(otherKey);

    // THEN
    expect(outcome).toBe("not-found");
  });

  it("counts the scans removed for an organization", async () => {
    // GIVEN
    await seedScans(db.databaseUrl(), [
      ...history(3),
      ...history(2, OTHER_OWNER),
    ]);

    // WHEN
    const removed = await db.store().deleteByOrganization(TEST_ORGANIZATION_ID);

    // THEN
    expect(removed).toBe(3);
  });

  it("keeps other organizations' scans when deleting by organization", async () => {
    // GIVEN
    await seedScans(db.databaseUrl(), [
      ...history(3),
      ...history(2, OTHER_OWNER),
    ]);
    await db.store().deleteByOrganization(TEST_ORGANIZATION_ID);

    // WHEN
    const page = await db.store().list(firstPage(OTHER_ORGANIZATION_ID));

    // THEN
    expect(page.entries).toHaveLength(2);
  });

  it("removes nothing for an organization without scans", async () => {
    // WHEN
    const removed = await db.store().deleteByOrganization("org_empty");

    // THEN
    expect(removed).toBe(0);
  });
});
