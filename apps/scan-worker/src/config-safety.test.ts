import { describe, expect, it } from "vitest";
import { loadConfig } from "./config.js";

const TOKEN = "t".repeat(32);
const CALLBACK_TOKEN = "c".repeat(32);

describe("loadConfig safety checks", () => {
  it("refuses an egress allowlist when NODE_ENV is production", () => {
    // GIVEN
    const env = {
      SCAN_WORKER_TOKEN: TOKEN,
      SCAN_CALLBACK_TOKEN: CALLBACK_TOKEN,
      SCAN_EGRESS_ALLOWLIST: "127.0.0.1:4100",
      NODE_ENV: "production",
    };

    // WHEN
    const loading = () => loadConfig(env);

    // THEN
    expect(loading).toThrowError(
      "SCAN_EGRESS_ALLOWLIST must not be set when NODE_ENV=production",
    );
  });

  it("accepts production when the allowlist is empty", () => {
    // GIVEN
    const env = {
      SCAN_WORKER_TOKEN: TOKEN,
      SCAN_CALLBACK_TOKEN: CALLBACK_TOKEN,
      SCAN_EGRESS_ALLOWLIST: "",
      NODE_ENV: "production",
    };

    // WHEN
    const config = loadConfig(env);

    // THEN
    expect(config.egressAllowlist.size).toBe(0);
  });

  it("refuses to start without a token", () => {
    // GIVEN
    const env = {};

    // WHEN
    const loading = () => loadConfig(env);

    // THEN
    expect(loading).toThrowError(/SCAN_WORKER_TOKEN/);
  });

  it("refuses a token shorter than 32 characters", () => {
    // GIVEN
    const env = {
      SCAN_WORKER_TOKEN: "t".repeat(31),
      SCAN_CALLBACK_TOKEN: CALLBACK_TOKEN,
    };

    // WHEN
    const loading = () => loadConfig(env);

    // THEN
    expect(loading).toThrowError(
      "Invalid worker config: SCAN_WORKER_TOKEN must be at least 32 characters",
    );
  });
});
