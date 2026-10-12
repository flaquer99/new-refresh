import { describe, expect, it } from "vitest";
import {
  buildCompletedResult,
  SAMPLE_SCAN_ID,
  SAMPLE_START_URL,
  SAMPLE_STARTED_AT,
} from "./testing/sample-result.js";
import { useTestStore } from "./testing/use-test-store.js";

const RUNNING_INPUT = {
  scanId: SAMPLE_SCAN_ID,
  request: { url: SAMPLE_START_URL, depth: 0 },
  startedAt: SAMPLE_STARTED_AT,
};

describe("ScanStore deleteFinished", () => {
  const db = useTestStore();

  it("deletes a finished scan", async () => {
    // GIVEN
    await db.store().createRunning(RUNNING_INPUT);
    await db.store().recordResult(buildCompletedResult());

    // WHEN
    const outcome = await db.store().deleteFinished(SAMPLE_SCAN_ID);

    // THEN
    expect(outcome).toBe("deleted");
  });

  it("removes a deleted scan for good", async () => {
    // GIVEN
    await db.store().createRunning(RUNNING_INPUT);
    await db.store().recordResult(buildCompletedResult());
    await db.store().deleteFinished(SAMPLE_SCAN_ID);

    // WHEN
    const stored = await db.store().get(SAMPLE_SCAN_ID);

    // THEN
    expect(stored).toBeNull();
  });

  it("refuses to delete a running scan", async () => {
    // GIVEN
    await db.store().createRunning(RUNNING_INPUT);

    // WHEN
    const outcome = await db.store().deleteFinished(SAMPLE_SCAN_ID);

    // THEN
    expect(outcome).toBe("running");
  });

  it("reports a scan that does not exist as not found", async () => {
    // WHEN
    const outcome = await db.store().deleteFinished(SAMPLE_SCAN_ID);

    // THEN
    expect(outcome).toBe("not-found");
  });
});

describe("ScanStore discard", () => {
  const db = useTestStore();

  it("removes a running scan", async () => {
    // GIVEN
    await db.store().createRunning(RUNNING_INPUT);

    // WHEN
    await db.store().discard(SAMPLE_SCAN_ID);

    // THEN
    expect(await db.store().get(SAMPLE_SCAN_ID)).toBeNull();
  });

  it("keeps a finished scan", async () => {
    // GIVEN
    await db.store().createRunning(RUNNING_INPUT);
    await db.store().recordResult(buildCompletedResult());

    // WHEN
    await db.store().discard(SAMPLE_SCAN_ID);

    // THEN
    expect((await db.store().get(SAMPLE_SCAN_ID))?.status).toBe("completed");
  });
});
