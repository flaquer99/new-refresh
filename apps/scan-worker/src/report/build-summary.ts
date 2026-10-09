import type {
  ManualCheck,
  ReviewItem,
  Violation,
} from "@refresh/scan-contracts/findings";
import type {
  PageResult,
  PageStatus,
} from "@refresh/scan-contracts/page-result";
import type { ReportSummary } from "@refresh/scan-contracts/report";

export type SummaryInput = {
  violations: readonly Violation[];
  reviewItems: readonly ReviewItem[];
  manualChecks: readonly ManualCheck[];
  pages: readonly PageResult[];
};

const countPages = (pages: readonly PageResult[], status: PageStatus): number =>
  pages.filter((page) => page.status === status).length;

const countBySeverity = (violations: readonly Violation[]) => {
  const counts = { critical: 0, serious: 0, moderate: 0, minor: 0 };
  for (const { severity } of violations) {
    counts[severity] += 1;
  }
  return counts;
};

const countByLevel = (violations: readonly Violation[]) => {
  const counts = { A: 0, AA: 0 };
  for (const { level } of violations) {
    counts[level] += 1;
  }
  return counts;
};

export const buildSummary = ({
  violations,
  reviewItems,
  manualChecks,
  pages,
}: SummaryInput): ReportSummary => ({
  pagesScanned: countPages(pages, "scanned"),
  pagesSkipped: countPages(pages, "skipped"),
  pagesFailed: countPages(pages, "failed"),
  totalViolations: violations.length,
  violationsBySeverity: countBySeverity(violations),
  violationsByLevel: countByLevel(violations),
  needsReviewCount: reviewItems.length + manualChecks.length,
});
