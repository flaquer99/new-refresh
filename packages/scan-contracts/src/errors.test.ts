import { describe, expect, it } from "vitest";
import { ErrorEnvelopeSchema, SCAN_ERROR_HTTP_STATUS } from "./errors.js";

describe("ErrorEnvelopeSchema", () => {
  it("parses an error envelope with a known code", () => {
    // GIVEN
    const body = {
      error: { code: "URL_NOT_ALLOWED", message: "Private address." },
    };

    // WHEN
    const result = ErrorEnvelopeSchema.safeParse(body);

    // THEN
    expect(result.data?.error.code).toBe("URL_NOT_ALLOWED");
  });

  it("rejects an unknown error code", () => {
    // GIVEN
    const body = { error: { code: "TEAPOT", message: "Short and stout." } };

    // WHEN
    const result = ErrorEnvelopeSchema.safeParse(body);

    // THEN
    expect(result.error?.issues[0]?.path).toEqual(["error", "code"]);
  });
});

describe("SCAN_ERROR_HTTP_STATUS", () => {
  it.each([
    ["INVALID_REQUEST", 400],
    ["UNAUTHORIZED", 401],
    ["SCAN_NOT_FOUND", 404],
    ["SCAN_ALREADY_RUNNING", 409],
    ["URL_NOT_ALLOWED", 422],
    ["INTERNAL_ERROR", 500],
    ["WORKER_UNAVAILABLE", 502],
    ["CAPACITY_REACHED", 503],
  ] as const)("maps %s to HTTP %d", (code, status) => {
    // WHEN
    const httpStatus = SCAN_ERROR_HTTP_STATUS[code];

    // THEN
    expect(httpStatus).toBe(status);
  });
});
