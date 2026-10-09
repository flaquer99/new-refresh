import { MAX_PAGES } from "@refresh/scan-contracts/limits";
import { describe, expect, it } from "vitest";
import { expectedPageCoverage } from "../testing/expected-coverage.js";
import { useRunner } from "../testing/use-runner.js";

const LARGE_SITE_TIMEOUT_MS = 120_000;

describe("ScanRunner page coverage on fixture sites", () => {
  const runner = useRunner();

  it("records robots, PDF, and 404 pages and still scans their siblings", async () => {
    // WHEN
    const report = await runner.scan("/page-coverage/", 1);

    // THEN
    expect(report.pages).toEqual(expectedPageCoverage(runner.origin()));
  });

  it(
    "stops at 50 pages on a 60-page site and leaves the rest not-reached",
    async () => {
      // WHEN
      const report = await runner.scan("/large/", 1);

      // THEN
      const notReached = report.pages.filter((p) => p.reason === "not-reached");
      expect([
        report.outcome,
        report.summary.pagesScanned,
        notReached.length,
      ]).toEqual(["page-limit-reached", MAX_PAGES, 10]);
    },
    LARGE_SITE_TIMEOUT_MS,
  );

  it("fails with SITE_UNREACHABLE when the start host does not resolve", async () => {
    // WHEN
    const scanning = runner.scan("http://nowhere.invalid/", 0);

    // THEN
    await expect(scanning).rejects.toMatchObject({ code: "SITE_UNREACHABLE" });
  });

  it("fails with START_URL_BLOCKED when the start page is on a blocked address", async () => {
    // WHEN
    const scanning = runner.scan(`${runner.crossOrigin()}/clean/`, 0);

    // THEN
    await expect(scanning).rejects.toMatchObject({ code: "START_URL_BLOCKED" });
  });
});
