import { PREVIEW_MAX_HTML_BYTES } from "@refresh/scan-contracts/preview";
import { describe, expect, it, vi } from "vitest";
import { previewInput, stubResponse } from "../testing/preview-harness.js";
import { fetchPreviewPage } from "./fetch-preview-page.js";

const HTTP_NOT_FOUND = 404;
const FINAL_URL = "http://example.test/final";

describe("fetchPreviewPage", () => {
  it("returns the html and final url for a 200 html response", async () => {
    // GIVEN
    const fetch = vi
      .fn()
      .mockResolvedValue(stubResponse("<p>hello</p>", { url: FINAL_URL }));

    // WHEN
    const result = await fetchPreviewPage(previewInput(fetch));

    // THEN
    expect(result).toEqual({
      kind: "loaded",
      finalUrl: FINAL_URL,
      html: "<p>hello</p>",
    });
  });

  it("maps a status of 400 or more to http-error with the status", async () => {
    // GIVEN
    const fetch = vi
      .fn()
      .mockResolvedValue(stubResponse("nope", { status: HTTP_NOT_FOUND }));

    // WHEN
    const result = await fetchPreviewPage(previewInput(fetch));

    // THEN
    expect(result).toEqual({
      kind: "unavailable",
      reason: "http-error",
      httpStatus: HTTP_NOT_FOUND,
    });
  });

  it("maps a non-html content type to not-html", async () => {
    // GIVEN
    const fetch = vi.fn().mockResolvedValue(
      stubResponse("%PDF", {
        headers: { "content-type": "application/pdf" },
      }),
    );

    // WHEN
    const result = await fetchPreviewPage(previewInput(fetch));

    // THEN
    expect(result).toMatchObject({ kind: "unavailable", reason: "not-html" });
  });

  it("maps an over-cap content-length to too-large", async () => {
    // GIVEN
    const length = String(PREVIEW_MAX_HTML_BYTES + 1);
    const fetch = vi
      .fn()
      .mockResolvedValue(
        stubResponse("<p>x</p>", { headers: { "content-length": length } }),
      );

    // WHEN
    const result = await fetchPreviewPage(previewInput(fetch));

    // THEN
    expect(result).toMatchObject({ kind: "unavailable", reason: "too-large" });
  });

  it("maps a body that exceeds the cap to too-large", async () => {
    // GIVEN
    const body = new Uint8Array(PREVIEW_MAX_HTML_BYTES + 1);
    const fetch = vi.fn().mockResolvedValue(stubResponse(body));

    // WHEN
    const result = await fetchPreviewPage(previewInput(fetch));

    // THEN
    expect(result).toMatchObject({ kind: "unavailable", reason: "too-large" });
  });
});
