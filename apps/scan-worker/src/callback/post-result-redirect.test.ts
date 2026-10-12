import { afterEach, beforeEach, describe, expect, it } from "vitest";
import {
  type CallbackServer,
  startCallbackServer,
} from "../testing/callback-server.js";
import { FAILED_RESULT, newNotifier } from "../testing/notifier-harness.js";
import {
  type RedirectServer,
  startRedirectServer,
} from "../testing/redirect-server.js";

const HTTP_TEMPORARY_REDIRECT = 307;
const CALLBACK_PATH = "/api/internal/scans";

describe("result notifier redirects", () => {
  let target: CallbackServer;
  let redirect: RedirectServer;

  beforeEach(async () => {
    target = await startCallbackServer();
    redirect = await startRedirectServer(
      `${target.url}/${FAILED_RESULT.scanId}/result`,
      HTTP_TEMPORARY_REDIRECT,
    );
  });

  afterEach(async () => {
    await redirect.close();
    await target.close();
  });

  it("never re-posts the result to a redirect location", async () => {
    // GIVEN
    const { notifier } = newNotifier({
      url: `${redirect.origin}${CALLBACK_PATH}`,
    });

    // WHEN
    await notifier.notify(FAILED_RESULT);

    // THEN
    expect(target.received).toHaveLength(0);
  });

  it("reports a redirect answer as rejected after one attempt", async () => {
    // GIVEN
    const { notifier } = newNotifier({
      url: `${redirect.origin}${CALLBACK_PATH}`,
    });

    // WHEN
    const outcome = await notifier.notify(FAILED_RESULT);

    // THEN
    expect([outcome, redirect.hits()]).toEqual(["rejected", 1]);
  });
});
