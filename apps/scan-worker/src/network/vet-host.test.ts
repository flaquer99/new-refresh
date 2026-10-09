import { describe, expect, it, vi } from "vitest";
import { vetHost } from "./vet-host.js";

const PUBLIC_IP = "93.184.216.34";
const SECOND_PUBLIC_IP = "93.184.216.35";
const HTTP_PORT = 80;
const NO_ALLOWLIST = new Set<string>();

const resolverReturning = (addresses: string[]) =>
  vi.fn().mockResolvedValue(addresses);

describe("vetHost", () => {
  it("allows a host whose addresses are all public, pinning the first", async () => {
    // GIVEN
    const resolve = resolverReturning([PUBLIC_IP, SECOND_PUBLIC_IP]);

    // WHEN
    const verdict = await vetHost({
      host: "example.com",
      port: HTTP_PORT,
      resolve,
      allowlist: NO_ALLOWLIST,
    });

    // THEN
    expect(verdict).toEqual({ kind: "allowed", address: PUBLIC_IP });
  });

  it("blocks a host when any resolved address is private", async () => {
    // GIVEN
    const resolve = resolverReturning([PUBLIC_IP, "10.0.0.1"]);

    // WHEN
    const verdict = await vetHost({
      host: "example.com",
      port: HTTP_PORT,
      resolve,
      allowlist: NO_ALLOWLIST,
    });

    // THEN
    expect(verdict).toEqual({ kind: "blocked" });
  });

  it("reports a host with no addresses as unresolved", async () => {
    // GIVEN
    const resolve = resolverReturning([]);

    // WHEN
    const verdict = await vetHost({
      host: "missing.example",
      port: HTTP_PORT,
      resolve,
      allowlist: NO_ALLOWLIST,
    });

    // THEN
    expect(verdict).toEqual({ kind: "unresolved" });
  });
});
