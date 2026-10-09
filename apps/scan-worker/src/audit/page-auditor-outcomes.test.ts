import { describe, expect, it } from "vitest";
import { useAuditor } from "../testing/use-auditor.js";

describe("PageAuditor load outcomes", () => {
  const auditor = useAuditor();

  it("returns the final URL and the absolute links found on the page", async () => {
    // WHEN
    const result = await auditor.audit("/crawl/");

    // THEN
    const origin = auditor.origin();
    expect(result).toMatchObject({
      kind: "audited",
      finalUrl: `${origin}/crawl/`,
      links: [`${origin}/crawl/b.html`, `${origin}/crawl/c.html`],
    });
  });

  it("records how long each viewport pass took", async () => {
    // WHEN
    const result = await auditor.audit("/clean/");

    // THEN
    expect(result).toMatchObject({
      durationsMs: { desktop: expect.any(Number), mobile: expect.any(Number) },
    });
  });

  it("skips a PDF as not-html with its HTTP status", async () => {
    // WHEN
    const result = await auditor.audit("/page-coverage/brochure.pdf");

    // THEN
    expect(result).toEqual({
      kind: "skipped",
      reason: "not-html",
      httpStatus: 200,
    });
  });

  it("fails a missing page with http-error 404", async () => {
    // WHEN
    const result = await auditor.audit("/page-coverage/missing.html");

    // THEN
    expect(result).toEqual({
      kind: "failed",
      reason: "http-error",
      httpStatus: 404,
    });
  });

  it("fails a page on a non-public address with blocked-address", async () => {
    // WHEN
    const result = await auditor.audit(`${auditor.crossOrigin()}/clean/`);

    // THEN
    expect(result).toEqual({
      kind: "failed",
      reason: "blocked-address",
      httpStatus: null,
    });
  });

  it("fails a host that does not resolve with network-error", async () => {
    // WHEN
    const result = await auditor.audit("http://nowhere.invalid/");

    // THEN
    expect(result).toEqual({
      kind: "failed",
      reason: "network-error",
      httpStatus: null,
    });
  });

  it("closes the page of every viewport after the audit", async () => {
    // WHEN
    await auditor.audit("/clean/");

    // THEN
    const { desktop, mobile } = auditor.contexts();
    expect([desktop.pages().length, mobile.pages().length]).toEqual([0, 0]);
  });
});
