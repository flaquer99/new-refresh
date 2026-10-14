import { afterEach, beforeEach, describe, expect, it } from "vitest";
import {
  createGuardedFetch,
  type GuardedFetchClient,
} from "../network/guarded-fetch.js";
import {
  type GuardHarness,
  startGuardHarness,
} from "../testing/guard-harness.js";
import { previewInput } from "../testing/preview-harness.js";
import {
  type RedirectServer,
  startRedirectServer,
} from "../testing/redirect-server.js";
import { fetchPreviewPage } from "./fetch-preview-page.js";

describe("fetchPreviewPage through the real egress guard", () => {
  let harness: GuardHarness;
  let client: GuardedFetchClient;
  let privateTarget: RedirectServer;

  beforeEach(async () => {
    harness = await startGuardHarness();
    client = createGuardedFetch(harness.guard);
    privateTarget = await startRedirectServer(`${harness.fixtures.origin}/`);
  });

  afterEach(async () => {
    await client.close();
    await privateTarget.close();
    await harness.close();
  });

  const preview = (url: string) =>
    fetchPreviewPage(
      previewInput(client.fetch, { url, policy: harness.policy }),
    );

  it("loads the low-contrast fixture page", async () => {
    // GIVEN
    const url = `${harness.fixtures.origin}/low-contrast/`;

    // WHEN
    const result = await preview(url);

    // THEN
    expect(result).toMatchObject({ kind: "loaded", finalUrl: url });
    expect(result.kind === "loaded" && result.html).toContain("<html");
  });

  it("blocks a non-allowlisted loopback target without connecting", async () => {
    // WHEN
    const result = await preview(`${privateTarget.origin}/secret`);

    // THEN
    expect(result).toMatchObject({ reason: "blocked-address" });
    expect(privateTarget.hits()).toBe(0);
  });

  it("follows a redirect and reports the final url", async () => {
    // GIVEN
    const redirector = await startRedirectServer(
      `${harness.fixtures.origin}/clean/`,
    );
    (harness.policy.allowlist as Set<string>).add(
      new URL(redirector.origin).host,
    );

    // WHEN
    const result = await preview(`${redirector.origin}/start`);
    await redirector.close();

    // THEN
    expect(result).toMatchObject({
      kind: "loaded",
      finalUrl: `${harness.fixtures.origin}/clean/`,
    });
  });

  it("reports http-error for the fixture 404 route", async () => {
    // WHEN
    const result = await preview(`${harness.fixtures.origin}/missing-page`);

    // THEN
    expect(result).toMatchObject({ reason: "http-error", httpStatus: 404 });
  });

  it("reports not-html for the fixture pdf", async () => {
    // WHEN
    const result = await preview(
      `${harness.fixtures.origin}/page-coverage/brochure.pdf`,
    );

    // THEN
    expect(result).toMatchObject({ reason: "not-html" });
  });
});
