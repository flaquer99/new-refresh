import type { Page } from "@playwright/test";
import { CLOSED_ORIGIN, fixtureUrl } from "./ports";
import type { ScanApp } from "./scan-app";
import { SCAN_TIMEOUT_MS } from "./scan-app";
import { ScanHistoryPage } from "./scan-history-page";
import { failureSection, notFoundHeading } from "./scan-link-page";
import { expect } from "./test";

const MISSING_SCAN_ID = "00000000-0000-4000-8000-000000000000";
const REJECTED_URL = "http://localhost:8080/";

export type ViewName =
	| "form"
	| "start-error"
	| "progress"
	| "report"
	| "long-report"
	| "failure"
	| "not-found"
	| "history"
	| "empty-history";

export const VIEW_NAMES: readonly ViewName[] = [
	"form",
	"start-error",
	"progress",
	"report",
	"long-report",
	"failure",
	"not-found",
	"history",
	"empty-history",
];

const openProgress = async (app: ScanApp) => {
	await app.submit({ url: fixtureUrl("/large/"), depth: 1 });
	await expect(app.progressHeading()).toBeVisible();
};

const openFailure = async (app: ScanApp) => {
	await app.submit({ url: `${CLOSED_ORIGIN}/` });
	await expect(failureSection(app.page)).toBeVisible({
		timeout: SCAN_TIMEOUT_MS,
	});
};

const openEmptyHistory = async (page: Page) => {
	await new ScanHistoryPage(page).openPastTheEnd();
	await expect(page.getByText(/No older scans/)).toBeVisible();
};

const openStartError = async (app: ScanApp) => {
	await app.submit({ url: REJECTED_URL });
	await expect(app.alert()).toBeVisible();
};

const openHistory = async (app: ScanApp) => {
	await app.scanToReport({ url: fixtureUrl("/clean/") });
	await new ScanHistoryPage(app.page).open();
};

const openNotFound = async (page: Page) => {
	await page.goto(`/scans/${MISSING_SCAN_ID}`);
	await expect(notFoundHeading(page)).toBeVisible();
};

export const openView = async (app: ScanApp, view: ViewName) => {
	if (view === "start-error") return openStartError(app);
	if (view === "progress") return openProgress(app);
	if (view === "report") {
		return app.scanToReport({ url: fixtureUrl("/report-mix/"), depth: 1 });
	}
	if (view === "long-report") {
		return app.scanToReport({ url: fixtureUrl("/long-selectors/") });
	}
	if (view === "failure") return openFailure(app);
	if (view === "not-found") return openNotFound(app.page);
	if (view === "history") return openHistory(app);
	if (view === "empty-history") return openEmptyHistory(app.page);
};
