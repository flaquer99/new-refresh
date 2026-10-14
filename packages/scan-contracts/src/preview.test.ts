import { describe, expect, it } from "vitest";
import { MAX_URL_LENGTH } from "./limits.js";
import {
  PREVIEW_VIEWPORT_SIZES,
  PreviewFetchRequestSchema,
  PreviewFetchResultSchema,
} from "./preview.js";
import {
  FindingPreviewSchema,
  PreviewHighlightMessageSchema,
} from "./preview-ui.js";

describe("PreviewFetchRequestSchema", () => {
  it("accepts an https page URL", () => {
    // GIVEN
    const body = { pageUrl: "https://example.com/pricing" };

    // WHEN
    const result = PreviewFetchRequestSchema.safeParse(body);

    // THEN
    expect(result.data).toEqual(body);
  });

  it("rejects a non-http URL", () => {
    // GIVEN
    const body = { pageUrl: "ftp://example.com/file" };

    // WHEN
    const result = PreviewFetchRequestSchema.safeParse(body);

    // THEN
    expect(result.error?.issues[0]?.path).toEqual(["pageUrl"]);
  });

  it("rejects a string that is not a URL", () => {
    // WHEN
    const result = PreviewFetchRequestSchema.safeParse({ pageUrl: "nope" });

    // THEN
    expect(result.error?.issues[0]?.path).toEqual(["pageUrl"]);
  });

  it("rejects a URL over the maximum length", () => {
    // GIVEN
    const pageUrl = `https://example.com/${"a".repeat(MAX_URL_LENGTH)}`;

    // WHEN
    const result = PreviewFetchRequestSchema.safeParse({ pageUrl });

    // THEN
    expect(result.error?.issues[0]?.path).toEqual(["pageUrl"]);
  });
});

describe("PreviewFetchResultSchema", () => {
  it("accepts a loaded result", () => {
    // GIVEN
    const body = {
      kind: "loaded",
      finalUrl: "https://example.com/pricing/",
      html: "<!DOCTYPE html><html></html>",
    };

    // WHEN
    const result = PreviewFetchResultSchema.safeParse(body);

    // THEN
    expect(result.data).toEqual(body);
  });

  it("accepts an unavailable result", () => {
    // GIVEN
    const body = { kind: "unavailable", reason: "http-error", httpStatus: 404 };

    // WHEN
    const result = PreviewFetchResultSchema.safeParse(body);

    // THEN
    expect(result.data).toEqual(body);
  });

  it("rejects an unknown reason", () => {
    // GIVEN
    const body = { kind: "unavailable", reason: "teapot", httpStatus: null };

    // WHEN
    const result = PreviewFetchResultSchema.safeParse(body);

    // THEN
    expect(result.error?.issues[0]?.path).toEqual(["reason"]);
  });
});

describe("FindingPreviewSchema", () => {
  it("accepts a loaded preview", () => {
    // GIVEN
    const body = {
      kind: "loaded",
      pageUrl: "https://example.com/pricing",
      finalUrl: "https://example.com/pricing/",
      document: "<!DOCTYPE html>",
      token: "6f1c2a7e-3a4b-4c55-9d0e-2b7f8c1d9a10",
    };

    // WHEN
    const result = FindingPreviewSchema.safeParse(body);

    // THEN
    expect(result.data).toEqual(body);
  });

  it("accepts an unavailable preview", () => {
    // GIVEN
    const body = {
      kind: "unavailable",
      pageUrl: "https://example.com/old-page",
      reason: "http-error",
      httpStatus: 410,
    };

    // WHEN
    const result = FindingPreviewSchema.safeParse(body);

    // THEN
    expect(result.data).toEqual(body);
  });
});

describe("PreviewHighlightMessageSchema", () => {
  const valid = {
    source: "refresh-preview",
    token: "6f1c2a7e",
    outcome: "highlighted",
    matchCount: 3,
  };

  it("accepts a highlighted message", () => {
    // WHEN
    const result = PreviewHighlightMessageSchema.safeParse(valid);

    // THEN
    expect(result.data).toEqual(valid);
  });

  it("rejects an unknown outcome", () => {
    // WHEN
    const result = PreviewHighlightMessageSchema.safeParse({
      ...valid,
      outcome: "exploded",
    });

    // THEN
    expect(result.error?.issues[0]?.path).toEqual(["outcome"]);
  });

  it("rejects a negative match count", () => {
    // WHEN
    const result = PreviewHighlightMessageSchema.safeParse({
      ...valid,
      matchCount: -1,
    });

    // THEN
    expect(result.error?.issues[0]?.path).toEqual(["matchCount"]);
  });
});

describe("PREVIEW_VIEWPORT_SIZES", () => {
  it("defines desktop and mobile sizes", () => {
    // THEN
    expect(PREVIEW_VIEWPORT_SIZES).toEqual({
      desktop: { width: 1280, height: 800 },
      mobile: { width: 320, height: 640 },
    });
  });
});
