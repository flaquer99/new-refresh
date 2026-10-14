import { describe, expect, it } from "vitest";
import {
  firstPage,
  history,
  OTHER_OWNER,
} from "./testing/ownership-fixtures.js";
import { seedScans } from "./testing/seed-scans.js";
import {
  TEST_ORGANIZATION_ID,
  TEST_OWNER,
  TEST_USER_ID,
} from "./testing/test-owner.js";
import { useTestStore } from "./testing/use-test-store.js";

const PAGE_SIZE = 20;

describe("ScanStore ownership history", () => {
  const db = useTestStore();

  it("pages within the organization across pages", async () => {
    // GIVEN
    const own = history(25);
    await seedScans(db.databaseUrl(), [...own, ...history(30, OTHER_OWNER)]);
    const first = await db
      .store()
      .list(firstPage(TEST_ORGANIZATION_ID, PAGE_SIZE));

    // WHEN
    const second = await db.store().list({
      organizationId: TEST_ORGANIZATION_ID,
      before: first.nextBefore,
      limit: PAGE_SIZE,
    });

    // THEN
    const ids = [...first.entries, ...second.entries].map((e) => e.scanId);
    expect(ids).toEqual(own.map((scan) => scan.scanId));
  });

  it("keeps listing scans started by a member who has left", async () => {
    // GIVEN
    const removedMember = { ...TEST_OWNER, startedByUserId: "user_removed" };
    await seedScans(db.databaseUrl(), history(2, removedMember));

    // WHEN
    const page = await db.store().list(firstPage(TEST_ORGANIZATION_ID));

    // THEN
    expect(page.entries.map((entry) => entry.startedByUserId)).toEqual([
      "user_removed",
      "user_removed",
    ]);
  });

  it("exposes the starter on history entries", async () => {
    // GIVEN
    await seedScans(db.databaseUrl(), history(1));

    // WHEN
    const page = await db.store().list(firstPage(TEST_ORGANIZATION_ID));

    // THEN
    expect(page.entries[0]).toMatchObject({
      startedByUserId: TEST_USER_ID,
      startedByName: TEST_OWNER.startedByName,
    });
  });
});
