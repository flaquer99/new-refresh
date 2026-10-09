import type {
  BuildReportInput,
  ScanStopReason,
} from "../report/build-report.js";
import { HOME_URL, homeRuns } from "./axe-fixtures.js";

export const buildReportInput = (
  stopReason: ScanStopReason = "completed",
): BuildReportInput => ({
  scan: {
    startUrl: HOME_URL,
    origin: "https://fixtures.test",
    depth: 1,
    startedAt: "2026-10-09T10:00:00.000Z",
    finishedAt: "2026-10-09T10:01:00.000Z",
  },
  stopReason,
  pages: [
    {
      url: HOME_URL,
      depth: 0,
      status: "scanned",
      reason: null,
      httpStatus: 200,
    },
  ],
  findings: {
    axeRuns: homeRuns(),
    probeMatches: [{ pageUrl: HOME_URL, probeIds: ["media"] }],
  },
});
