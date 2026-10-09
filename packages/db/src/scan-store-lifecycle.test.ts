import { describe, expect, it } from "vitest";
import {
  buildCompletedResult,
  buildInterruptedResult,
  buildSampleReport,
  SAMPLE_SCAN_ID,
  SAMPLE_START_URL,
  SAMPLE_STARTED_AT,
} from "./testing/sample-result.js";
import { useTestStore } from "./testing/use-test-store.js";

const RUNNING_INPUT = {
  scanId: SAMPLE_SCAN_ID,
  request: { url: SAMPLE_START_URL, depth: 1 },
  startedAt: SAMPLE_STARTED_AT,
};

describe("ScanStore lifecycle", () => {
  const db = useTestStore();

  it("stores a new scan as running", async () => {
    // GIVEN
    await db.store().createRunning(RUNNING_INPUT);

    // WHEN
    const stored = await db.store().get(SAMPLE_SCAN_ID);

    // THEN
    expect(stored).toEqual({
      scanId: SAMPLE_SCAN_ID,
      startUrl: SAMPLE_START_URL,
      depth: 1,
      status: "running",
      startedAt: SAMPLE_STARTED_AT.toISOString(),
      finishedAt: null,
      report: null,
      error: null,
    });
  });

  it("records the first result of a running scan", async () => {
    // GIVEN
    await db.store().createRunning(RUNNING_INPUT);

    // WHEN
    const outcome = await db.store().recordResult(buildCompletedResult());

    // THEN
    expect(outcome).toBe("recorded");
  });

  it("returns the recorded report unchanged", async () => {
    // GIVEN
    await db.store().createRunning(RUNNING_INPUT);
    await db.store().recordResult(buildCompletedResult());

    // WHEN
    const stored = await db.store().get(SAMPLE_SCAN_ID);

    // THEN
    expect(stored?.report).toEqual(buildSampleReport());
  });

  it("ignores a result for a scan that is already final", async () => {
    // GIVEN
    await db.store().createRunning(RUNNING_INPUT);
    await db.store().recordResult(buildCompletedResult());

    // WHEN
    const outcome = await db.store().recordResult(buildInterruptedResult());

    // THEN
    expect(outcome).toBe("already-final");
  });

  it("keeps the first final status when a later result is ignored", async () => {
    // GIVEN
    await db.store().createRunning(RUNNING_INPUT);
    await db.store().recordResult(buildCompletedResult());
    await db.store().recordResult(buildInterruptedResult());

    // WHEN
    const stored = await db.store().get(SAMPLE_SCAN_ID);

    // THEN
    expect(stored?.status).toBe("completed");
  });

  it("reports a result for an unknown scan as not found", async () => {
    // WHEN
    const outcome = await db.store().recordResult(buildCompletedResult());

    // THEN
    expect(outcome).toBe("not-found");
  });
});
