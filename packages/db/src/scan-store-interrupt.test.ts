import { describe, expect, it } from "vitest";
import {
  buildCompletedResult,
  SAMPLE_SCAN_ID,
  SAMPLE_START_URL,
  SAMPLE_STARTED_AT,
} from "./testing/sample-result.js";
import { useTestStore } from "./testing/use-test-store.js";

const FINISHED_AT = new Date("2026-10-09T12:12:00.000Z");

const RUNNING_INPUT = {
  scanId: SAMPLE_SCAN_ID,
  request: { url: SAMPLE_START_URL, depth: 0 },
  startedAt: SAMPLE_STARTED_AT,
};

describe("ScanStore markInterrupted", () => {
  const db = useTestStore();

  it("marks a running scan as interrupted", async () => {
    // GIVEN
    await db.store().createRunning(RUNNING_INPUT);

    // WHEN
    const marked = await db
      .store()
      .markInterrupted(SAMPLE_SCAN_ID, FINISHED_AT);

    // THEN
    expect(marked).toBe(true);
  });

  it("does not overwrite a completed scan", async () => {
    // GIVEN
    await db.store().createRunning(RUNNING_INPUT);
    await db.store().recordResult(buildCompletedResult());
    await db.store().markInterrupted(SAMPLE_SCAN_ID, FINISHED_AT);

    // WHEN
    const stored = await db.store().get(SAMPLE_SCAN_ID);

    // THEN
    expect(stored?.status).toBe("completed");
  });
});
