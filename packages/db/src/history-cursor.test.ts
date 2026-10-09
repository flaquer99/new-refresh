import { describe, expect, it } from "vitest";
import { decodeCursor, encodeCursor } from "./history-cursor.js";
import { SAMPLE_SCAN_ID, SAMPLE_STARTED_AT } from "./testing/sample-result.js";

describe("history cursor", () => {
  it("decodes what it encodes", () => {
    // GIVEN
    const cursor = { startedAt: SAMPLE_STARTED_AT, id: SAMPLE_SCAN_ID };

    // WHEN
    const decoded = decodeCursor(encodeCursor(cursor));

    // THEN
    expect(decoded).toEqual(cursor);
  });

  it("encodes to a url-safe value", () => {
    // GIVEN
    const cursor = { startedAt: SAMPLE_STARTED_AT, id: SAMPLE_SCAN_ID };

    // WHEN
    const encoded = encodeCursor(cursor);

    // THEN
    expect(encoded).toMatch(/^[\w-]+$/);
  });

  it.each([
    "",
    "not-a-cursor",
    Buffer.from("yesterday|abc").toString("base64url"),
  ])("decodes the malformed cursor %j to null", (value) => {
    // WHEN
    const decoded = decodeCursor(value);

    // THEN
    expect(decoded).toBeNull();
  });
});
