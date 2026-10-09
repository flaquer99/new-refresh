import { describe, expect, it } from "vitest";
import { SCAN_INTERRUPTED_MESSAGE } from "./errors.js";
import {
  INCONSISTENT_RESULT_MESSAGE,
  ScanResultSchema,
} from "./scan-result.js";
import { buildReport } from "./testing/sample-report.js";

const SCAN_ID = "0b8f3c52-2f8e-4c1a-9a51-6a3f1c2d7e90";
const FINISHED_AT = "2026-10-09T10:01:00.000Z";
const INTERRUPTED = {
  code: "SCAN_INTERRUPTED",
  message: SCAN_INTERRUPTED_MESSAGE,
};

const buildResult = (overrides: Record<string, unknown>) => ({
  scanId: SCAN_ID,
  status: "completed",
  report: buildReport(),
  error: null,
  finishedAt: FINISHED_AT,
  ...overrides,
});

describe("ScanResultSchema", () => {
  it("accepts a completed result with a report", () => {
    // GIVEN
    const body = buildResult({});

    // WHEN
    const result = ScanResultSchema.safeParse(body);

    // THEN
    expect(result.data).toEqual(body);
  });

  it("rejects a failed result that carries a report", () => {
    // GIVEN
    const body = buildResult({ status: "failed", error: INTERRUPTED });

    // WHEN
    const result = ScanResultSchema.safeParse(body);

    // THEN
    expect(result.error?.issues[0]?.message).toBe(INCONSISTENT_RESULT_MESSAGE);
  });

  it("accepts a failed result with an error and no report", () => {
    // GIVEN
    const body = buildResult({
      status: "failed",
      report: null,
      error: INTERRUPTED,
    });

    // WHEN
    const result = ScanResultSchema.safeParse(body);

    // THEN
    expect(result.data?.error?.code).toBe("SCAN_INTERRUPTED");
  });

  it("rejects a cancelled result without a report", () => {
    // GIVEN
    const body = buildResult({ status: "cancelled", report: null });

    // WHEN
    const result = ScanResultSchema.safeParse(body);

    // THEN
    expect(result.error?.issues[0]?.message).toBe(INCONSISTENT_RESULT_MESSAGE);
  });

  it("rejects a running status because results are final", () => {
    // GIVEN
    const body = buildResult({ status: "running" });

    // WHEN
    const result = ScanResultSchema.safeParse(body);

    // THEN
    expect(result.error?.issues[0]?.path).toEqual(["status"]);
  });

  it("rejects a finish time that is not an ISO datetime", () => {
    // GIVEN
    const body = buildResult({ finishedAt: "yesterday" });

    // WHEN
    const result = ScanResultSchema.safeParse(body);

    // THEN
    expect(result.error?.issues[0]?.path).toEqual(["finishedAt"]);
  });
});
