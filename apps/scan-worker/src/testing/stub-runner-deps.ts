import { Response } from "undici";
import { vi } from "vitest";
import type { ScanAuditor, ScanRunnerDeps } from "../scans/scan-runner.js";
import { createScanRecorder } from "./scan-logger.js";

const HTTP_NOT_FOUND = 404;

export const STUB_SCAN_ID = "3b241101-e2bb-4255-8caf-4136c566a962";

export const stubRunnerDeps = (
  auditor: ScanAuditor,
  robotsTxt: string | null = null,
): ScanRunnerDeps => ({
  openAuditor: () => Promise.resolve(auditor),
  fetch: vi.fn(() =>
    Promise.resolve(
      robotsTxt === null
        ? new Response("", { status: HTTP_NOT_FOUND })
        : new Response(robotsTxt),
    ),
  ),
  logger: createScanRecorder(),
  pageDelayMs: 0,
});
