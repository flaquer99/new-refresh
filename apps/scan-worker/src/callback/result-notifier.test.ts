import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { sampleReport } from "../testing/registry-harness.js";
import { createResultNotifier } from "./result-notifier.js";

const CALLBACK_URL = "http://127.0.0.1:3000/api/internal/scans/";
const TOKEN = "c".repeat(32);
const SCAN_ID = "8f0c6b8e-3a8e-4d0b-9a57-2f5a1d6f4c11";
const RESULT = {
  scanId: SCAN_ID,
  status: "completed" as const,
  report: sampleReport(),
  error: null,
  finishedAt: "2026-10-09T10:05:00.000Z",
};

const respondWith = (...statuses: number[]) => {
  const fetchMock = vi.fn();
  for (const status of statuses) {
    fetchMock.mockResolvedValueOnce(new Response("{}", { status }));
  }
  vi.stubGlobal("fetch", fetchMock);
  return fetchMock;
};

const newNotifier = () => {
  const logger = { info: vi.fn(), warn: vi.fn(), error: vi.fn() };
  const notifier = createResultNotifier({
    url: CALLBACK_URL,
    token: TOKEN,
    logger,
  });
  return { notifier, logger };
};

describe("result notifier delivery", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.unstubAllGlobals();
  });

  it("posts the result to the scan's callback url with the bearer token", async () => {
    // GIVEN
    const fetchMock = respondWith(200);
    const { notifier } = newNotifier();

    // WHEN
    await notifier.notify(RESULT);

    // THEN
    expect(fetchMock).toHaveBeenCalledWith(
      `http://127.0.0.1:3000/api/internal/scans/${SCAN_ID}/result`,
      expect.objectContaining({
        method: "POST",
        headers: expect.objectContaining({ authorization: `Bearer ${TOKEN}` }),
        body: JSON.stringify(RESULT),
      }),
    );
  });

  it.each([200, 404])(
    "reports HTTP %d as delivered after one attempt",
    async (status) => {
      // GIVEN
      const fetchMock = respondWith(status);
      const { notifier } = newNotifier();

      // WHEN
      const outcome = await notifier.notify(RESULT);

      // THEN
      expect([outcome, fetchMock.mock.calls.length]).toEqual(["delivered", 1]);
    },
  );

  it("logs scan.result_delivered with the number of attempts", async () => {
    // GIVEN
    respondWith(200);
    const { notifier, logger } = newNotifier();

    // WHEN
    await notifier.notify(RESULT);

    // THEN
    expect(logger.info).toHaveBeenCalledWith(
      {
        event: "scan.result_delivered",
        scanId: SCAN_ID,
        status: "completed",
        attempts: 1,
      },
      "scan.result_delivered",
    );
  });
});
