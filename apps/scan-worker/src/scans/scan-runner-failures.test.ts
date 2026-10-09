import { describe, expect, it } from "vitest";
import type { PageAuditResult } from "../audit/page-audit-result.js";
import { runStubScan } from "../testing/run-stub-scan.js";

const START = "https://a.test/";

const failStart = (result: PageAuditResult) =>
  runStubScan({ request: { url: START, depth: 1 }, site: { [START]: result } });

describe("ScanRunner failures", () => {
  it("fails with SITE_UNREACHABLE when the start page has a network error", async () => {
    // WHEN
    const scanning = failStart({
      kind: "failed",
      reason: "network-error",
      httpStatus: null,
    });

    // THEN
    await expect(scanning).rejects.toMatchObject({
      code: "SITE_UNREACHABLE",
      message: "We couldn't reach a.test. Check the address and try again.",
    });
  });

  it("fails with SITE_UNREACHABLE when the start page times out", async () => {
    // WHEN
    const scanning = failStart({
      kind: "failed",
      reason: "timeout",
      httpStatus: null,
    });

    // THEN
    await expect(scanning).rejects.toMatchObject({ code: "SITE_UNREACHABLE" });
  });

  it("fails with START_URL_BLOCKED when the start page redirects to a blocked address", async () => {
    // WHEN
    const scanning = failStart({
      kind: "failed",
      reason: "blocked-address",
      httpStatus: null,
    });

    // THEN
    await expect(scanning).rejects.toMatchObject({
      code: "START_URL_BLOCKED",
      message:
        "This address leads to a private or local network and can't be scanned.",
    });
  });

  it("reports a start page with an HTTP error as a failed page", async () => {
    // WHEN
    const report = await failStart({
      kind: "failed",
      reason: "http-error",
      httpStatus: 403,
    });

    // THEN
    expect(report.pages).toEqual([
      {
        url: START,
        depth: 0,
        status: "failed",
        reason: "http-error",
        httpStatus: 403,
      },
    ]);
  });

  it("keeps scanning sibling pages after a page fails", async () => {
    // GIVEN
    const site = {
      [START]: { links: [`${START}gone`, `${START}ok`] },
      [`${START}ok`]: {},
    };

    // WHEN
    const report = await runStubScan({
      request: { url: START, depth: 1 },
      site,
    });

    // THEN
    expect(report.pages.map(({ status }) => status)).toEqual([
      "scanned",
      "failed",
      "scanned",
    ]);
  });
});
