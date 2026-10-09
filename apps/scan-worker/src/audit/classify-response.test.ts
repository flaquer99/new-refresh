import { describe, expect, it } from "vitest";
import { classifyResponse } from "./classify-response.js";

const HTML = "text/html; charset=utf-8";

describe("classifyResponse", () => {
  it("accepts a 200 HTML response as loadable", () => {
    // WHEN
    const outcome = classifyResponse({ status: 200, contentType: HTML });

    // THEN
    expect(outcome).toEqual({ kind: "html", httpStatus: 200 });
  });

  it("skips a PDF response as not-html", () => {
    // WHEN
    const outcome = classifyResponse({
      status: 200,
      contentType: "application/pdf",
    });

    // THEN
    expect(outcome).toEqual({
      kind: "skipped",
      reason: "not-html",
      httpStatus: 200,
    });
  });

  it("fails a 404 response with http-error and its status", () => {
    // WHEN
    const outcome = classifyResponse({ status: 404, contentType: HTML });

    // THEN
    expect(outcome).toEqual({
      kind: "failed",
      reason: "http-error",
      httpStatus: 404,
    });
  });

  it("treats a 399 HTML response as loadable", () => {
    // WHEN
    const outcome = classifyResponse({ status: 399, contentType: HTML });

    // THEN
    expect(outcome.kind).toBe("html");
  });

  it("fails a 400 response before looking at its content type", () => {
    // WHEN
    const outcome = classifyResponse({ status: 400, contentType: "image/png" });

    // THEN
    expect(outcome).toEqual({
      kind: "failed",
      reason: "http-error",
      httpStatus: 400,
    });
  });

  it("accepts XHTML as HTML", () => {
    // WHEN
    const outcome = classifyResponse({
      status: 200,
      contentType: "application/xhtml+xml",
    });

    // THEN
    expect(outcome.kind).toBe("html");
  });

  it("matches the HTML content type case-insensitively", () => {
    // WHEN
    const outcome = classifyResponse({ status: 200, contentType: "Text/HTML" });

    // THEN
    expect(outcome.kind).toBe("html");
  });

  it("skips a response without a content type as not-html", () => {
    // WHEN
    const outcome = classifyResponse({ status: 200, contentType: null });

    // THEN
    expect(outcome).toEqual({
      kind: "skipped",
      reason: "not-html",
      httpStatus: 200,
    });
  });
});
