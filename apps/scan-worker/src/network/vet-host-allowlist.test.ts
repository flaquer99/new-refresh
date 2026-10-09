import { describe, expect, it, vi } from "vitest";
import { vetHost } from "./vet-host.js";

const FIXTURE_PORT = 4100;

const resolverReturning = (addresses: string[]) =>
  vi.fn().mockResolvedValue(addresses);

describe("vetHost allowlist", () => {
  it("allows a private address when its host and port are allowlisted", async () => {
    // GIVEN
    const resolve = resolverReturning(["127.0.0.1"]);

    // WHEN
    const verdict = await vetHost({
      host: "127.0.0.1",
      port: FIXTURE_PORT,
      resolve,
      allowlist: new Set([`127.0.0.1:${FIXTURE_PORT}`]),
    });

    // THEN
    expect(verdict).toEqual({ kind: "allowed", address: "127.0.0.1" });
  });

  it("blocks an allowlisted host on a port that is not allowlisted", async () => {
    // GIVEN
    const resolve = resolverReturning(["127.0.0.1"]);

    // WHEN
    const verdict = await vetHost({
      host: "127.0.0.1",
      port: FIXTURE_PORT + 1,
      resolve,
      allowlist: new Set([`127.0.0.1:${FIXTURE_PORT}`]),
    });

    // THEN
    expect(verdict).toEqual({ kind: "blocked" });
  });

  it("matches allowlist entries for bracketed IPv6 hosts", async () => {
    // GIVEN
    const resolve = resolverReturning(["::1"]);

    // WHEN
    const verdict = await vetHost({
      host: "[::1]",
      port: FIXTURE_PORT,
      resolve,
      allowlist: new Set([`::1:${FIXTURE_PORT}`]),
    });

    // THEN
    expect(verdict).toEqual({ kind: "allowed", address: "::1" });
  });

  it("matches allowlist entries regardless of host case", async () => {
    // GIVEN
    const resolve = resolverReturning(["127.0.0.1"]);

    // WHEN
    const verdict = await vetHost({
      host: "LocalHost",
      port: FIXTURE_PORT,
      resolve,
      allowlist: new Set([`localhost:${FIXTURE_PORT}`]),
    });

    // THEN
    expect(verdict).toEqual({ kind: "allowed", address: "127.0.0.1" });
  });
});
