import { describe, expect, it } from "vitest";
import { loadConfig } from "./config.js";

const TOKEN = "t".repeat(32);

describe("loadConfig", () => {
  it("applies the documented defaults when only the token is set", () => {
    // GIVEN
    const env = { SCAN_WORKER_TOKEN: TOKEN };

    // WHEN
    const config = loadConfig(env);

    // THEN
    expect(config).toEqual({
      host: "127.0.0.1",
      port: 3001,
      token: TOKEN,
      egressAllowlist: new Set(),
      logLevel: "info",
    });
  });

  it("reads host, port, log level, and a normalized allowlist from env", () => {
    // GIVEN
    const env = {
      SCAN_WORKER_TOKEN: TOKEN,
      SCAN_WORKER_HOST: "0.0.0.0",
      SCAN_WORKER_PORT: "3055",
      SCAN_EGRESS_ALLOWLIST: " 127.0.0.1:4100, Fixtures.Test:80 ,",
      LOG_LEVEL: "debug",
    };

    // WHEN
    const config = loadConfig(env);

    // THEN
    expect(config).toEqual({
      host: "0.0.0.0",
      port: 3055,
      token: TOKEN,
      egressAllowlist: new Set(["127.0.0.1:4100", "fixtures.test:80"]),
      logLevel: "debug",
    });
  });

  it("refuses a port outside the valid TCP range", () => {
    // GIVEN
    const env = { SCAN_WORKER_TOKEN: TOKEN, SCAN_WORKER_PORT: "70000" };

    // WHEN
    const loading = () => loadConfig(env);

    // THEN
    expect(loading).toThrowError(/SCAN_WORKER_PORT/);
  });

  it("refuses an allowlist entry that is not host:port", () => {
    // GIVEN
    const env = { SCAN_WORKER_TOKEN: TOKEN, SCAN_EGRESS_ALLOWLIST: "fixtures" };

    // WHEN
    const loading = () => loadConfig(env);

    // THEN
    expect(loading).toThrowError(/SCAN_EGRESS_ALLOWLIST/);
  });
});
