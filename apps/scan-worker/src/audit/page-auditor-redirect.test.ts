import {
  type FixtureServer,
  serveFixtures,
} from "@refresh/a11y-fixtures/serve-fixtures";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import {
  type CustomAuditor,
  startCustomAuditor,
} from "../testing/custom-auditor.js";
import {
  type RedirectServer,
  startRedirectServer,
} from "../testing/redirect-server.js";

const EPHEMERAL_PORT = 0;

describe("PageAuditor redirects", () => {
  let fixtures: FixtureServer;
  let redirector: RedirectServer;
  let custom: CustomAuditor;

  beforeEach(async () => {
    fixtures = await serveFixtures({ port: EPHEMERAL_PORT });
    redirector = await startRedirectServer(`${fixtures.origin}/clean/#top`);
    const authorities = [fixtures.origin, redirector.origin];
    custom = await startCustomAuditor(authorities.map((o) => new URL(o).host));
  });

  afterEach(async () => {
    await custom.close();
    await redirector.close();
    await fixtures.close();
  });

  it("reports the redirect target without its fragment as the page URL", async () => {
    // GIVEN
    const target = `${fixtures.origin}/clean/`;

    // WHEN
    const result = await custom.auditor.audit({
      url: `${redirector.origin}/`,
      isStartPage: false,
    });

    // THEN
    expect(result).toMatchObject({
      kind: "audited",
      finalUrl: target,
      findings: { probeMatches: { pageUrl: target } },
    });
  });
});
