import type { LookupAddress, LookupAllOptions } from "node:dns";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { resolveHost } from "./resolve-host.js";

type LookupAll = (
  host: string,
  options: LookupAllOptions,
) => Promise<LookupAddress[]>;

const lookupMock = vi.hoisted(() => vi.fn<LookupAll>());

vi.mock("node:dns/promises", () => ({ lookup: lookupMock }));

const dnsError = (code: string) => Object.assign(new Error(code), { code });

const LOOKUP_FAILURE_CODES = [
  "ENOTFOUND",
  "EAI_FAIL",
  "ETIMEOUT",
  "ECONNREFUSED",
  "EAI_AGAIN",
];

describe("resolveHost", () => {
  beforeEach(() => {
    lookupMock.mockReset();
  });

  it("returns every address the resolver reports", async () => {
    // GIVEN
    lookupMock.mockResolvedValue([
      { address: "93.184.216.34", family: 4 },
      { address: "10.0.0.1", family: 4 },
    ]);

    // WHEN
    const addresses = await resolveHost("example.com");

    // THEN
    expect(addresses).toEqual(["93.184.216.34", "10.0.0.1"]);
  });

  it("asks the resolver for all addresses in resolver order", async () => {
    // GIVEN
    lookupMock.mockResolvedValue([]);

    // WHEN
    await resolveHost("example.com");

    // THEN
    expect(lookupMock).toHaveBeenCalledWith("example.com", {
      all: true,
      order: "verbatim",
    });
  });

  it("unwraps a bracketed IPv6 literal before resolving", async () => {
    // GIVEN
    lookupMock.mockResolvedValue([{ address: "::1", family: 6 }]);

    // WHEN
    await resolveHost("[::1]");

    // THEN
    expect(lookupMock).toHaveBeenCalledWith("::1", expect.any(Object));
  });

  it.each(LOOKUP_FAILURE_CODES)(
    "returns no addresses when the lookup fails with %s",
    async (code) => {
      // GIVEN
      lookupMock.mockRejectedValue(dnsError(code));

      // WHEN
      const addresses = await resolveHost("missing.example");

      // THEN
      expect(addresses).toEqual([]);
    },
  );

  it("returns no addresses when the lookup fails without an error code", async () => {
    // GIVEN
    lookupMock.mockRejectedValue(new TypeError("boom"));

    // WHEN
    const addresses = await resolveHost("example.com");

    // THEN
    expect(addresses).toEqual([]);
  });
});
