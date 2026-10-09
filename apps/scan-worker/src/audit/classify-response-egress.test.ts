import { describe, expect, it } from "vitest";
import { classifyResponse } from "./classify-response.js";

describe("classifyResponse with an egress guard verdict", () => {
  it("fails a guard refusal for a non-public address as blocked-address", () => {
    // WHEN
    const outcome = classifyResponse({
      status: 403,
      contentType: null,
      egressVerdict: "blocked-address",
    });

    // THEN
    expect(outcome).toEqual({
      kind: "failed",
      reason: "blocked-address",
      httpStatus: null,
    });
  });

  it("fails a guard refusal for an unresolvable host as network-error", () => {
    // WHEN
    const outcome = classifyResponse({
      status: 502,
      contentType: null,
      egressVerdict: "unresolved",
    });

    // THEN
    expect(outcome).toEqual({
      kind: "failed",
      reason: "network-error",
      httpStatus: null,
    });
  });

  it("fails an unreachable upstream reported by the guard as network-error", () => {
    // WHEN
    const outcome = classifyResponse({
      status: 502,
      contentType: null,
      egressVerdict: "unreachable",
    });

    // THEN
    expect(outcome).toEqual({
      kind: "failed",
      reason: "network-error",
      httpStatus: null,
    });
  });
});
