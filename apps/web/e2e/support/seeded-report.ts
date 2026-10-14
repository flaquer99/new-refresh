import type { Page } from "@playwright/test";
import { ReportView } from "./report-view";

export const HIGHLIGHTED = "Element highlighted.";

export const openSeededReport = async (
	page: Page,
	scanPath: string,
): Promise<ReportView> => {
	await page.goto(scanPath);
	return new ReportView(page);
};

export const reviewItemName = (findingId: string): string =>
	`Check the “seed-${findingId}” result`;

export const violationName = (findingId: string): string =>
	`Seeded ${findingId}`;
