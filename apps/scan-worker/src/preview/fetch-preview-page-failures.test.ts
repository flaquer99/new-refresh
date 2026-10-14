import { PREVIEW_FETCH_TIMEOUT_MS } from "@refresh/scan-contracts/preview";
import { afterEach, describe, expect, it, vi } from "vitest";
import { previewInput, stubResponse } from "../testing/preview-harness.js";
import { stubResolver } from "../testing/stub-resolver.js";
import { fetchPreviewPage } from "./fetch-preview-page.js";

const LOOPBACK_URL = "http://localhost:8080/page";

describe("fetchPreviewPage failures", () => {
  afterEach(() => {
    vi.useRealTimers();
  });

  it("aborts at the fetch timeout and returns timeout", async () => {
    // GIVEN
    vi.useFakeTimers();
    const fetch = vi.fn(
      (_url: string, init?: { signal?: AbortSignal }) =>
        new Promise<never>((_resolve, reject) => {
          init?.signal?.addEventListener("abort", () =>
            reject(new Error("aborted")),
          );
        }),
    );
    const pending = fetchPreviewPage(previewInput(fetch));

    // WHEN
    await vi.advanceTimersByTimeAsync(PREVIEW_FETCH_TIMEOUT_MS);

    // THEN
    await expect(pending).resolves.toEqual({
      kind: "unavailable",
      reason: "timeout",
      httpStatus: null,
    });
  });

  it("refuses a blocked target without fetching", async () => {
    // GIVEN
    const fetch = vi.fn();
    const policy = {
      resolve: stubResolver({ localhost: ["127.0.0.1"] }),
      allowlist: new Set<string>(),
    };

    // WHEN
    const result = await fetchPreviewPage(
      previewInput(fetch, { url: LOOPBACK_URL, policy }),
    );

    // THEN
    expect(result).toMatchObject({ reason: "blocked-address" });
    expect(fetch).not.toHaveBeenCalled();
  });

  it("maps the egress blocked-address header to blocked-address", async () => {
    // GIVEN
    const fetch = vi.fn().mockResolvedValue(
      stubResponse("", {
        status: 403,
        headers: { "x-refresh-egress": "blocked-address" },
      }),
    );

    // WHEN
    const result = await fetchPreviewPage(previewInput(fetch));

    // THEN
    expect(result).toEqual({
      kind: "unavailable",
      reason: "blocked-address",
      httpStatus: null,
    });
  });
});
