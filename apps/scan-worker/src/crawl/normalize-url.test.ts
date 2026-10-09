import { describe, expect, it } from "vitest";
import { isSameOrigin, normalizeUrl } from "./normalize-url.js";

describe("normalizeUrl", () => {
  it("strips the fragment so section links normalize to the same page", () => {
    // WHEN
    const normalized = ["https://a.test/a#x", "https://a.test/a#y"].map(
      normalizeUrl,
    );

    // THEN
    expect(normalized).toEqual(["https://a.test/a", "https://a.test/a"]);
  });

  it("keeps the query string", () => {
    // WHEN
    const normalized = normalizeUrl("https://a.test/a?page=2#top");

    // THEN
    expect(normalized).toBe("https://a.test/a?page=2");
  });

  it("serializes the URL canonically", () => {
    // WHEN
    const normalized = normalizeUrl("HTTPS://A.test:443");

    // THEN
    expect(normalized).toBe("https://a.test/");
  });
});

describe("isSameOrigin", () => {
  it("treats URLs with the same scheme, host, and port as same-origin", () => {
    // WHEN
    const same = isSameOrigin("https://a.test/x", "https://a.test:443/y");

    // THEN
    expect(same).toBe(true);
  });

  it("treats http and https as different origins", () => {
    // WHEN
    const same = isSameOrigin("http://a.test/", "https://a.test/");

    // THEN
    expect(same).toBe(false);
  });

  it("treats different ports as different origins", () => {
    // WHEN
    const same = isSameOrigin("http://a.test:8080/", "http://a.test:8081/");

    // THEN
    expect(same).toBe(false);
  });

  it("treats different hosts as different origins", () => {
    // WHEN
    const same = isSameOrigin("https://a.test/", "https://b.test/");

    // THEN
    expect(same).toBe(false);
  });
});
