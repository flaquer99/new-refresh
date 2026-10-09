import type { ReportOutcome } from "@refresh/scan-contracts/report";
import type { ReportOutcomeValue } from "./generated/prisma/client.js";

const TO_COLUMN = {
  complete: "complete",
  cancelled: "cancelled",
  "page-limit-reached": "page_limit_reached",
  "time-limit-reached": "time_limit_reached",
} as const satisfies Record<ReportOutcome, ReportOutcomeValue>;

const FROM_COLUMN = {
  complete: "complete",
  cancelled: "cancelled",
  page_limit_reached: "page-limit-reached",
  time_limit_reached: "time-limit-reached",
} as const satisfies Record<ReportOutcomeValue, ReportOutcome>;

export const toOutcomeColumn = (outcome: ReportOutcome): ReportOutcomeValue =>
  TO_COLUMN[outcome];

export const fromOutcomeColumn = (
  value: ReportOutcomeValue | null,
): ReportOutcome | null => (value === null ? null : FROM_COLUMN[value]);
