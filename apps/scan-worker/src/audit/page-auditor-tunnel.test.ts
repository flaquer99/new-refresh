import { afterEach, beforeEach, describe, expect, it } from "vitest";
import {
  type CustomAuditor,
  startCustomAuditor,
} from "../testing/custom-auditor.js";
import {
  type RedirectServer,
  startRedirectServer,
} from "../testing/redirect-server.js";

const PRIVATE_HTTPS_TARGET = "https://127.0.0.1:8443/";

describe("PageAuditor refused HTTPS tunnels", () => {
  let redirector: RedirectServer;
  let custom: CustomAuditor;

  beforeEach(async () => {
    redirector = await startRedirectServer(PRIVATE_HTTPS_TARGET);
    custom = await startCustomAuditor([new URL(redirector.origin).host]);
  });

  afterEach(async () => {
    await custom.close();
    await redirector.close();
  });

  it("fails a redirect to a private HTTPS address as blocked-address", async () => {
    // GIVEN
    const url = `${redirector.origin}/`;

    // WHEN
    const result = await custom.auditor.audit({ url, isStartPage: true });

    // THEN
    expect(result).toEqual({
      kind: "failed",
      reason: "blocked-address",
      httpStatus: null,
    });
  });
});
