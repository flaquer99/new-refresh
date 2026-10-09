import type { ScanErrorCode } from "@refresh/scan-contracts/errors";
import type { PageAuditResult } from "../audit/page-audit-result.js";

export type ScanFailureCode = Extract<
  ScanErrorCode,
  "SITE_UNREACHABLE" | "START_URL_BLOCKED"
>;

const UNREACHABLE_REASONS = new Set(["network-error", "timeout"]);

export class ScanFailedError extends Error {
  readonly code: ScanFailureCode;

  constructor(code: ScanFailureCode, message: string) {
    super(message);
    this.name = "ScanFailedError";
    this.code = code;
  }
}

const unreachable = (url: string) =>
  new ScanFailedError(
    "SITE_UNREACHABLE",
    `We couldn't reach ${new URL(url).hostname}. Check the address and try again.`,
  );

const blocked = () =>
  new ScanFailedError(
    "START_URL_BLOCKED",
    "This address leads to a private or local network and can't be scanned.",
  );

export const assertStartPageReachable = (
  url: string,
  result: PageAuditResult,
): void => {
  if (result.kind !== "failed") {
    return;
  }
  if (result.reason === "blocked-address") {
    throw blocked();
  }
  if (UNREACHABLE_REASONS.has(result.reason)) {
    throw unreachable(url);
  }
};
