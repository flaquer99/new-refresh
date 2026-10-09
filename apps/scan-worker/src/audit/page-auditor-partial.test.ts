import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { audited } from "../testing/auditor-harness.js";
import {
  type CustomAuditor,
  startCustomAuditor,
} from "../testing/custom-auditor.js";
import {
  type HangingServer,
  startHangingServer,
} from "../testing/hanging-server.js";
import {
  type ScriptedResponse,
  SEQUENCE_PATH,
  type SequenceServer,
  startSequenceServer,
} from "../testing/sequence-server.js";

const HTTP_OK = 200;
const HTTP_SERVER_ERROR = 500;
const MISSING_ALT_PAGE =
  '<!doctype html><html lang="en"><title>T</title><main><img src="data:,"></main></html>';

describe("PageAuditor settle wait and partial failures", () => {
  let hanging: HangingServer;
  let sequence: SequenceServer | null = null;
  let custom: CustomAuditor | null = null;

  const auditSequence = async (responses: readonly ScriptedResponse[]) => {
    sequence = await startSequenceServer(responses);
    custom = await startCustomAuditor([hanging.authority, sequence.authority]);
    const url = `${sequence.origin}${SEQUENCE_PATH}`;
    return custom.auditor.audit({ url, isStartPage: true });
  };

  beforeEach(async () => {
    hanging = await startHangingServer();
  });

  afterEach(async () => {
    await custom?.close();
    await sequence?.close();
    await hanging.close();
  });

  it("audits a page whose network never goes idle once the settle wait expires", async () => {
    // GIVEN
    const poll = `<script>fetch("http://${hanging.authority}/poll")</script>`;

    // WHEN
    const result = await auditSequence([
      { status: HTTP_OK, body: `${MISSING_ALT_PAGE}${poll}` },
    ]);

    // THEN
    expect(result.kind).toBe("audited");
  });

  it("keeps the desktop findings when the mobile load fails", async () => {
    // WHEN
    const result = await auditSequence([
      { status: HTTP_OK, body: MISSING_ALT_PAGE },
      { status: HTTP_SERVER_ERROR, body: "" },
    ]);

    // THEN
    const runs = audited(result).findings.axeRuns;
    expect(runs.map((run) => run.viewport)).toEqual(["desktop"]);
  });
});
