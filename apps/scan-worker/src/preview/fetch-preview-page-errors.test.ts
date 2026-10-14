import { describe, expect, it, vi } from "vitest";
import { previewInput, stubResponse } from "../testing/preview-harness.js";
import { fetchPreviewPage } from "./fetch-preview-page.js";

const HTTP_BAD_GATEWAY = 502;

describe("fetchPreviewPage errors", () => {
  it("maps an unresolved egress verdict to network-error", async () => {
    // GIVEN
    const fetch = vi.fn().mockResolvedValue(
      stubResponse("", {
        status: HTTP_BAD_GATEWAY,
        headers: { "x-refresh-egress": "unresolved" },
      }),
    );

    // WHEN
    const result = await fetchPreviewPage(previewInput(fetch));

    // THEN
    expect(result).toMatchObject({ reason: "network-error" });
  });

  it("maps a thrown network error to network-error", async () => {
    // GIVEN
    const fetch = vi.fn().mockRejectedValue(new Error("fetch failed"));

    // WHEN
    const result = await fetchPreviewPage(previewInput(fetch));

    // THEN
    expect(result).toEqual({
      kind: "unavailable",
      reason: "network-error",
      httpStatus: null,
    });
  });

  it("logs the host and outcome without the full url", async () => {
    // GIVEN
    const fetch = vi.fn().mockResolvedValue(stubResponse("<p>x</p>"));
    const input = previewInput(fetch, { clientIdHash: "abc123" });

    // WHEN
    await fetchPreviewPage(input);

    // THEN
    expect(input.logger.info).toHaveBeenCalledWith(
      expect.objectContaining({
        event: "preview.fetched",
        clientIdHash: "abc123",
        host: "example.test",
        outcome: "loaded",
        httpStatus: null,
        bytes: 8,
      }),
      "preview.fetched",
    );
  });

  it("sends the scanner user agent and the html accept header", async () => {
    // GIVEN
    const fetch = vi.fn().mockResolvedValue(stubResponse("<p>x</p>"));

    // WHEN
    await fetchPreviewPage(previewInput(fetch));

    // THEN
    expect(fetch.mock.calls[0]?.[1].headers).toEqual({
      "user-agent": "TestChromium RefreshA11yScanner/1.0",
      accept: "text/html,application/xhtml+xml;q=0.9,*/*;q=0.1",
    });
  });
});
