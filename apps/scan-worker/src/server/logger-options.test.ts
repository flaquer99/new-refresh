import { describe, expect, it } from "vitest";
import { loggerOptions } from "./logger-options.js";

const serializeRequest = (url: string) => {
  const request = {
    method: "GET",
    url,
    headers: { authorization: "Bearer secret" },
  };
  return loggerOptions("info").serializers.req(request);
};

describe("loggerOptions", () => {
  it("uses the configured pino level", () => {
    // WHEN
    const options = loggerOptions("debug");

    // THEN
    expect(options.level).toBe("debug");
  });

  it("logs the request path without its query string", () => {
    // WHEN
    const fields = serializeRequest("/scans/abc?token=leak");

    // THEN
    expect(fields).toEqual({ method: "GET", url: "/scans/abc" });
  });

  it("keeps a path that has no query string", () => {
    // WHEN
    const fields = serializeRequest("/health");

    // THEN
    expect(fields).toEqual({ method: "GET", url: "/health" });
  });
});
