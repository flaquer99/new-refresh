import { describe, expect, it, vi } from "vitest";
import { validateTarget } from "./validate-target.js";

const PUBLIC_IP = "93.184.216.34";
const FIXTURE_PORT = 4100;
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

describe("validateTarget input handling", () => {
  it("accepts a loopback target whose host and port are allowlisted", async () => {
    // GIVEN
    const resolve = resolverReturning(["127.0.0.1"]);

    // WHEN
    const result = await validateTarget({
      url: `http://127.0.0.1:${FIXTURE_PORT}/clean/`,
      resolve,
      allowlist: new Set([`127.0.0.1:${FIXTURE_PORT}`]),
    });

    // THEN
    expect(result).toBeUndefined();
  });

  it("checks the allowlist against the scheme's default port", async () => {
    // GIVEN
    const resolve = resolverReturning(["127.0.0.1"]);

    // WHEN
    const result = await validateTarget({
      url: "https://localhost/",
      resolve,
      allowlist: new Set(["localhost:443"]),
    });

    // THEN
    expect(result).toBeUndefined();
  });

  it.each(["ftp://example.com/", "file:///etc/passwd", "not a url"])(
    "rejects the non-http(s) target %s without resolving it",
    async (url) => {
      // GIVEN
      const resolve = resolverReturning([PUBLIC_IP]);

      // WHEN
      const error = await rejectionOf(
        validateTarget({ url, resolve, allowlist: NO_ALLOWLIST }),
      );

      // THEN
      expect(error).toMatchObject({ code: "URL_NOT_ALLOWED" });
      expect(resolve).not.toHaveBeenCalled();
    },
  );
});
