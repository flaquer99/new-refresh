import { describe, expect, it } from "vitest";
import { isTerminalStatus, ScanStatusSchema } from "./scan-status.js";

const SCAN_ID = "8f0c6b8e-3a8e-4d0b-9a57-2f5a1d6f4c11";

describe("ScanStatusSchema", () => {
  it("parses a running status with progress", () => {
    // GIVEN
    const status = {
      scanId: SCAN_ID,
      status: "running",
      progress: {
        pagesScanned: 3,
        pagesDiscovered: 11,
        currentUrl: "https://www.example.org/about",
      },
      report: null,
      error: null,
    };

    // WHEN
    const result = ScanStatusSchema.safeParse(status);

    // THEN
    expect(result.data).toEqual(status);
  });

  it("parses a failed status carrying an error", () => {
    // GIVEN
    const status = {
      scanId: SCAN_ID,
      status: "failed",
      progress: { pagesScanned: 1, pagesDiscovered: 1, currentUrl: null },
      report: null,
      error: { code: "SITE_UNREACHABLE", message: "We couldn't reach it." },
    };

    // WHEN
    const result = ScanStatusSchema.safeParse(status);

    // THEN
    expect(result.data?.error?.code).toBe("SITE_UNREACHABLE");
  });

  it("rejects negative progress counts", () => {
    // GIVEN
    const status = {
      scanId: SCAN_ID,
      status: "running",
      progress: { pagesScanned: -1, pagesDiscovered: 0, currentUrl: null },
      report: null,
      error: null,
    };

    // WHEN
    const result = ScanStatusSchema.safeParse(status);

    // THEN
    expect(result.error?.issues[0]?.path).toEqual(["progress", "pagesScanned"]);
  });
});

describe("isTerminalStatus", () => {
  it("treats running as not terminal", () => {
    // WHEN
    const terminal = isTerminalStatus("running");

    // THEN
    expect(terminal).toBe(false);
  });

  it.each(["completed", "cancelled", "failed"] as const)(
    "treats %s as terminal",
    (status) => {
      // WHEN
      const terminal = isTerminalStatus(status);

      // THEN
      expect(terminal).toBe(true);
    },
  );
});
