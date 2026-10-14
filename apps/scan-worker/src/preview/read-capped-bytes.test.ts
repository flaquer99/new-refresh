import { describe, expect, it } from "vitest";
import { stubResponse } from "../testing/preview-harness.js";
import { readCappedBytes } from "./read-capped-bytes.js";

const CAP = 4;

describe("readCappedBytes", () => {
  it("returns the whole body when it is within the cap", async () => {
    // GIVEN
    const response = stubResponse("abc");

    // WHEN
    const { bytes, truncated } = await readCappedBytes(response, CAP);

    // THEN
    expect(Buffer.from(bytes).toString()).toBe("abc");
    expect(truncated).toBe(false);
  });

  it("does not flag a body of exactly the cap", async () => {
    // GIVEN
    const response = stubResponse("abcd");

    // WHEN
    const { truncated } = await readCappedBytes(response, CAP);

    // THEN
    expect(truncated).toBe(false);
  });

  it("stops at the cap and flags truncation", async () => {
    // GIVEN
    const response = stubResponse("abcdefgh");

    // WHEN
    const { bytes, truncated } = await readCappedBytes(response, CAP);

    // THEN
    expect(Buffer.from(bytes).toString()).toBe("abcd");
    expect(truncated).toBe(true);
  });

  it("returns no bytes for a response without a body", async () => {
    // GIVEN
    const response = stubResponse(null);

    // WHEN
    const { bytes, truncated } = await readCappedBytes(response, CAP);

    // THEN
    expect(bytes.byteLength).toBe(0);
    expect(truncated).toBe(false);
  });
});
