import { describe, expect, it } from "vitest";
import { loadConfig } from "./config.js";

const TOKEN = "t".repeat(32);
const CALLBACK_TOKEN = "c".repeat(32);

describe("loadConfig callback settings", () => {
  it("reads the callback url and token", () => {
    // GIVEN
    const env = {
      SCAN_WORKER_TOKEN: TOKEN,
      SCAN_CALLBACK_TOKEN: CALLBACK_TOKEN,
      SCAN_CALLBACK_URL: "http://127.0.0.1:3090/api/internal/scans",
    };

    // WHEN
    const config = loadConfig(env);

    // THEN
    expect(config).toMatchObject({
      callbackUrl: "http://127.0.0.1:3090/api/internal/scans",
      callbackToken: CALLBACK_TOKEN,
    });
  });

  it("defaults the callback url to the local web app", () => {
    // GIVEN
    const env = {
      SCAN_WORKER_TOKEN: TOKEN,
      SCAN_CALLBACK_TOKEN: CALLBACK_TOKEN,
    };

    // WHEN
    const config = loadConfig(env);

    // THEN
    expect(config.callbackUrl).toBe("http://127.0.0.1:3000/api/internal/scans");
  });

  it("refuses to start without a callback token", () => {
    // GIVEN
    const env = { SCAN_WORKER_TOKEN: TOKEN };

    // WHEN
    const loading = () => loadConfig(env);

    // THEN
    expect(loading).toThrowError(
      "Invalid worker config: SCAN_CALLBACK_TOKEN is required",
    );
  });

  it("refuses a callback token shorter than 32 characters", () => {
    // GIVEN
    const env = {
      SCAN_WORKER_TOKEN: TOKEN,
      SCAN_CALLBACK_TOKEN: "c".repeat(31),
    };

    // WHEN
    const loading = () => loadConfig(env);

    // THEN
    expect(loading).toThrowError(
      "Invalid worker config: SCAN_CALLBACK_TOKEN must be at least 32 characters",
    );
  });

  it("refuses a callback url that is not http(s)", () => {
    // GIVEN
    const env = {
      SCAN_WORKER_TOKEN: TOKEN,
      SCAN_CALLBACK_TOKEN: CALLBACK_TOKEN,
      SCAN_CALLBACK_URL: "ftp://127.0.0.1/api/internal/scans",
    };

    // WHEN
    const loading = () => loadConfig(env);

    // THEN
    expect(loading).toThrowError("SCAN_CALLBACK_URL must be an http(s) URL");
  });

  it("refuses a callback token equal to the worker token", () => {
    // GIVEN
    const env = { SCAN_WORKER_TOKEN: TOKEN, SCAN_CALLBACK_TOKEN: TOKEN };

    // WHEN
    const loading = () => loadConfig(env);

    // THEN
    expect(loading).toThrowError(
      "SCAN_CALLBACK_TOKEN must differ from SCAN_WORKER_TOKEN",
    );
  });
});
