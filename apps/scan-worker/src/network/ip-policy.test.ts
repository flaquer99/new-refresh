import { describe, expect, it } from "vitest";
import { isPublicAddress } from "./ip-policy.js";

const NON_PUBLIC_ADDRESSES = [
  "127.0.0.1",
  "10.0.0.5",
  "192.168.1.1",
  "169.254.169.254",
  "100.64.0.1",
  "0.0.0.0",
  "255.255.255.255",
  "::1",
  "::",
  "fd00::1",
  "fe80::1",
  "::ffff:127.0.0.1",
  "::ffff:10.0.0.1",
  "::7f00:1",
  "::a00:1",
  "::5db8:d822",
];

describe("isPublicAddress", () => {
  it("accepts a public IPv4 unicast address", () => {
    // WHEN
    const result = isPublicAddress("93.184.216.34");

    // THEN
    expect(result).toBe(true);
  });

  it("accepts a public IPv6 unicast address", () => {
    // WHEN
    const result = isPublicAddress("2606:4700:4700::1111");

    // THEN
    expect(result).toBe(true);
  });

  it.each(NON_PUBLIC_ADDRESSES)("rejects the non-unicast address %s", (ip) => {
    // WHEN
    const result = isPublicAddress(ip);

    // THEN
    expect(result).toBe(false);
  });

  it("accepts a public IPv4 address wrapped in IPv4-mapped IPv6", () => {
    // WHEN
    const result = isPublicAddress("::ffff:93.184.216.34");

    // THEN
    expect(result).toBe(true);
  });

  it("rejects a string that is not an IP address", () => {
    // WHEN
    const result = isPublicAddress("not-an-ip");

    // THEN
    expect(result).toBe(false);
  });
});
