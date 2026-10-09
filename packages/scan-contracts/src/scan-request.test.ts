import { describe, expect, it } from "vitest";
import { MAX_URL_LENGTH } from "./limits.js";
import {
  INVALID_DEPTH_MESSAGE,
  INVALID_URL_MESSAGE,
  ScanRequestSchema,
} from "./scan-request.js";

const VALID_URL = "https://www.example.org/";

describe("ScanRequestSchema url", () => {
  it("accepts an absolute https URL", () => {
    // GIVEN
    const body = { url: VALID_URL, depth: 1 };

    // WHEN
    const result = ScanRequestSchema.safeParse(body);

    // THEN
    expect(result.data).toEqual({ url: VALID_URL, depth: 1 });
  });

  it.each(["", "ftp://x", "javascript:alert(1)", "http//x"])(
    "rejects %j with a url issue",
    (url) => {
      // GIVEN
      const body = { url, depth: 0 };

      // WHEN
      const result = ScanRequestSchema.safeParse(body);

      // THEN
      expect(result.error?.issues.map((issue) => issue.path)).toEqual([
        ["url"],
      ]);
    },
  );

  it("trims surrounding whitespace from the url", () => {
    // GIVEN
    const body = { url: `  ${VALID_URL}  `, depth: 0 };

    // WHEN
    const result = ScanRequestSchema.safeParse(body);

    // THEN
    expect(result.data?.url).toBe(VALID_URL);
  });

  it("accepts a url of exactly the maximum length", () => {
    // GIVEN
    const url = `${VALID_URL}${"a".repeat(MAX_URL_LENGTH - VALID_URL.length)}`;

    // WHEN
    const result = ScanRequestSchema.safeParse({ url, depth: 0 });

    // THEN
    expect(result.data?.url).toHaveLength(MAX_URL_LENGTH);
  });

  it("rejects a url longer than the maximum length", () => {
    // GIVEN
    const url = `${VALID_URL}${"a".repeat(MAX_URL_LENGTH)}`;

    // WHEN
    const result = ScanRequestSchema.safeParse({ url, depth: 0 });

    // THEN
    expect(result.error?.issues[0]?.message).toBe(INVALID_URL_MESSAGE);
  });
});

describe("ScanRequestSchema depth", () => {
  it.each([0, 1, 2, 3])("accepts depth %d", (depth) => {
    // GIVEN
    const body = { url: VALID_URL, depth };

    // WHEN
    const result = ScanRequestSchema.safeParse(body);

    // THEN
    expect(result.data?.depth).toBe(depth);
  });

  it.each([-1, 4, 1.5, "1", null])("rejects depth %j", (depth) => {
    // GIVEN
    const body = { url: VALID_URL, depth };

    // WHEN
    const result = ScanRequestSchema.safeParse(body);

    // THEN
    expect(result.error?.issues[0]).toMatchObject({
      path: ["depth"],
      message: INVALID_DEPTH_MESSAGE,
    });
  });
});
