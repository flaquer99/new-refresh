import { afterEach, beforeEach, describe, expect, it } from "vitest";
import {
  type CustomAuditor,
  startCustomAuditor,
} from "../testing/custom-auditor.js";
import {
  type HangingServer,
  startHangingServer,
} from "../testing/hanging-server.js";

describe("PageAuditor timeouts", () => {
  let hanging: HangingServer;
  let custom: CustomAuditor;

  beforeEach(async () => {
    hanging = await startHangingServer();
    custom = await startCustomAuditor([hanging.authority]);
  });

  afterEach(async () => {
    await custom.close();
    await hanging.close();
  });

  it("fails a page that does not load in time with timeout", async () => {
    // GIVEN
    const url = `http://${hanging.authority}/`;

    // WHEN
    const result = await custom.auditor.audit({ url, isStartPage: true });

    // THEN
    expect(result).toEqual({
      kind: "failed",
      reason: "timeout",
      httpStatus: null,
    });
  });
});
