import { describe, expect, it } from "vitest";
import { redactError, redactUrls } from "./redact-urls.js";

describe("redactUrls", () => {
  it("keeps only the origin and path of every URL in the text", () => {
    // WHEN
    const text = redactUrls(
      "from http://a.test:8080/x?q=1 to https://b.test/y#frag",
    );

    // THEN
    expect(text).toBe("from http://a.test:8080/x to https://b.test/y");
  });

  it("leaves text that only looks like a URL unchanged", () => {
    // WHEN
    const text = redactUrls("broken http://[oops/path?x=1");

    // THEN
    expect(text).toBe("broken http://[oops/path?x=1");
  });
});

describe("redactError", () => {
  it("keeps the error name of a redacted error", () => {
    // GIVEN
    const error = new TypeError("bad https://a.test/p?token=1");

    // WHEN
    const redacted = redactError(error);

    // THEN
    expect(redacted).toMatchObject({
      name: "TypeError",
      message: "bad https://a.test/p",
    });
  });

  it("redacts a thrown value that is not an Error", () => {
    // WHEN
    const redacted = redactError("failed https://a.test/p?token=1");

    // THEN
    expect(redacted).toBe("failed https://a.test/p");
  });
});
