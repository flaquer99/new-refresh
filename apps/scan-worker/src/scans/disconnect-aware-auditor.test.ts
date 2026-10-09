import { describe, expect, it } from "vitest";
import type { PageAuditResult } from "../audit/page-audit-result.js";
import { FakeBrowser } from "../testing/fake-browser.js";
import { stubAuditor } from "../testing/stub-auditor.js";
import { disconnectAwareAuditor } from "./disconnect-aware-auditor.js";

const HOME = "https://a.test/";
const NETWORK_FAILURE: PageAuditResult = {
  kind: "failed",
  reason: "network-error",
  httpStatus: null,
};

describe("disconnectAwareAuditor", () => {
  it("audits through the wrapped auditor while the browser is connected", async () => {
    // GIVEN
    const auditor = disconnectAwareAuditor(
      stubAuditor({ [HOME]: {} }),
      new FakeBrowser(),
    );

    // WHEN
    const result = await auditor.audit({ url: HOME, isStartPage: true });

    // THEN
    expect(result.kind).toBe("audited");
  });

  it("rejects audits once its browser has disconnected", async () => {
    // GIVEN
    const browser = new FakeBrowser();
    const auditor = disconnectAwareAuditor(
      stubAuditor({ [HOME]: {} }),
      browser,
    );
    browser.crash();

    // WHEN
    const auditing = auditor.audit({ url: HOME, isStartPage: true });

    // THEN
    await expect(auditing).rejects.toThrowError("Browser disconnected");
  });

  it("rejects an audit whose browser disconnected while the page loaded", async () => {
    // GIVEN
    const browser = new FakeBrowser();
    const inner = stubAuditor({});
    inner.audit.mockImplementationOnce(() => {
      browser.crash();
      return Promise.resolve(NETWORK_FAILURE);
    });
    const auditor = disconnectAwareAuditor(inner, browser);

    // WHEN
    const auditing = auditor.audit({ url: HOME, isStartPage: true });

    // THEN
    await expect(auditing).rejects.toThrowError("Browser disconnected");
  });

  it("closes the wrapped auditor", async () => {
    // GIVEN
    const inner = stubAuditor({ [HOME]: {} });
    const auditor = disconnectAwareAuditor(inner, new FakeBrowser());

    // WHEN
    await auditor.close();

    // THEN
    expect(inner.close).toHaveBeenCalledTimes(1);
  });
});
