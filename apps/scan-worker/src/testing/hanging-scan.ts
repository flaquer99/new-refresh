import { expect, vi } from "vitest";
import { createScanRunner } from "../scans/scan-runner.js";
import { hangingAuditor } from "./stub-auditor.js";
import { STUB_SCAN_ID, stubRunnerDeps } from "./stub-runner-deps.js";

export const HANG_START = "https://a.test/";
export const HANG_B = "https://a.test/b";
export const HANG_C = "https://a.test/c";

const SITE = {
  [HANG_START]: { links: [HANG_B, HANG_C] },
  [HANG_B]: {},
  [HANG_C]: {},
};

export const startHangingScan = (hangUrl: string) => {
  const auditor = hangingAuditor(SITE, hangUrl);
  const controller = new AbortController();
  const onProgress = vi.fn();
  const scanning = createScanRunner(stubRunnerDeps(auditor))({
    scanId: STUB_SCAN_ID,
    request: { url: HANG_START, depth: 1 },
    signal: controller.signal,
    onProgress,
  });
  const inFlight = () =>
    vi.waitFor(() =>
      expect(onProgress).toHaveBeenLastCalledWith(
        expect.objectContaining({ currentUrl: hangUrl }),
      ),
    );
  return { auditor, controller, scanning, inFlight };
};
