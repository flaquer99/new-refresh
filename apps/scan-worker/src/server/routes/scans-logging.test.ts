import { describe, expect, it } from "vitest";
import { createRecordingFastifyLogger } from "../../testing/fastify-logger.js";
import { scanIdFor } from "../../testing/scan-ids.js";
import {
  postScan,
  SERVER_SCAN_ID,
  startTestServer,
  useServerTestClock,
} from "../../testing/server-harness.js";

const ALICE_HASH = "2bd806c97f0e";

describe("POST /scans logging", () => {
  useServerTestClock();

  it("logs scan.started with the origin, depth, and hashed client id", async () => {
    // GIVEN
    const logger = createRecordingFastifyLogger();
    const { app } = startTestServer({ loggerInstance: logger });

    // WHEN
    await postScan(app, "alice");

    // THEN
    expect(logger.info).toHaveBeenCalledWith(
      {
        event: "scan.started",
        scanId: SERVER_SCAN_ID,
        origin: "https://www.example.org",
        depth: 1,
        clientIdHash: ALICE_HASH,
      },
      "scan.started",
    );
  });

  it("logs scan.conflict with a hash of the client id, never the raw id", async () => {
    // GIVEN
    const logger = createRecordingFastifyLogger();
    const { app } = startTestServer({ loggerInstance: logger });
    await postScan(app, "alice");

    // WHEN
    await postScan(app, "alice", scanIdFor(2));

    // THEN
    expect(logger.warn).toHaveBeenCalledWith(
      { event: "scan.conflict", clientIdHash: ALICE_HASH },
      "scan.conflict",
    );
  });

  it("logs capacity.rejected when the global limit is reached", async () => {
    // GIVEN
    const logger = createRecordingFastifyLogger();
    const { app } = startTestServer({ loggerInstance: logger });
    await postScan(app, "alice");
    await postScan(app, "bob");

    // WHEN
    await postScan(app, "carol");

    // THEN
    expect(logger.warn).toHaveBeenCalledWith(
      expect.objectContaining({ event: "capacity.rejected" }),
      "capacity.rejected",
    );
  });
});
