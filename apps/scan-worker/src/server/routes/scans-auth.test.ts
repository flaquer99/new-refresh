import { describe, expect, it } from "vitest";
import {
  PUBLIC_URL,
  startTestServer,
  useServerTestClock,
} from "../../testing/server-harness.js";

const HTTP_UNAUTHORIZED = 401;

describe("worker bearer-token auth", () => {
  useServerTestClock();

  it("rejects POST /scans without a bearer token before starting a scan", async () => {
    // GIVEN
    const { app, controlled } = startTestServer();

    // WHEN
    const response = await app.inject({
      method: "POST",
      url: "/scans",
      payload: { url: PUBLIC_URL, depth: 0 },
    });

    // THEN
    expect(response.statusCode).toBe(HTTP_UNAUTHORIZED);
    expect(response.json()).toEqual({
      error: { code: "UNAUTHORIZED", message: "Missing or invalid token." },
    });
    expect(controlled.scans).toHaveLength(0);
  });

  it("rejects a bearer token that does not match", async () => {
    // GIVEN
    const { app } = startTestServer();

    // WHEN
    const response = await app.inject({
      method: "POST",
      url: "/scans",
      headers: { authorization: `Bearer ${"x".repeat(40)}` },
      payload: { url: PUBLIC_URL, depth: 0 },
    });

    // THEN
    expect(response.json().error.code).toBe("UNAUTHORIZED");
  });

  it("rejects a token sent without the Bearer scheme", async () => {
    // GIVEN
    const { app } = startTestServer();

    // WHEN
    const response = await app.inject({
      method: "GET",
      url: "/scans/any",
      headers: { authorization: "w".repeat(40) },
    });

    // THEN
    expect(response.statusCode).toBe(HTTP_UNAUTHORIZED);
  });

  it.each(["GET", "DELETE"] as const)(
    "protects %s /scans/:id",
    async (method) => {
      // GIVEN
      const { app } = startTestServer();

      // WHEN
      const response = await app.inject({ method, url: "/scans/any" });

      // THEN
      expect(response.statusCode).toBe(HTTP_UNAUTHORIZED);
    },
  );
});
