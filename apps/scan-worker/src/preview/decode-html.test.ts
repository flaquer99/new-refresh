import { describe, expect, it } from "vitest";
import { decodeHtml } from "./decode-html.js";

const LATIN1_E_ACUTE = Uint8Array.of(0xe9);
const UTF8_E_ACUTE = Uint8Array.of(0xc3, 0xa9);

describe("decodeHtml", () => {
  it("decodes with the charset from the content type", () => {
    // WHEN
    const html = decodeHtml(LATIN1_E_ACUTE, "text/html; charset=iso-8859-1");

    // THEN
    expect(html).toBe("é");
  });

  it("falls back to utf-8 when the content type has no charset", () => {
    // WHEN
    const html = decodeHtml(UTF8_E_ACUTE, "text/html");

    // THEN
    expect(html).toBe("é");
  });

  it("falls back to utf-8 for an unknown charset label", () => {
    // WHEN
    const html = decodeHtml(UTF8_E_ACUTE, 'text/html; charset="nope-9"');

    // THEN
    expect(html).toBe("é");
  });

  it("falls back to utf-8 without a content type", () => {
    // WHEN
    const html = decodeHtml(UTF8_E_ACUTE, null);

    // THEN
    expect(html).toBe("é");
  });
});
