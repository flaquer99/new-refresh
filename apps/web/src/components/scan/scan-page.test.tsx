import { screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { stubFetchQueue } from "@/testing/fetch-queue";
import { START_URL } from "@/testing/finding-fixtures";
import {
	advancePoll,
	CREATED,
	installFakeTimersPerTest,
} from "@/testing/polling";
import { buildReport, buildStatus } from "@/testing/report-fixtures";
import { submitScan } from "@/testing/submit-scan";

const RUNNING = buildStatus({
	progress: {
		pagesScanned: 1,
		pagesDiscovered: 3,
		currentUrl: `${START_URL}about`,
	},
});
const COMPLETED = buildStatus({ status: "completed", report: buildReport() });

installFakeTimersPerTest();

describe("ScanPage", () => {
	it("goes from the form to live progress to the report", async () => {
		// GIVEN
		stubFetchQueue([CREATED, { body: RUNNING }, { body: COMPLETED }]);
		await submitScan();

		// WHEN
		await advancePoll();
		const progressText = screen.getByRole("status").textContent;
		await advancePoll();

		// THEN
		expect(progressText).toContain("1 of 3 discovered pages scanned");
		const scanned = screen.getByRole("heading", { name: "Scanned (1)" });
		expect(scanned.nextElementSibling?.textContent).toBe(START_URL);
	});

	it("removes the form while a scan runs", async () => {
		// GIVEN
		stubFetchQueue([CREATED, { body: RUNNING }]);

		// WHEN
		await submitScan();

		// THEN
		expect(screen.queryByLabelText("Website address")).toBeNull();
	});
});
