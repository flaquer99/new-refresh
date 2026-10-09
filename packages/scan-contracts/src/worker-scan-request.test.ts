import { describe, expect, it } from "vitest";
import {
  INVALID_URL_MESSAGE,
  WorkerScanRequestSchema,
} from "./scan-request.js";

const SCAN_ID = "0b8f3c52-2f8e-4c1a-9a51-6a3f1c2d7e90";
const VALID_URL = "https://www.example.org/";

describe("WorkerScanRequestSchema", () => {
  it("accepts a scan request with a uuid scan id", () => {
    // GIVEN
    const body = { scanId: SCAN_ID, url: VALID_URL, depth: 2 };

    // WHEN
    const result = WorkerScanRequestSchema.safeParse(body);

    // THEN
    expect(result.data).toEqual(body);
  });

  it.each(["", "scan-1", "0b8f3c52-2f8e-4c1a-9a51"])(
    "rejects the non-uuid scan id %j",
    (scanId) => {
      // GIVEN
      const body = { scanId, url: VALID_URL, depth: 0 };

      // WHEN
      const result = WorkerScanRequestSchema.safeParse(body);

      // THEN
      expect(result.error?.issues.map((issue) => issue.path)).toEqual([
        ["scanId"],
      ]);
    },
  );

  it("rejects a request without a scan id", () => {
    // GIVEN
    const body = { url: VALID_URL, depth: 0 };

    // WHEN
    const result = WorkerScanRequestSchema.safeParse(body);

    // THEN
    expect(result.error?.issues[0]?.path).toEqual(["scanId"]);
  });

  it("keeps the url rules of a browser scan request", () => {
    // GIVEN
    const body = { scanId: SCAN_ID, url: "ftp://x", depth: 0 };

    // WHEN
    const result = WorkerScanRequestSchema.safeParse(body);

    // THEN
    expect(result.error?.issues[0]?.message).toBe(INVALID_URL_MESSAGE);
  });
});
