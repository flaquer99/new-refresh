import { describe, expect, it } from "vitest";
import { stubResolver } from "../testing/stub-resolver.js";
import { settleRefusal } from "./settle-refusal.js";

const POLICY = {
  resolve: stubResolver({
    "public.test": ["93.184.216.34"],
    "intranet.test": ["10.0.0.5"],
  }),
  allowlist: new Set<string>(),
};

const refusedAt = (refusedUrl: string) =>
  ({
    kind: "failed",
    reason: "network-error",
    httpStatus: null,
    refusedUrl,
  }) as const;

describe("settleRefusal", () => {
  it("turns a refused tunnel to a non-public host into blocked-address", async () => {
    // WHEN
    const outcome = await settleRefusal(
      refusedAt("https://intranet.test/"),
      POLICY,
    );

    // THEN
    expect(outcome).toEqual({
      kind: "failed",
      reason: "blocked-address",
      httpStatus: null,
    });
  });

  it("keeps a refused tunnel to a public host as network-error", async () => {
    // WHEN
    const outcome = await settleRefusal(
      refusedAt("https://public.test/"),
      POLICY,
    );

    // THEN
    expect(outcome).toEqual({
      kind: "failed",
      reason: "network-error",
      httpStatus: null,
    });
  });

  it("keeps a refused tunnel to an unresolvable host as network-error", async () => {
    // WHEN
    const outcome = await settleRefusal(
      refusedAt("https://nowhere.invalid/"),
      POLICY,
    );

    // THEN
    expect(outcome).toEqual({
      kind: "failed",
      reason: "network-error",
      httpStatus: null,
    });
  });

  it("passes other rejections through unchanged", async () => {
    // GIVEN
    const rejection = {
      kind: "failed",
      reason: "timeout",
      httpStatus: null,
    } as const;

    // WHEN
    const outcome = await settleRefusal(rejection, POLICY);

    // THEN
    expect(outcome).toBe(rejection);
  });
});
