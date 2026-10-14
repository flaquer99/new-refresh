import {
  SAMPLE_SCAN_ID,
  SAMPLE_START_URL,
  SAMPLE_STARTED_AT,
} from "./sample-result.js";
import { buildSeedHistory } from "./seed-scans.js";
import {
  OTHER_ORGANIZATION_ID,
  OTHER_USER_ID,
  TEST_ORGANIZATION_ID,
  TEST_OWNER,
} from "./test-owner.js";

export const ALL_ENTRIES = 50;
const NEWEST = new Date("2026-10-09T12:00:00.000Z");
export const OTHER_OWNER = {
  organizationId: OTHER_ORGANIZATION_ID,
  startedByUserId: OTHER_USER_ID,
  startedByName: "Bruno Lima",
};

export const history = (count: number, owner = TEST_OWNER) =>
  buildSeedHistory({
    count,
    newest: NEWEST,
    stepMs: 60_000,
    startUrl: "https://tenant.example.org/",
    owner,
  });

export const ownKey = {
  scanId: SAMPLE_SCAN_ID,
  organizationId: TEST_ORGANIZATION_ID,
};
export const otherKey = {
  scanId: SAMPLE_SCAN_ID,
  organizationId: OTHER_ORGANIZATION_ID,
};

export const runningInput = {
  scanId: SAMPLE_SCAN_ID,
  request: { url: SAMPLE_START_URL, depth: 0 },
  startedAt: SAMPLE_STARTED_AT,
  owner: TEST_OWNER,
};

export const firstPage = (organizationId: string, limit = ALL_ENTRIES) => ({
  organizationId,
  before: null,
  limit,
});
