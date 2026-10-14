import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { createFetchPreview } from "../../bootstrap/preview-deps.js";
import {
  createGuardedFetch,
  type GuardedFetchClient,
} from "../../network/guarded-fetch.js";
import {
  type GuardHarness,
  startGuardHarness,
} from "../../testing/guard-harness.js";
import { postPreview, startTestServer } from "../../testing/server-harness.js";

const HTTP_OK = 200;

describe("POST /previews with the real preview fetch", () => {
  let harness: GuardHarness;
  let client: GuardedFetchClient;

  beforeEach(async () => {
    harness = await startGuardHarness();
    client = createGuardedFetch(harness.guard);
  });

  afterEach(async () => {
    await client.close();
    await harness.close();
  });

  const startServer = () =>
    startTestServer({
      fetchPreview: createFetchPreview({
        fetch: client.fetch,
        policy: harness.policy,
        logger: { info: () => undefined } as never,
      }),
    });

  it("returns the fixture page html end to end", async () => {
    // GIVEN
    const { app } = startServer();
    const pageUrl = `${harness.fixtures.origin}/low-contrast/`;

    // WHEN
    const response = await postPreview(app, { pageUrl });

    // THEN
    expect(response.statusCode).toBe(HTTP_OK);
    expect(response.json()).toMatchObject({
      kind: "loaded",
      finalUrl: pageUrl,
    });
  });

  it("answers 200 blocked-address for a private target", async () => {
    // GIVEN
    const { app } = startServer();

    // WHEN
    const response = await postPreview(app, { pageUrl: "http://10.0.0.1/" });

    // THEN
    expect(response.statusCode).toBe(HTTP_OK);
    expect(response.json()).toMatchObject({
      kind: "unavailable",
      reason: "blocked-address",
    });
  });
});
