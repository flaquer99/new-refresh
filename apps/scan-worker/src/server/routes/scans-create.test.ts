import { describe, expect, it } from "vitest";
import {
  AUTH_HEADERS,
  postScan,
  SERVER_SCAN_ID,
  startTestServer,
  useServerTestClock,
} from "../../testing/server-harness.js";

const HTTP_CREATED = 201;
const HTTP_BAD_REQUEST = 400;
const HTTP_UNPROCESSABLE = 422;

describe("POST /scans", () => {
  useServerTestClock();

  it("starts a scan for a public host and returns its id", async () => {
    // GIVEN
    const { app } = startTestServer();

    // WHEN
    const response = await postScan(app);

    // THEN
    expect(response.statusCode).toBe(HTTP_CREATED);
    expect(response.json()).toEqual({ scanId: SERVER_SCAN_ID });
  });

  it("hands the validated request to the runner", async () => {
    // GIVEN
    const { app, controlled } = startTestServer();

    // WHEN
    await postScan(app);

    // THEN
    expect(controlled.latest().input.request).toEqual({
      url: "https://www.example.org/",
      depth: 1,
    });
  });

  it("rejects a body that fails the ScanRequest schema", async () => {
    // GIVEN
    const { app } = startTestServer();

    // WHEN
    const response = await app.inject({
      method: "POST",
      url: "/scans",
      headers: AUTH_HEADERS,
      payload: { url: "ftp://www.example.org/", depth: 0 },
    });

    // THEN
    expect(response.statusCode).toBe(HTTP_BAD_REQUEST);
    expect(response.json()).toEqual({
      error: {
        code: "INVALID_REQUEST",
        message:
          "Enter a full web address that starts with http:// or https://.",
      },
    });
  });

  it("rejects a body that is not valid JSON", async () => {
    // GIVEN
    const { app } = startTestServer();

    // WHEN
    const response = await app.inject({
      method: "POST",
      url: "/scans",
      headers: { ...AUTH_HEADERS, "content-type": "application/json" },
      payload: "{not json",
    });

    // THEN
    expect(response.statusCode).toBe(HTTP_BAD_REQUEST);
    expect(response.json().error.code).toBe("INVALID_REQUEST");
  });

  it("refuses a target on a private address before reserving a slot", async () => {
    // GIVEN
    const { app, controlled } = startTestServer();

    // WHEN
    const response = await app.inject({
      method: "POST",
      url: "/scans",
      headers: AUTH_HEADERS,
      payload: { url: "http://127.0.0.1/", depth: 0 },
    });

    // THEN
    expect(response.statusCode).toBe(HTTP_UNPROCESSABLE);
    expect(response.json().error.code).toBe("URL_NOT_ALLOWED");
    expect(controlled.scans).toHaveLength(0);
  });
});
