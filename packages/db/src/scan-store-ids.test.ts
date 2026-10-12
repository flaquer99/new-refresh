import { describe, expect, it } from "vitest";
import { useTestStore } from "./testing/use-test-store.js";

const NOT_A_UUID = "scan-1";
const FINISHED_AT = new Date("2026-10-09T12:12:00.000Z");

describe("ScanStore with an id that is not a uuid", () => {
  const db = useTestStore();

  it("finds no scan", async () => {
    // WHEN
    const stored = await db.store().get(NOT_A_UUID);

    // THEN
    expect(stored).toBeNull();
  });

  it("marks nothing as interrupted", async () => {
    // WHEN
    const marked = await db.store().markInterrupted(NOT_A_UUID, FINISHED_AT);

    // THEN
    expect(marked).toBe(false);
  });

  it("reports the scan as not found on delete", async () => {
    // WHEN
    const outcome = await db.store().deleteFinished(NOT_A_UUID);

    // THEN
    expect(outcome).toBe("not-found");
  });

  it("discards nothing", async () => {
    // WHEN
    const discarded = db.store().discard(NOT_A_UUID);

    // THEN
    await expect(discarded).resolves.toBeUndefined();
  });
});
