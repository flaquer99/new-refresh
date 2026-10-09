import { describe, expect, it, vi } from "vitest";
import { TargetNotAllowedError } from "./target-not-allowed-error.js";
import { validateTarget } from "./validate-target.js";

const PUBLIC_IP = "93.184.216.34";
const NO_ALLOWLIST = new Set<string>();

const resolverReturning = (addresses: string[]) =>
  vi.fn().mockResolvedValue(addresses);

const rejectionOf = async (promise: Promise<unknown>): Promise<unknown> => {
  try {
    await promise;
  } catch (error) {
    return error;
  }
  throw new Error("Expected the promise to reject");
};

describe("validateTarget", () => {
  it("accepts a host that resolves only to public addresses", async () => {
    // GIVEN
    const resolve = resolverReturning([PUBLIC_IP]);

    // WHEN
    const result = await validateTarget({
      url: "https://example.com/start",
      resolve,
      allowlist: NO_ALLOWLIST,
    });

    // THEN
    expect(result).toBeUndefined();
    expect(resolve).toHaveBeenCalledWith("example.com");
  });

  it("rejects a host with any private address as URL_NOT_ALLOWED", async () => {
    // GIVEN
    const resolve = resolverReturning([PUBLIC_IP, "10.0.0.1"]);

    // WHEN
    const error = await rejectionOf(
      validateTarget({
        url: "https://example.com",
        resolve,
        allowlist: NO_ALLOWLIST,
      }),
    );

    // THEN
    expect(error).toBeInstanceOf(TargetNotAllowedError);
    expect(error).toMatchObject({ code: "URL_NOT_ALLOWED" });
  });

  it("accepts a host that does not resolve (NXDOMAIN)", async () => {
    // GIVEN
    const resolve = resolverReturning([]);

    // WHEN
    const result = await validateTarget({
      url: "https://missing.example",
      resolve,
      allowlist: NO_ALLOWLIST,
    });

    // THEN
    expect(result).toBeUndefined();
  });

  it("rejects a loopback IP literal", async () => {
    // GIVEN
    const resolve = resolverReturning(["127.0.0.1"]);

    // WHEN
    const validating = validateTarget({
      url: "http://127.0.0.1:8080/",
      resolve,
      allowlist: NO_ALLOWLIST,
    });

    // THEN
    await expect(validating).rejects.toThrowError(
      "This address points to a private or local network and can't be scanned.",
    );
  });
});
