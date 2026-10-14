import type { PreviewFetchResult } from "@refresh/scan-contracts/preview";
import { describe, expect, it, vi } from "vitest";
import { postPreview, startTestServer } from "../../testing/server-harness.js";

const HTTP_OK = 200;
const HTTP_BAD_REQUEST = 400;
const HTTP_UNAUTHORIZED = 401;
const HTTP_INTERNAL_ERROR = 500;
const PAGE_URL = "https://www.example.org/pricing";

describe("POST /previews", () => {
  it("answers 401 without a bearer token and does not fetch", async () => {
    // GIVEN
    const fetchPreview = vi.fn();
    const { app } = startTestServer({ fetchPreview });

    // WHEN
    const response = await app.inject({
      method: "POST",
      url: "/previews",
      payload: { pageUrl: PAGE_URL },
    });

    // THEN
    expect(response.statusCode).toBe(HTTP_UNAUTHORIZED);
    expect(fetchPreview).not.toHaveBeenCalled();
  });

  it.each([
    ["a missing pageUrl", {}],
    ["a non-http url", { pageUrl: "ftp://example.org/" }],
    ["a non-url string", { pageUrl: "not a url" }],
  ])("answers 400 INVALID_REQUEST for %s", async (_name, body) => {
    // GIVEN
    const fetchPreview = vi.fn();
    const { app } = startTestServer({ fetchPreview });

    // WHEN
    const response = await postPreview(app, body);

    // THEN
    expect(response.statusCode).toBe(HTTP_BAD_REQUEST);
    expect(response.json().error.code).toBe("INVALID_REQUEST");
    expect(fetchPreview).not.toHaveBeenCalled();
  });

  it("relays the loaded result as 200 with the client id", async () => {
    // GIVEN
    const loaded: PreviewFetchResult = {
      kind: "loaded",
      finalUrl: PAGE_URL,
      html: "<p>hi</p>",
    };
    const fetchPreview = vi.fn().mockResolvedValue(loaded);
    const { app } = startTestServer({ fetchPreview });

    // WHEN
    const response = await postPreview(app, { pageUrl: PAGE_URL }, "alice");

    // THEN
    expect(response.statusCode).toBe(HTTP_OK);
    expect(response.json()).toEqual(loaded);
    expect(fetchPreview).toHaveBeenCalledWith(PAGE_URL, "alice");
  });

  it("relays a blocked-address outcome as 200", async () => {
    // GIVEN
    const blocked: PreviewFetchResult = {
      kind: "unavailable",
      reason: "blocked-address",
      httpStatus: null,
    };
    const { app } = startTestServer({
      fetchPreview: () => Promise.resolve(blocked),
    });

    // WHEN
    const response = await postPreview(app, { pageUrl: PAGE_URL });

    // THEN
    expect(response.statusCode).toBe(HTTP_OK);
    expect(response.json()).toEqual(blocked);
  });

  it("answers 500 INTERNAL_ERROR when fetchPreview throws", async () => {
    // GIVEN
    const { app } = startTestServer({
      fetchPreview: () => Promise.reject(new Error("boom")),
    });

    // WHEN
    const response = await postPreview(app, { pageUrl: PAGE_URL });

    // THEN
    expect(response.statusCode).toBe(HTTP_INTERNAL_ERROR);
    expect(response.json().error.code).toBe("INTERNAL_ERROR");
  });
});
