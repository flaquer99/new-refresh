import { errors } from "playwright";
import { describe, expect, it } from "vitest";
import { classifyNavigationError } from "./classify-navigation-error.js";

describe("classifyNavigationError", () => {
  it("fails a navigation timeout with reason timeout", () => {
    // GIVEN
    const error = new errors.TimeoutError(
      "page.goto: Timeout 30000ms exceeded.",
    );

    // WHEN
    const outcome = classifyNavigationError(error);

    // THEN
    expect(outcome).toEqual({
      kind: "failed",
      reason: "timeout",
      httpStatus: null,
    });
  });

  it("skips a navigation aborted by a download as not-html", () => {
    // GIVEN
    const error = new Error("page.goto: Download is starting");

    // WHEN
    const outcome = classifyNavigationError(error);

    // THEN
    expect(outcome).toEqual({
      kind: "skipped",
      reason: "not-html",
      httpStatus: null,
    });
  });

  it("fails a Chromium network error with reason network-error", () => {
    // GIVEN
    const error = new Error(
      "page.goto: net::ERR_CONNECTION_REFUSED at http://x/",
    );

    // WHEN
    const outcome = classifyNavigationError(error);

    // THEN
    expect(outcome).toEqual({
      kind: "failed",
      reason: "network-error",
      httpStatus: null,
    });
  });

  it("rethrows an error that is not a navigation failure", () => {
    // GIVEN
    const error = new Error(
      "page.goto: Target page, context or browser has been closed",
    );

    // WHEN
    const classify = () => classifyNavigationError(error);

    // THEN
    expect(classify).toThrowError(
      "Target page, context or browser has been closed",
    );
  });

  it("rethrows a non-Error value", () => {
    // WHEN
    const classify = () => classifyNavigationError("boom");

    // THEN
    expect(classify).toThrowError("boom");
  });
});
