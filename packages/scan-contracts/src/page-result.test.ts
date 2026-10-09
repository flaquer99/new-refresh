import { describe, expect, it } from "vitest";
import { PageResultSchema } from "./page-result.js";

describe("PageResultSchema", () => {
  it("parses a skipped non-html page", () => {
    // GIVEN
    const page = {
      url: "https://www.example.org/brochure.pdf",
      depth: 1,
      status: "skipped",
      reason: "not-html",
      httpStatus: 200,
    };

    // WHEN
    const result = PageResultSchema.safeParse(page);

    // THEN
    expect(result.data).toEqual(page);
  });

  it("rejects an unknown page reason", () => {
    // GIVEN
    const page = {
      url: "https://www.example.org/",
      depth: 0,
      status: "failed",
      reason: "gremlins",
      httpStatus: null,
    };

    // WHEN
    const result = PageResultSchema.safeParse(page);

    // THEN
    expect(result.error?.issues[0]?.path).toEqual(["reason"]);
  });
});
