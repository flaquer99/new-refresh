import type { Viewport } from "@refresh/scan-contracts/findings";
import type {
	PageReason,
	PageResult,
} from "@refresh/scan-contracts/page-result";
import type { ReportOutcome } from "@refresh/scan-contracts/report";

export const VIEWPORT_LABELS: Record<Viewport, string> = {
	desktop: "Desktop (1280 px)",
	mobile: "Mobile (320 px)",
};

export const OUTCOME_LABELS: Record<ReportOutcome, string> = {
	complete: "Complete",
	cancelled: "Partial — cancelled",
	"page-limit-reached": "Limited — page limit reached",
	"time-limit-reached": "Partial — time limit reached",
};

const PAGE_REASON_LABELS: Record<PageReason, string> = {
	"robots-disallowed": "Disallowed by robots.txt",
	"not-html": "Not an HTML page",
	"not-reached": "Not reached before the scan stopped",
	"http-error": "HTTP error",
	timeout: "Timed out while loading",
	"network-error": "Network error",
	"blocked-address": "Points to a private or local network",
};

const SCANNED_LABEL = "Scanned";

export const formatViewports = (viewports: readonly Viewport[]): string =>
	viewports.map((viewport) => VIEWPORT_LABELS[viewport]).join(", ");

export const describePageReason = (page: PageResult): string => {
	if (page.reason === null) {
		return SCANNED_LABEL;
	}
	if (page.reason === "http-error" && page.httpStatus !== null) {
		return `HTTP ${page.httpStatus} error`;
	}
	return PAGE_REASON_LABELS[page.reason];
};
