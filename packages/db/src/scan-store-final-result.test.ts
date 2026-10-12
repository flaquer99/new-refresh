import { describe, expect, it } from "vitest";
import { readScanRow } from "./testing/read-scan-row.js";
import {
  buildCompletedResult,
  buildInterruptedResult,
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

describe("ScanStore final result", () => {
  const db = useTestStore();

  it("leaves the stored row untouched, updated_at included, when a later result is ignored", async () => {
    // GIVEN
    await db.store().createRunning(RUNNING_INPUT);
    await db.store().recordResult(buildCompletedResult());
    const before = await readScanRow(db.databaseUrl(), SAMPLE_SCAN_ID);

    // WHEN
    await db.store().recordResult(buildInterruptedResult());

    // THEN
    expect(await readScanRow(db.databaseUrl(), SAMPLE_SCAN_ID)).toEqual(before);
  });
});
